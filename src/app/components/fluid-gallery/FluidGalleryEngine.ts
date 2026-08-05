import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shaders";

function isVideoUrl(src: string) {
  return /\.(webm|mp4|ogg|mov)(\?.*)?$/i.test(src);
}

type EngineOpts = {
  canvas: HTMLCanvasElement;
  slides: string[];
  current?: number;
  onReady?: () => void;
};

export class FluidGalleryEngine {
  private _canvas: HTMLCanvasElement;
  private _textures: THREE.Texture[];
  private _videos: (HTMLVideoElement | null)[];
  private _time = 0;
  private _speed = 0;
  private _position: number;
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.PerspectiveCamera;
  private _material: THREE.ShaderMaterial;
  private _plane: THREE.Mesh;
  private _scene: THREE.Scene;
  private _readyCount = 0;
  private _onReady?: () => void;
  private _disposed = false;

  private _targetIndex: number;
  private _lastScrollTime = 0;

  constructor(opts: EngineOpts) {
    const { canvas, slides, current = 0, onReady } = opts;
    const { width, height } = canvas;

    this._canvas = canvas;
    this._position = current;
    this._targetIndex = current;
    this._onReady = onReady;
    this._videos = [];

    this._renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this._renderer.setClearColor(0x000000, 1);
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;

    this._camera = new THREE.PerspectiveCamera(70, width / Math.max(height, 1), 0.001, 100);
    this._camera.position.set(0, 0, 1);

    this._textures = slides.map((src, idx) => this._initTexture(src, idx === current));

    this._material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        pixels: { value: new THREE.Vector2(width, height) },
        accel: { value: new THREE.Vector2(0.5, 2) },
        progress: { value: 0 },
        uvRate1: { value: new THREE.Vector2(1, 1) },
        texture1: { value: this._textures[this.currentSlideIndex] },
        texture2: { value: this._textures[this.nextSlideIndex] },
      },
    });

    this._plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this._material);
    this._scene = new THREE.Scene();
    this._scene.add(this._plane);

    this.resize();

    // Stagger preload = "auto" so videos load slowly in the background 
    // after the initial images and main thread are settled.
    setTimeout(() => {
      let delay = 0;
      this._videos.forEach((v) => {
        if (v && !this._disposed) {
          setTimeout(() => {
            if (!this._disposed && v.preload !== "auto") {
              v.preload = "auto";
            }
          }, delay);
          delay += 1200; // Load one video every 1.2s in the background
        }
      });
    }, 3000); // Start background loading 3s after mount
  }

  private _markReady = () => {
    this._readyCount += 1;
    if (this._readyCount >= 1 && this._onReady) {
      this._onReady();
      this._onReady = undefined;
    }
  };

  private _initTexture = (src: string, isInitial: boolean): THREE.Texture => {
    if (isVideoUrl(src)) {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = isInitial ? "auto" : "metadata";
      video.crossOrigin = "anonymous";
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");

      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;

      if (isInitial) {
        const onCanPlay = () => this._markReady();
        video.addEventListener("canplay", onCanPlay, { once: true });
        // fallback just in case canplay gets stuck
        video.addEventListener("loadeddata", () => {
          setTimeout(onCanPlay, 500);
        }, { once: true });
      }

      video.src = src;

      this._videos.push(video);
      return texture;
    }

    const loader = new THREE.TextureLoader();
    const texture = loader.load(src, () => {
      if (isInitial) this._markReady();
    });
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    this._videos.push(null);
    return texture;
  };

  get currentSlideIndex() {
    const n = this._textures.length;
    if (n === 0) return 0;
    return ((Math.floor(this._position) % n) + n) % n;
  }

  get nextSlideIndex() {
    const n = this._textures.length;
    if (n === 0) return 0;
    return (this.currentSlideIndex + 1) % n;
  }

  // active slide index reported to html UI based on rounded position
  get activeIndex() {
    const n = this._textures.length;
    if (n === 0) return 0;
    return ((Math.round(this._position) % n) + n) % n;
  }

  get position() {
    return this._position;
  }

  // trigger single slide advance per mouse movement
  onScroll(deltaY: number) {
    if (Math.abs(deltaY) < 0.1) return;

    const now = Date.now();
    if (now - this._lastScrollTime < 320) return;
    this._lastScrollTime = now;

    const n = this._textures.length;
    if (n === 0) return;

    if (deltaY > 0) {
      this._targetIndex = (this._targetIndex + 1) % n;
    } else if (deltaY < 0) {
      this._targetIndex = (this._targetIndex - 1 + n) % n;
    }
  }

  // nudge toward previous or next slide index
  step(dir: 1 | -1) {
    const n = this._textures.length;
    if (n === 0) return;
    this._targetIndex = (this._targetIndex + dir + n) % n;
  }

  resize() {
    if (this._disposed) return;
    const width = this._canvas.clientWidth || this._canvas.width;
    const height = this._canvas.clientHeight || this._canvas.height;
    if (!width || !height) return;

    this._canvas.width = width;
    this._canvas.height = height;
    this._renderer.setSize(width, height, false);
    this._camera.aspect = width / height;

    // calculate 16:9 cover aspect ratio scaling to prevent videos from zooming in
    const canvasAspect = width / height;
    const imageAspect = 16 / 9;
    if (canvasAspect > imageAspect) {
      this._material.uniforms.uvRate1.value.set(1.0, imageAspect / canvasAspect);
    } else {
      this._material.uniforms.uvRate1.value.set(canvasAspect / imageAspect, 1.0);
    }

    this._material.uniforms.pixels.value.set(width, height);

    const dist = this._camera.position.z - this._plane.position.z;
    this._camera.fov = 2 * (180 / Math.PI) * Math.atan(1.0 / (2 * dist));
    this._plane.scale.x = width / height;
    this._camera.updateProjectionMatrix();
  }

  update() {
    if (this._disposed) return;

    this._time += 0.05;
    this._material.uniforms.time.value = this._time;

    const n = this._textures.length;
    if (n === 0) return;

    // shortest angular distance interpolation to target slide position over ~400ms
    let dist = this._targetIndex - this._position;
    if (dist > n / 2) dist -= n;
    if (dist < -n / 2) dist += n;

    // smooth step factor tuned to 0.095 for crisp transition pacing
    this._position += dist * 0.095;

    // snap threshold to eliminate exponential lerp decay tail and instant-settle texture UVs
    if (Math.abs(dist) < 0.012) {
      this._position = this._targetIndex;
    }

    if (this._position < 0) this._position += n;
    if (this._position >= n) this._position -= n;

    const currentIdx = ((Math.floor(this._position) % n) + n) % n;
    const nextIdx = (currentIdx + 1) % n;
    const progress = this._position - Math.floor(this._position);

    this._material.uniforms.progress.value = progress;
    this._material.uniforms.texture1.value = this._textures[currentIdx];
    this._material.uniforms.texture2.value = this._textures[nextIdx];

    // Optimize video memory and CPU by only playing active/target videos
    const target = this._targetIndex;

    this._videos.forEach((v, i) => {
      if (!v) return;
      
      // Keep playing if it's currently rendering (currentIdx/nextIdx) or if it's our target destination
      const isNeeded = i === currentIdx || i === nextIdx || i === target;
      
      if (isNeeded) {
        if (v.paused) {
          const p = v.play();
          if (p) p.catch(() => undefined);
        }
      } else {
        if (!v.paused) {
          v.pause();
        }
      }
    });
  }

  render() {
    if (this._disposed) return;
    this._renderer.render(this._scene, this._camera);
  }

  dispose() {
    this._disposed = true;
    this._videos.forEach((v) => {
      if (!v) return;
      v.pause();
      v.removeAttribute("src");
      v.load();
    });
    this._textures.forEach((t) => t.dispose());
    this._material.dispose();
    this._plane.geometry.dispose();
    this._renderer.dispose();
  }
}
