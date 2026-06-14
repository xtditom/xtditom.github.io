import * as THREE from "three";

/**
 * FloatingShapes — Wireframe geometric shapes orbiting in 3D space.
 * React to scroll (rotation speed, scale, opacity) and mouse (tilt toward cursor).
 */
export class FloatingShapes {
  constructor() {
    this.group = new THREE.Group();
    this.shapes = [];
    this._createShapes();
  }

  _createShapes() {
    const shapeDefs = [
      { geo: new THREE.IcosahedronGeometry(1.2, 1), pos: [-12, 6, -8], rotSpeed: [0.3, 0.5, 0.1], scrollPhase: 0.0 },
      { geo: new THREE.OctahedronGeometry(0.9, 0),  pos: [14, 3, -12],  rotSpeed: [0.4, 0.2, 0.3], scrollPhase: 0.15 },
      { geo: new THREE.TorusGeometry(1.0, 0.3, 8, 16), pos: [-8, 10, -15], rotSpeed: [0.2, 0.6, 0.15], scrollPhase: 0.3 },
      { geo: new THREE.IcosahedronGeometry(0.7, 0), pos: [10, 8, -6],  rotSpeed: [0.5, 0.3, 0.4], scrollPhase: 0.45 },
      { geo: new THREE.TorusGeometry(0.8, 0.25, 6, 12), pos: [-15, 2, -10], rotSpeed: [0.15, 0.4, 0.25], scrollPhase: 0.6 },
      { geo: new THREE.OctahedronGeometry(1.1, 1),  pos: [6, 12, -18],  rotSpeed: [0.35, 0.15, 0.5], scrollPhase: 0.75 },
      { geo: new THREE.DodecahedronGeometry(0.6, 0), pos: [-5, -1, -5], rotSpeed: [0.25, 0.55, 0.2], scrollPhase: 0.9 },
      { geo: new THREE.TetrahedronGeometry(0.8, 0),  pos: [18, 5, -14], rotSpeed: [0.45, 0.25, 0.35], scrollPhase: 0.1 },
    ];

    shapeDefs.forEach((def) => {
      const material = new THREE.MeshBasicMaterial({
        color: 0xa3e635,
        wireframe: true,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(def.geo, material);
      mesh.position.set(...def.pos);

      // Store metadata on mesh for update loop
      mesh.userData = {
        basePos: new THREE.Vector3(...def.pos),
        rotSpeed: def.rotSpeed,
        scrollPhase: def.scrollPhase,
        baseScale: 0.6 + Math.random() * 0.6,
      };

      this.shapes.push(mesh);
      this.group.add(mesh);
    });
  }

  setTheme(isDark) {
    const color = isDark ? 0xa3e635 : 0x4d7c0f;
    this.shapes.forEach((mesh) => {
      mesh.material.color.set(color);
    });
  }

  update(elapsed, delta, scrollProgress, mouse, scrollVelocity = 0) {
    const absVelocity = Math.abs(scrollVelocity);

    this.shapes.forEach((mesh) => {
      const { rotSpeed, scrollPhase, basePos, baseScale } = mesh.userData;

      // ── Scroll-boosted rotation ──
      const scrollBoost = 1 + scrollProgress * 2 + absVelocity * 4;
      mesh.rotation.x += rotSpeed[0] * delta * scrollBoost;
      mesh.rotation.y += rotSpeed[1] * delta * scrollBoost;
      mesh.rotation.z += rotSpeed[2] * delta * scrollBoost;

      // ── Scroll-driven scale ──
      const targetScale = baseScale * (0.8 + scrollProgress * 1.2 + absVelocity * 0.5);
      mesh.scale.setScalar(mesh.scale.x + (targetScale - mesh.scale.x) * 0.05);

      // ── Scroll-driven opacity (fade in as user scrolls, with phase offset) ──
      const fadeStart = scrollPhase;
      const fadeEnd = Math.min(fadeStart + 0.3, 1.0);
      let opacity;
      if (scrollProgress < fadeStart) {
        opacity = 0.05;
      } else if (scrollProgress < fadeEnd) {
        opacity = 0.05 + ((scrollProgress - fadeStart) / (fadeEnd - fadeStart)) * 0.3;
      } else {
        opacity = 0.35;
      }
      // Velocity flash
      opacity += absVelocity * 0.2;
      mesh.material.opacity = Math.min(opacity, 0.5);

      // ── Gentle orbital float ──
      const floatX = Math.sin(elapsed * 0.3 + scrollPhase * 10) * 1.5;
      const floatY = Math.cos(elapsed * 0.25 + scrollPhase * 8) * 1.0;
      const floatZ = Math.sin(elapsed * 0.2 + scrollPhase * 6) * 1.0;
      mesh.position.x = basePos.x + floatX;
      mesh.position.y = basePos.y + floatY;
      mesh.position.z = basePos.z + floatZ;

      // ── Mouse tilt: nearest shapes lean toward cursor ──
      const mouseWorldX = mouse.x * 15;
      const mouseWorldY = mouse.y * 10;
      const dx = mouseWorldX - mesh.position.x;
      const dy = mouseWorldY - mesh.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20) {
        const influence = (1 - dist / 20) * 0.15;
        mesh.rotation.x += dy * influence * delta;
        mesh.rotation.z += dx * influence * delta;
      }
    });
  }

  dispose() {
    this.shapes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
  }
}
