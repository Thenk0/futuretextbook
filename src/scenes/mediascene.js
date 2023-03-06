import { Scene } from "three";
import * as THREE from "three";
import { OrbitControls } from '../OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export default class MediaScene extends Scene {
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.active = false;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4000);
        this.camera.target = new THREE.Vector3(0, 0, 0);
        this.camera.position.set(0, 0, 10);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(window.innerWidth / window.innerHeight);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.loader = new THREE.TextureLoader();
        const color = 0xffffff;
        const intensity = 1;
        let light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this.scene.add(light);
        light = new THREE.DirectionalLight(color, intensity);
        light.position.set(200, -2, 100);
        this.scene.add(light);
        light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 0, -500);
        this.scene.add(light);
        this.loader3d = new GLTFLoader();
    }
    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.render();
    }

    async load3d(objUrl) {
        if (this.mesh) this.scene.remove(this.mesh);
        this.loader3d.load(objUrl, (function (gltf) {
            this.mesh = gltf.scene;
            this.scene.add(this.mesh);
        }).bind(this));
        this.controls.target.set(0, 2, 0);
        this.camera.position.set(0, 0, 300);
        this.controls.update();
    }

    async loadImage(imgurl) {
        if (this.mesh) this.scene.remove(this.mesh);
        this.loader.load(imgurl, (function (texture) {
            const sphereGeometry = new THREE.SphereGeometry(500, 60, 40)
            const sphereMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            })
            sphereGeometry.scale(-1, 1, 1);
            this.mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            this.scene.add(this.mesh);
            this.mesh.position.set(0, 0, 0)
        }).bind(this))
        this.controls.target.set(0, 0, 0);
        this.camera.position.set(0, 0, 10);
        this.controls.update();
    }

    action() { }

    activate() {
        this.canvas.style.pointerEvents = "auto";
        this.active = true;
        this.render();
        this.renderer.domElement.style.display = "block";
    }

    deactivate() {
        this.canvas.style.pointerEvents = "none";
        this.active = false;
        this.renderer.domElement.style.display = "none";
    }

    _resizeRendererToDisplaySize() {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            this.renderer.setSize(width, height, false);
        }
        return needResize;
    }


    render() {
        if (!this.active) return;
        if (this._resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
        if (this.renderer == null) return;
        this.renderer.render(this.scene, this.camera);
    }
}
