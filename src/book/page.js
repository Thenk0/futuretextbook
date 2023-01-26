import * as THREE from "three";
import Video from "../media/video";
import MediaTypes from "../MediaTypes";
import { percentage } from "../utilities";

export default class Page {
    mediaInfo = null;
    constructor(book, pageNumber) {
        this.book = book;
        this.pageNumber = pageNumber;
        this.page = null;
        this.plane = new THREE.PlaneGeometry(1, 1);
        this.scale = 1;
        this.group = new THREE.Group();
        this.media = [];
    }

    async loadPage() {
        this.page = await this.book.getPage(this.pageNumber);
        this.viewport = this.page.getViewport({ scale: 1.5 });
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
        this.plane.position.x = 1;
        this.plane.position.y = 1;
        this.plane.material.side = THREE.DoubleSide;
        this.plane.material.map.needsUpdate = true;
        this.plane.renderOrder = this.pageNumber * -2;
        this.plane.userData = {
            pageNumber: this.pageNumber,
        };
        this.group.add(this.plane);
    }

    _initVideo(mediaObject) {
        const video = new Video(mediaObject.url);
        video.load();
        // array.push() Возвращает новую длину массива, получаем индекс медийного контента
        const index = this.media.push(video) - 1;
        const { x, y, w, h } = mediaObject.position;
        const xLocal =
            this.plane.position.x + percentage(this.plane.position.x, x);
        const yLocal =
            this.plane.position.y + percentage(this.plane.position.y, y);
        const wLocal = this.plane.scale.x + percentage(this.plane.scale.x, w);
        const hLocal = this.plane.scale.y + percentage(this.plane.scale.y, h);
        const videoPlane = new THREE.PlaneGeometry(wLocal, hLocal);
        const material = new THREE.MeshBasicMaterial({
            color: "#FF0000",
        });
        const mesh = new THREE.Mesh(videoPlane, material);
        mesh.position.x = xLocal;
        mesh.position.y = yLocal;
        mesh.userData = {
            mediaIndex: index,
            mediaType: MediaTypes.video,
            pageNumber: this.pageNumber,
        };
        mesh.renderOrder = this.pageNumber * -2 + 1;
        this.group.add(mesh);
    }

    playMedia(mediaIndex) {
        this.media[mediaIndex].play();
    }

    _init3D(mediaObject) {}

    _initPanorama(mediaObject) {}

    loadMedia() {
        if (this.mediaInfo === null) return;
        for (const media of this.mediaInfo.media) {
            if (media.type == MediaTypes.video) this._initVideo(media);
            if (media.type == MediaTypes.panorama) this._initPanorama(media);
            if (media.type == MediaTypes.ThreeD) this._init3D(media);
        }
    }
}
