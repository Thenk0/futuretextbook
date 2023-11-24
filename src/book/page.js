import * as THREE from "three";
import Object3D from "../media/3dobject";
import Panorama from "../media/panorama";
import Video from "../media/video";
import MediaTypes from "../MediaTypes";
import { percentage } from "../utilities";
import Annotated3d from "../media/annotated3d";
import Frame from "../media/frame";

export default class Page {
    mediaInfo = null;
    constructor(book, pageNumber) {
        this.book = book;
        this.pageNumber = pageNumber;
        this.page = null;
        this.plane = null;
        this.group = null;
        this.scale = 1;
        this.media = [];
        this.mediaMeshes = [];
    }
    
    async loadPage() {
        this.media = [];
        this.mediaMeshes = [];
        this.group = new THREE.Group();
        this.plane = new THREE.PlaneGeometry(1, 1);
        this.page = await this.book.getPage(this.pageNumber);
        this.viewport = this.page.getViewport({ scale: 1.25 });
        let bitmap = new OffscreenCanvas(
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
            bitmap = null;
        }

        // Update texture after a second, fixes white screen
        setTimeout(updateTexture, 1000);
        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(bitmap.width / 200, bitmap.height / 200),
            material
        );
        this.plane.position.x = 1;
        this.plane.position.y = 1;
        this.plane.material.side = THREE.DoubleSide;
        this.plane.material.map.needsUpdate = true;
        this.plane.userData = {
            pageNumber: this.pageNumber,
            zPosition: parseFloat(((this.pageNumber + 1) * -1 * 0.005).toFixed(4)),
            renderOrder: (this.pageNumber + 1) * -1,
        };
        this.plane.renderOrder = this.plane.userData.renderOrder;
        this.plane.position.z = this.plane.userData.zPosition;
        this.group.renderOrder = -this.pageNumber;
        this.group.add(this.plane);
    }

    _addMedia(mediaObject, media) {
        // array.push() Возвращает новую длину массива, получаем индекс медийного контента
        const index = this.media.push(media) - 1;
        const { x, y, w, h } = mediaObject.position;
        const xLocal =
            this.plane.position.x + percentage(this.plane.position.x, x);
        const yLocal =
            this.plane.position.y + percentage(this.plane.position.y, y);
        const wLocal = percentage(this.plane.geometry.parameters.width, w);
        const hLocal = percentage(this.plane.geometry.parameters.height, h);
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

    async _initAnnotated3d(mediaObject) {
        const obj3d = new Annotated3d(mediaObject.url, mediaObject.preview);
        await obj3d.load();
        this._addMedia(mediaObject, obj3d);
    }

    async _initPanorama(mediaObject) {
        const panorama = new Panorama(mediaObject.url);
        await panorama.load();
        this._addMedia(mediaObject, panorama);
    }

    async _initFrame(mediaObject) {
        const frame = new Frame(mediaObject.url)
        await frame.load();
        this._addMedia(mediaObject, frame)
    }

    playMedia(mediaIndex) {
        this.media[mediaIndex].play();
        this.mediaMeshes[mediaIndex].userData.playing = true;
    }

    async loadMedia() {
        if (this.mediaInfo === null) return;
        for (const media of this.mediaInfo.media) {
            if (media.type == MediaTypes.video) await this._initVideo(media);
            if (media.type == MediaTypes.panorama) await this._initPanorama(media);
            if (media.type == MediaTypes.threeD) await this._init3D(media);
            if (media.type == MediaTypes.annotatedThreeD) await this._initAnnotated3d(media);
            if (media.type == MediaTypes.frame) await this._initFrame(media);
        }
    }
}
