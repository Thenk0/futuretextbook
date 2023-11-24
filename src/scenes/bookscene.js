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
    constructor(canvasId, pdfUrl, page = 0) {
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
        this.loadBook(page);
    }

    loadBook(page = 0) {
        this.book = new Book(this.pdfUrl);
        this.book.loadBook(this.scene, page);
        this.controls.addEventListener(
            "mediastart",
            this.book.playMedia.bind(this.book)
        );
        this.controls.addEventListener(
            'pagedrop', 
            this.stackPage.bind(this)
        )
    }

    stackPage(event) {
        const pageNumber = event.object.page;
        const page = this.book._getPage(pageNumber);
        page.group.position.x = -4;
        page.group.position.y = 3;
        page.group.scale.x = 0.5;
        page.group.scale.y = 0.5;
    }

    activate() {
        this.active = true;
        this.render(0);
        document.getElementById("search-button").style.display = "block";
        this.renderer.domElement.style.display = "block";
        this.renderer.domElement.style.pointerEvents = "all";
        window.keyboardScene.setOutline(this.book.outline);
        this.controls.activate()
        
    }

    deactivate() {
        this.active = false;
        this.renderer.domElement.style.display = "none";
        document.getElementById("search-button").style.display = "none";
        this.renderer.domElement.style.pointerEvents = "none";
        this.controls.deactivate()
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
    
    resetPages(foundPage) {
        this.controls.resetPage();
        for (const page of this.book.pages) {
            for (const child of page.group.children) {
                child.position.z = child.userData.zPosition
                child.renderOrder = child.userData.renderOrder

            }
            page.group.position.x = 0;
            page.group.position.y = 0;
            page.group.scale.x = 1;
            page.group.scale.y = 1;
            if (page.pageNumber < foundPage) {
                page.group.position.x = -4;
                page.group.position.y = 3;
                page.group.scale.x = 0.5;
                page.group.scale.y = 0.5;
            }
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
