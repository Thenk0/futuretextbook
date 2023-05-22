import * as THREE from "three";
import Object3D from "../media/3dobject";
import Panorama from "../media/panorama";
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
        this.mediaMeshes = [];
    }

    async loadPage(isStarted = true) {
        this.page = await this.book.getPage(this.pageNumber);
        this.viewport = this.page.getViewport({ scale: 1.25 });
        const bitmap = new OffscreenCanvas(
            this.viewport.width,
            this.viewport.height
        );
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
        const updateTexture = () => {
            material.map.needsUpdate = true;
        }

        // Update texture after a second, fixes white screen
        setTimeout(updateTexture, 1000);
        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(bitmap.width / 200, bitmap.height / 200),
            material
        );
        this.plane.position.x = 1;
        this.plane.position.y = 1;
        if (!isStarted) {
            this.plane.position.x = -4;
            this.plane.position.y = 3;
            this.plane.scale.x = 0.5;
            this.plane.scale.y = 0.5;
        }
        this.plane.material.side = THREE.DoubleSide;
        this.plane.material.map.needsUpdate = true;
        this.plane.userData = {
            pageNumber: this.pageNumber,
            zPosition: parseFloat(((this.pageNumber + 1) * -1 * 0.005).toFixed(4)),
            renderOrder: (this.pageNumber + 1) * -1,
        };
        this.plane.renderOrder = this.plane.userData.renderOrder;
        this.plane.position.z = this.plane.userData.zPosition;
        console.log(this.plane.position.z, this.plane.renderOrder)
        this.group.renderOrder = -this.pageNumber;
        this.group.add(this.plane);
    }

    _addMedia(mediaObject, media) {
        // array.push() Возвращает новую длину массива, получаем индекс медийного контента
        const index = this.media.push(media) - 1;
        const { x, y, w, h } = mediaObject.position;
        const xLocal =
            this.plane.position.x + (percentage(this.plane.position.x * this.plane.scale.x, x * this.plane.scale.x)) * this.plane.scale.x;
        const yLocal =
            this.plane.position.y + (percentage(this.plane.position.y * this.plane.scale.y, y * this.plane.scale.y)) * this.plane.scale.y;
        const wLocal = percentage(this.plane.geometry.parameters.width * this.plane.scale.x, w);
        const hLocal = percentage(this.plane.geometry.parameters.height * this.plane.scale.y, h);
        const videoPlane = new THREE.PlaneGeometry(wLocal, hLocal);
        const texture = new THREE.CanvasTexture(media.mediaCanvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
        });

        const mesh = new THREE.Mesh(videoPlane, material);
        this.mediaMeshes.push(mesh);
        mesh.position.x = xLocal;
        mesh.position.y = yLocal;
        mesh.userData = {
            mediaIndex: index,
            mediaType: MediaTypes.video,
            pageNumber: this.pageNumber,
            playing: false,
            zPosition: parseFloat(((this.pageNumber + 1) * -1 * 0.005).toFixed(4)),
            renderOrder: (this.pageNumber + 1) * -1
        };

        mesh.position.z = mesh.userData.zPosition;
        mesh.renderOrder = mesh.userData.renderOrder;
        mesh.material.map.needsUpdate = true;
        this.group.add(mesh);
    }
    async _initVideo(mediaObject) {
        const video = new Video(mediaObject.url);
        await video.load();
        this._addMedia(mediaObject, video);

    }

    async _init3D(mediaObject) {
        const obj3d = new Object3D(mediaObject.url, mediaObject.preview);
        await obj3d.load();
        this._addMedia(mediaObject, obj3d);
    }

    async _initPanorama(mediaObject) {
        const panorama = new Panorama(mediaObject.url);
        await panorama.load();
        this._addMedia(mediaObject, panorama);
    }

    playMedia(mediaIndex) {
        this.media[mediaIndex].play();
        this.mediaMeshes[mediaIndex].userData.playing = true;
    }

    loadMedia() {
        if (this.mediaInfo === null) return;
        for (const media of this.mediaInfo.media) {
            if (media.type == MediaTypes.video) this._initVideo(media);
            if (media.type == MediaTypes.panorama) this._initPanorama(media);
            if (media.type == MediaTypes.threeD) this._init3D(media);
        }
    }
}
