import * as THREE from "three";

export default class Page {
    constructor(book, pageNumber) {
        this.book = book;
        this.pageNumber = pageNumber;
        this.page = null;
        this.plane = new THREE.PlaneGeometry(1, 1);
        this.scale = 1;
    }

    async loadPage() {
        this.page = await this.book.getPage(this.pageNumber);
        this.viewport = this.page.getViewport({ scale: 1 });
        const bitmap = document.createElement("canvas");
        bitmap.width = this.viewport.width;
        bitmap.height = this.viewport.height;
        const canvasContext = bitmap.getContext("2d");
        this.renderContext = {
            canvasContext,
            viewport: this.viewport,
        };

        await this.page.render(this.renderContext);
        const texture = new THREE.Texture(bitmap);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
        });
        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(bitmap.width / 200, bitmap.height / 200),
            material
        );
        this.plane.position.x = 0;
        this.plane.material.side = THREE.DoubleSide;
        this.plane.material.map.needsUpdate = true;
    }
}
