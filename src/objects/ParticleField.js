import * as THREE from "three";

/**
 * ParticleField — Clean ambient data particles floating in 3D space.
 * Mouse repulsion, scroll-driven dispersion and color shift,
 * velocity turbulence. No connection lines.
 */
export class ParticleField {
  constructor(count = 350) {
    this.count = count;
    this.group = new THREE.Group();

    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);
    this.seeds = new Float32Array(count);

    this._initParticles();
    this._createPoints();
  }

  _initParticles() {
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      // Spread in a wide volume
      this.positions[i3] = (Math.random() - 0.5) * 60;
      this.positions[i3 + 1] = Math.random() * 22 - 3;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 60;

      this.velocities[i3] = (Math.random() - 0.5) * 0.006;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.003;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.006;

      this.sizes[i] = Math.random() * 2.5 + 0.8;
      this.seeds[i] = Math.random() * Math.PI * 2;
    }
  }

  _createPoints() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3),
    );
    geometry.setAttribute("aSize", new THREE.BufferAttribute(this.sizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(this.seeds, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uScrollVelocity: { value: 0 },
        uColor: { value: new THREE.Color(0xa3e635) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aSeed;
        uniform float uTime;
        uniform float uScrollProgress;
        uniform float uScrollVelocity;
        uniform float uPixelRatio;
        varying float vOpacity;
        varying float vGlow;

        void main() {
          vec3 pos = position;

          // ── Gentle organic float ──
          pos.y += sin(uTime * 0.4 + pos.x * 0.3 + aSeed) * 0.3;
          pos.x += cos(uTime * 0.3 + pos.z * 0.2 + aSeed) * 0.15;
          pos.z += sin(uTime * 0.25 + pos.y * 0.15 + aSeed * 2.0) * 0.15;

          // ── Scroll velocity turbulence ──
          float turbulence = abs(uScrollVelocity) * 0.6;
          pos.x += sin(uTime * 2.0 + aSeed * 6.28) * turbulence;
          pos.y += cos(uTime * 1.5 + aSeed * 4.0) * turbulence;
          pos.z += sin(uTime * 1.8 + aSeed * 5.0 + 1.0) * turbulence;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          // ── Dynamic size: breathe + velocity pulse ──
          vGlow = 0.5 + 0.5 * sin(uTime * 1.8 + aSeed * 5.0);
          float breathe = 1.0 + (vGlow - 0.5) * 0.45;
          float velocityPulse = 1.0 + abs(uScrollVelocity) * 0.4;
          float sizeFactor = aSize * breathe * velocityPulse * uPixelRatio * (200.0 / -mvPosition.z);
          gl_PointSize = clamp(sizeFactor, 1.0, 18.0);

          // ── Opacity ──
          float dist = length(pos);
          vOpacity = smoothstep(45.0, 5.0, dist) * (0.4 + abs(uScrollVelocity) * 0.3);
          vOpacity = clamp(vOpacity, 0.1, 0.85);

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vOpacity;
        varying float vGlow;

        void main() {
          float dist = length(gl_PointCoord - 0.5);
          if (dist > 0.5) discard;

          // Pulse the core glow intensity and outer edge alpha to make it feel like it's pulsing
          float alpha = smoothstep(0.5, 0.05, dist) * vOpacity * (0.6 + 0.4 * vGlow);

          // Core glow
          float core = smoothstep(0.25, 0.0, dist) * (0.3 + 0.7 * vGlow);
          vec3 color = uColor + core * vec3(0.4);

          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    this.points = new THREE.Points(geometry, material);
    this.group.add(this.points);
  }

  setTheme(isDark) {
    const color = isDark ? 0xa3e635 : 0x4d7c0f;
    this.points.material.uniforms.uColor.value.set(color);
  }

  updateAccentColor(color) {
    this.points.material.uniforms.uColor.value.copy(color);
  }

  update(elapsed, delta, scrollProgress, mouse, scrollVelocity = 0) {
    const uniforms = this.points.material.uniforms;
    uniforms.uTime.value = elapsed;
    uniforms.uScrollProgress.value = scrollProgress;
    uniforms.uScrollVelocity.value = scrollVelocity;

    const pos = this.points.geometry.attributes.position.array;
    const mouseWorldX = mouse.x * 15;
    const mouseWorldZ = -mouse.y * 10;
    const repulseRadius = 8;
    const repulseStrength = 0.12;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Drift
      pos[i3] += this.velocities[i3];
      pos[i3 + 1] += this.velocities[i3 + 1];
      pos[i3 + 2] += this.velocities[i3 + 2];

      // ── Mouse repulsion ──
      const dx = pos[i3] - mouseWorldX;
      const dz = pos[i3 + 2] - mouseWorldZ;
      const mouseDist = Math.sqrt(dx * dx + dz * dz);
      if (mouseDist < repulseRadius && mouseDist > 0.1) {
        const force = (1 - mouseDist / repulseRadius) * repulseStrength;
        pos[i3] += (dx / mouseDist) * force;
        pos[i3 + 2] += (dz / mouseDist) * force;
      }

      // ── Scroll velocity turbulence (CPU side) ──
      const turbFactor = Math.abs(scrollVelocity) * 0.015;
      this.velocities[i3] += (Math.random() - 0.5) * turbFactor;
      this.velocities[i3 + 1] += (Math.random() - 0.5) * turbFactor * 0.5;
      this.velocities[i3 + 2] += (Math.random() - 0.5) * turbFactor;

      // Dampen
      this.velocities[i3] *= 0.998;
      this.velocities[i3 + 1] *= 0.998;
      this.velocities[i3 + 2] *= 0.998;

      // ── Soft boundary spring ──
      if (Math.abs(pos[i3]) > 35) pos[i3] *= 0.99;
      if (pos[i3 + 1] > 20) pos[i3 + 1] *= 0.99;
      if (pos[i3 + 1] < -3) pos[i3 + 1] *= 0.99;
      if (Math.abs(pos[i3 + 2]) > 35) pos[i3 + 2] *= 0.99;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
