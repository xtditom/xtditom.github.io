import * as THREE from "three";

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.timer = new THREE.Timer();
    this.objects = [];
    this.mouse = new THREE.Vector2(0, 0);
    this.scrollProgress = 0;
    this.scrollVelocity = 0;
    this._prevScrollProgress = 0;
    this.isDark = document.documentElement.classList.contains("dark");

    // Smooth targets for camera
    this._camTargetX = 0;
    this._camTargetY = 5;
    this._camTargetZ = 15;

    this._initRenderer();
    this._initCamera();
    this._initLighting();
    this._initFog();
    this._onResize = this._onResize.bind(this);
    window.addEventListener("resize", this._onResize);
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);
  }

  _initLighting() {
    // Ambient light for base visibility
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambient);

    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);

    // Accent point light (lime glow from above)
    this.accentLight = new THREE.PointLight(0xa3e635, 1.5, 50);
    this.accentLight.position.set(0, 8, 5);
    this.scene.add(this.accentLight);

    // Secondary accent (subtle blue fill)
    const fillLight = new THREE.PointLight(0x3b82f6, 0.4, 40);
    fillLight.position.set(-10, 5, -5);
    this.scene.add(fillLight);

    // Tertiary accent (cyan, shifts with scroll)
    this.scrollLight = new THREE.PointLight(0x22d3ee, 0.0, 60);
    this.scrollLight.position.set(10, 3, -10);
    this.scene.add(this.scrollLight);
  }

  _initFog() {
    // Subtle depth fog — shifts density with scroll
    this.scene.fog = new THREE.FogExp2(0x000000, 0.008);
  }

  addObject(obj) {
    this.objects.push(obj);
    if (obj.mesh) this.scene.add(obj.mesh);
    if (obj.group) this.scene.add(obj.group);
  }

  setScrollProgress(progress) {
    this._prevScrollProgress = this.scrollProgress;
    this.scrollProgress = progress;
  }

  setTheme(isDark) {
    this.isDark = isDark;
    this.scene.fog.color.set(isDark ? 0x000000 : 0xffffff);
    this.objects.forEach((obj) => {
      if (obj.setTheme) obj.setTheme(isDark);
    });
  }

  update() {
    // THREE.Timer: call update() each frame, then read elapsed & delta
    this.timer.update();
    const elapsed = this.timer.getElapsed();
    const delta = this.timer.getDelta();

    // ── Scroll velocity (smoothed) ──
    const rawVelocity = (this.scrollProgress - this._prevScrollProgress) / Math.max(delta, 0.001);
    this.scrollVelocity += (rawVelocity - this.scrollVelocity) * 0.1;

    // ── Scroll-driven camera parallax ──
    // Camera pushes forward as user scrolls, creating depth progression
    this._camTargetZ = 15 - this.scrollProgress * 6;
    // Camera Y descends slightly as user scrolls deeper
    this._camTargetY = 5 - this.scrollProgress * 2;
    // Mouse-driven camera X and Y offset
    this._camTargetX = this.mouse.x * 1.2;
    const mouseYOffset = this.mouse.y * 0.6;

    // Smooth interpolation
    this.camera.position.x += (this._camTargetX - this.camera.position.x) * 0.03;
    this.camera.position.y += ((this._camTargetY + mouseYOffset) - this.camera.position.y) * 0.03;
    this.camera.position.z += (this._camTargetZ - this.camera.position.z) * 0.03;

    // Look-at shifts with scroll for parallax feel
    const lookY = -this.scrollProgress * 1.5;
    this.camera.lookAt(0, lookY, 0);

    // ── Accent light follows mouse subtly ──
    this.accentLight.position.x = this.mouse.x * 5;
    this.accentLight.position.z = 5 + this.mouse.y * 3;

    // ── Scroll light intensity ──
    this.scrollLight.intensity = Math.abs(this.scrollVelocity) * 2;
    this.scrollLight.position.x = Math.sin(elapsed * 0.5) * 10;

    // ── Fog density shifts with scroll ──
    this.scene.fog.density = 0.006 + this.scrollProgress * 0.006;

    // ── Scroll-driven scene rotation (180° over full page scroll) ──
    const targetRotationY = this.scrollProgress * Math.PI;
    this.scene.rotation.y += (targetRotationY - this.scene.rotation.y) * 0.05;

    // ── Update all scene objects ──
    this.objects.forEach((obj) => {
      if (obj.update) {
        obj.update(elapsed, delta, this.scrollProgress, this.mouse, this.scrollVelocity);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  destroy() {
    window.removeEventListener("resize", this._onResize);
    this.renderer.dispose();
    this.objects.forEach((obj) => {
      if (obj.dispose) obj.dispose();
    });
  }
}
