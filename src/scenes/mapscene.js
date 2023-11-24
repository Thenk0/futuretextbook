import * as THREE from "three";
import Scene from "./scene";

export default class BookScene extends Scene 
{
    

    constructor(canvasId)
    {
        super(canvasId);
        this.renderer = new THREE.WebGLRenderer({canvasId});
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext("2d");
        this.active = false;
        window.frameElements = 
        [
            "/media/frame/frameElements/bmp.png",
            "/media/frame/frameElements/brdm.png",
            "/media/frame/frameElements/breadFactory.png",
            "/media/frame/frameElements/btr.png",
            "/media/frame/frameElements/car.png",
            "/media/frame/frameElements/fieldBath.png",
            "/media/frame/frameElements/kshm.png",
            "/media/frame/frameElements/tank.png",
        ];
        this.frameMenu = document.querySelector(".frame__menu");
        this.video = document.getElementById("video-wrapper");
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.render();
    }

    activate()
    {
        this.active = true;
        window.mediaScene.activate();
        window.mediaScene.loadImage("/media/frame/map1.jpg", true);
        this.frameMenu.style.display = "block";
        this.video.style.display = "block";
        this.video.style.zIndex = 2;
        this.video.addEventListener("click", event => {
            if(!this.video.classList.contains("active"))
                this.video.classList.toggle("active")
        });
        this.video.addEventListener("contextmenu", event => {
            if (this.video.classList.contains("active")) {
                this.video.classList.remove("active");
            }
            event.preventDefault();
        });
    }

    deactivate()
    {
        this.active = false
        window.libraryScene.activate();
        this.frameMenu.children.item(0).innerHTML = "";
        this.frameMenu.style.display = "none";
        this.video.style.display = "none";
        this.video.style.zIndex = 2;
    }

    render(){
        if (this._resizeRendererToDisplaySize()) {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    _resizeRendererToDisplaySize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        const needResize = this.canvas.width !== width || this.canvas.height !== height;
        if (needResize) {
            this.renderer.setSize(width, height, false);
        }
        return needResize;
    }

}