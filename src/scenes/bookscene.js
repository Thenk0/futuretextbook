import Scene from "./scene";
import * as THREE from "three";
import DragControls from "../drag-controls";
import Book from "../book/book";
export default class BookScene extends Scene {
    pdfUrl = "";
    camera = null;
    renderer = null;
    scene = null;
    cubes = [];
    constructor(canvasId, pdfUrl) {
        super(canvasId);
        this.canvasId = canvasId;
        this.pdfUrl = pdfUrl;
        const canvas = document.getElementById(this.canvasId);
        this.renderer = new THREE.WebGLRenderer({ canvas });
        const fov = 75;
        const aspect = canvas.width / canvas.height;
        const near = 0.001;
        const far = 10;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.x = 1;
        this.camera.position.y = 1;
        this.camera.position.z = 5;
        this.scene = new THREE.Scene();
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this.scene.add(light);
        this.controls = new DragControls(
            [],
            this.camera,
            this.renderer.domElement
        );
        this.book = new Book("/pages.pdf");
        this.book.loadBook(this.scene);
        this.controls.addEventListener(
            "mediastart",
            this.book.playMedia.bind(this.book)
        );
    }

    activate() {
        this.active = true;
        this.render(0);
        this.renderer.domElement.style.display = "block";
    }

    deactivate() {
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
    resetPages() {
        for (const page of this.book.pages) {
            // Фикс инициализации
            page.plane.material.map.needsUpdate = true;
        }
    }
    render(time) {
        if (!this.active) return;
        time *= 0.001;
        time;
        this.book.pages.forEach((page) => {
            page.group.children.forEach((child) => {
                if (!("mediaType" in child.userData)) return;
                if (!child.userData.playing) return;
                child.material.map.needsUpdate = true;
            });
        });
        if (this.book.pages.length != this.controls.objects.length) {
            this.controls.objects = this.book.pages.map((page) => page.group);
        }
        if (this._resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        if (this.renderer == null) return;
        this.renderer.render(this.scene, this.camera);
    }
}
