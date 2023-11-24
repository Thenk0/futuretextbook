// import * as THREE from "three";

import Object3D from "./3dobject";

// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export default class Annotated3d extends Object3D {
    async play() {
        this.mediaScene.load3d(this.url, true);
        this.mediaScene.activate();
        window.bookScene.deactivate();
    }
}
