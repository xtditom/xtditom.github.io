import * as THREE from "three";

/**
 * DataStreams — Vertical light beams pulsing with scroll,
 * like data flowing through fibre optic cables.
 */
export class DataStreams {
  constructor() {
    this.group = new THREE.Group();
    this.beams = [];
    this._createBeams();
  }

  _createBeams() {
    const beamDefs = [
      { x: -20, z: -15, baseH: 8,  color: 0xa3e635, phase: 0.0 },
      { x: -10, z: -20, baseH: 12, color: 0x22d3ee, phase: 0.2 },
      { x:   5, z: -25, baseH: 10, color: 0xa3e635, phase: 0.4 },
      { x:  15, z: -18, baseH: 14, color: 0x8b5cf6, phase: 0.6 },
      { x:  25, z: -12, baseH: 9,  color: 0x22d3ee, phase: 0.8 },
      { x: -25, z: -8,  baseH: 7,  color: 0x8b5cf6, phase: 0.1 },
      { x:   0, z: -30, baseH: 11, color: 0xa3e635, phase: 0.5 },
      { x:  20, z: -5,  baseH: 6,  color: 0x22d3ee, phase: 0.3 },
      { x: -15, z: -28, baseH: 13, color: 0x8b5cf6, phase: 0.7 },
      { x:  10, z: -10, baseH: 8,  color: 0xa3e635, phase: 0.9 },
    ];

    beamDefs.forEach((def) => {
      const beamGroup = new THREE.Group();
      beamGroup.position.set(def.x, -2, def.z);

      // Main beam — tall thin cylinder
      const geo = new THREE.CylinderGeometry(0.04, 0.04, 1, 6, 1);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uColor: { value: new THREE.Color(def.color) },
          uTime: { value: 0 },
          uPhase: { value: def.phase },
          uScrollProgress: { value: 0 },
          uScrollVelocity: { value: 0 },
          uHeight: { value: def.baseH },
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uPhase;
          uniform float uScrollProgress;
          uniform float uScrollVelocity;
          uniform float uHeight;
          varying float vY;
          varying float vPulse;

          void main() {
            vec3 pos = position;

            // Scale height based on scroll
            float scrollHeight = uHeight * (0.3 + uScrollProgress * 1.2);
            scrollHeight += abs(uScrollVelocity) * 3.0;
            pos.y *= scrollHeight;
            pos.y += scrollHeight * 0.5; // anchor at bottom

            // Slight sway
            pos.x += sin(uTime * 0.8 + uPhase * 6.28 + pos.y * 0.3) * 0.1;
            pos.z += cos(uTime * 0.6 + uPhase * 4.0 + pos.y * 0.2) * 0.08;

            vY = pos.y / max(scrollHeight, 0.1);

            // Data pulse traveling up
            float pulsePos = fract(uTime * 0.4 + uPhase);
            vPulse = smoothstep(0.0, 0.1, abs(vY - pulsePos)) > 0.5 ? 0.0 : 1.0;
            vPulse = 1.0 - smoothstep(0.0, 0.15, abs(vY - pulsePos));

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uTime;
          uniform float uScrollProgress;
          uniform float uScrollVelocity;
          varying float vY;
          varying float vPulse;

          void main() {
            // Fade at top and bottom
            float edgeFade = smoothstep(0.0, 0.1, vY) * smoothstep(1.0, 0.85, vY);

            // Base glow
            float baseAlpha = 0.08 + uScrollProgress * 0.12;

            // Pulse brightness
            float pulseAlpha = vPulse * 0.5;

            // Velocity boost
            float velocityBoost = abs(uScrollVelocity) * 0.3;

            float alpha = (baseAlpha + pulseAlpha + velocityBoost) * edgeFade;

            // Brighten core
            vec3 color = uColor + vPulse * vec3(0.3, 0.3, 0.3);

            gl_FragColor = vec4(color, alpha);
          }
        `,
      });

      const beam = new THREE.Mesh(geo, mat);
      beamGroup.add(beam);

      // Small glowing base orb
      const orbGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const orbMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.y = 0;
      beamGroup.add(orb);

      beamGroup.userData = {
        phase: def.phase,
        baseH: def.baseH,
        mat: mat,
        orbMat: orbMat,
      };

      this.beams.push(beamGroup);
      this.group.add(beamGroup);
    });
  }

  setTheme(isDark) {
    // Beams have fixed colors per-instance, but adjust base intensity
    this.beams.forEach((beam) => {
      const factor = isDark ? 1.0 : 0.5;
      beam.userData.orbMat.opacity = 0.3 * factor;
    });
  }

  update(elapsed, delta, scrollProgress, mouse, scrollVelocity = 0) {
    this.beams.forEach((beamGroup) => {
      const { mat, orbMat, phase } = beamGroup.userData;
      const uniforms = mat.uniforms;

      uniforms.uTime.value = elapsed;
      uniforms.uScrollProgress.value = scrollProgress;
      uniforms.uScrollVelocity.value = scrollVelocity;

      // Orb pulse
      orbMat.opacity = 0.2 + Math.sin(elapsed * 2 + phase * 10) * 0.15 + Math.abs(scrollVelocity) * 0.3;
    });
  }

  dispose() {
    this.beams.forEach((beamGroup) => {
      beamGroup.children.forEach((child) => {
        child.geometry.dispose();
        child.material.dispose();
      });
    });
  }
}
