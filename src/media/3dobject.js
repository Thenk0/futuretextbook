// import * as THREE from "three";
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export default class Object3D {
    mediaScene = window.mediaScene;
    mediaCanvas = null;
    constructor(url, preview) {
        this.url = url;
        this.preview = preview
        this.mediaCanvas = new OffscreenCanvas(1280, 720);
        this.mediaCtx = this.mediaCanvas.getContext("2d");
        // this.canvas3d = new OffscreenCanvas(1280, 720);
        // this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3d });
        // const fov = 75;
        // const aspect = this.canvas3d.width / this.canvas3d.height;
        // const near = 0.001;
        // const far = 10;
        // this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        // this.camera.position.z = 400;
        // this.scene = new THREE.Scene();
        // const color = 0xffffff; 
        // const intensity = 1;
        // let light = new THREE.DirectionalLight(color, intensity);
        // light.position.set(-1, 2, 4);
        // this.scene.add(light);
        // light = new THREE.DirectionalLight(color, intensity);
        // light.position.set(200, -2, 100);
        // this.scene.add(light);
        // light = new THREE.DirectionalLight(color, intensity);
        // light.position.set(0, 0, -500);
        // this.scene.add(light);
        // this.render()
    }

    setLoaded(state) {
        this.loaded = state;
    }

    async load() {
        function loadImage(url) {
            return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
        }
        this.image = await loadImage(this.preview);
        this.render();
        // const loader3d = new GLTFLoader();
        // loader3d.load(this.url, (function (gltf) {
        //     const mesh = gltf.scene;
        //     this.scene.add(mesh);
        // }).bind(this));
    }
    
    async play() {
        this.mediaScene.load3d(this.url);
        this.mediaScene.activate();
        window.bookScene.deactivate();
    }

    drawThumbnail() {
        this.mediaCtx.drawImage(
            this.image,
            0,
            0,
            this.mediaCanvas.width,
            this.mediaCanvas.height
        );
        // this.renderer.render(this.scene, this.camera);
        // this.mediaCtx.drawImage(this.canvas3d,0,0);
    }

    render() {
        this.drawThumbnail();
        requestAnimationFrame(this.render.bind(this));
    }

}
