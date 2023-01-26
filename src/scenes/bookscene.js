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
    }

    activate() {
        this.active = true;
        const canvas = document.getElementById(this.canvasId);
        this.renderer = new THREE.WebGLRenderer({ canvas });
        const fov = 75;
        const aspect = canvas.width / canvas.height;
        const near = 0.001;
        const far = 10;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.z = 5;
        this.scene = new THREE.Scene();
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this.scene.add(light);
        const makeInstance = (geometry, color, x) => {
            const material = new THREE.MeshPhongMaterial({ color });

            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = x;

            return cube;
        };

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

        this.cubes = [
            makeInstance(geometry, 0x44aa88, 0),
            makeInstance(geometry, 0x8844aa, -2),
            makeInstance(geometry, 0xaa8844, 2),
        ];
        this.controls = new DragControls(
            [],
            this.camera,
            this.renderer.domElement
        );

        this.book = new Book("/book.pdf");
        this.book.loadBook(this.scene);
        this.controls.addEventListener("mediastart", this.book.playMedia.bind(this.book));
        setInterval(this.resetPages.bind(this), 1000);
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

        // this.book.pages.forEach(page => {
        //     page.plane.rotation.y = time * 2;
        // });
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
