import * as THREE from "three";

/**
 * Cyber Grid — Neon-lit grid plane with time-based pulse waves,
 * mouse-following glow, and mouse-proximity ripple.
 * Single mesh, no scroll coupling on waves.
 */
export class CyberGrid {
  constructor() {
    this.group = new THREE.Group();
    this._createGrid();
    this._createGlowSpot();
  }

  _createGrid() {
    const gridGeo = new THREE.PlaneGeometry(200, 200, 80, 80);
    const gridMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xa3e635) },
        uOpacity: { value: 0.2 },
        uMouseWorld: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uMouseWorld;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying float vDisplacement;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);

          // ── Time-only terrain waves (no scroll) ──
          float dist = length(worldPos.xz);
          float wave1 = sin(worldPos.x * 0.15 + uTime * 0.5) * 1.0;
          float wave2 = cos(worldPos.z * 0.12 + uTime * 0.3) * 0.7;
          float wave3 = sin(dist * 0.08 - uTime * 1.5) * 0.8;

          // ── Mouse ripple (smooth, gentle) ──
          float mouseDist = length(worldPos.xz - uMouseWorld.xz);
          float mouseRipple = sin(mouseDist * 0.6 - uTime * 1.8) * smoothstep(15.0, 0.0, mouseDist) * 0.6;

          float displacement = (wave1 + wave2 + wave3 + mouseRipple) * smoothstep(90.0, 10.0, dist);
          worldPos.y += displacement;
          vDisplacement = displacement;

          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform vec3 uMouseWorld;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying float vDisplacement;

        float gridLine(float coord, float lineWidth) {
          float grid = abs(fract(coord - 0.5) - 0.5);
          return 1.0 - smoothstep(0.0, lineWidth, grid);
        }

        void main() {
          float scale = 2.0;
          float lineWidth = 0.03;

          float gridX = gridLine(vWorldPos.x * scale, lineWidth);
          float gridZ = gridLine(vWorldPos.z * scale, lineWidth);
          float grid = max(gridX, gridZ);

          // Distance fade
          float dist = length(vWorldPos.xz);
          float fade = 1.0 - smoothstep(10.0, 80.0, dist);

          // Time-only pulse wave
          float waveDist = length(vWorldPos.xz);
          float wave = sin(waveDist * 0.5 - uTime * 2.0) * 0.5 + 0.5;
          wave = smoothstep(0.3, 0.7, wave) * 0.3;

          // Mouse glow
          float mouseDist = length(vWorldPos.xz - uMouseWorld.xz);
          float mouseGlow = smoothstep(8.0, 0.5, mouseDist) * 0.6;

          // Displacement glow
          float dispGlow = abs(vDisplacement) * 0.12;

          float alpha = grid * fade * uOpacity + wave * fade * 0.05 + mouseGlow * grid * fade + dispGlow * grid * fade;

          vec3 finalColor = uColor;
          finalColor += mouseGlow * vec3(0.2, 0.4, 0.0);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    this.gridMesh = new THREE.Mesh(gridGeo, gridMat);
    this.gridMesh.rotation.x = -Math.PI / 2;
    this.gridMesh.position.y = -2;
    this.group.add(this.gridMesh);
  }

  _createGlowSpot() {
    const glowGeo = new THREE.CircleGeometry(6, 32);
    const glowMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(0xa3e635) },
        uIntensity: { value: 0.15 },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - 0.5) * 2.0;
          float pulse = 1.0 + sin(uTime * 3.0) * 0.2;
          float alpha = smoothstep(1.0, 0.0, dist) * uIntensity * pulse;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    this.glowSpot = new THREE.Mesh(glowGeo, glowMat);
    this.glowSpot.rotation.x = -Math.PI / 2;
    this.glowSpot.position.y = -1.97;
    this.group.add(this.glowSpot);
  }

  setTheme(isDark) {
    const color = isDark ? 0xa3e635 : 0x4d7c0f;
    const opacity = isDark ? 0.2 : 0.12;
    this.gridMesh.material.uniforms.uColor.value.set(color);
    this.gridMesh.material.uniforms.uOpacity.value = opacity;
    this.glowSpot.material.uniforms.uColor.value.set(color);
    this.glowSpot.material.uniforms.uIntensity.value = isDark ? 0.2 : 0.1;
  }

  update(elapsed, delta, scrollProgress, mouse, scrollVelocity = 0) {
    this.gridMesh.material.uniforms.uTime.value = elapsed;

    // Project mouse onto grid plane
    const mouseWorldX = mouse.x * 15;
    const mouseWorldZ = -mouse.y * 10 + 5;
    this.gridMesh.material.uniforms.uMouseWorld.value.set(mouseWorldX, 0, mouseWorldZ);

    // Glow spot follows mouse
    this.glowSpot.material.uniforms.uTime.value = elapsed;
    this.glowSpot.position.x += (mouseWorldX - this.glowSpot.position.x) * 0.08;
    this.glowSpot.position.z += (mouseWorldZ - this.glowSpot.position.z) * 0.08;
  }

  dispose() {
    this.gridMesh.geometry.dispose();
    this.gridMesh.material.dispose();
    this.glowSpot.geometry.dispose();
    this.glowSpot.material.dispose();
  }
}
