import { sleep } from "../utilities";

export default class Video {
    video = null;
    mediaCanvas = null;
    loaded = false;
    playing = false;
    
    constructor(url) {
        this.url = url;
    }

    setLoaded(state) {
        this.loaded = state;
    }

    async load() {
        this.mediaCanvas = new OffscreenCanvas(1280, 720);
        this.mediaCtx = this.mediaCanvas.getContext("2d");
        this.video = document.createElement("video");
        this.video.src = this.url;
        this.video.preload = "auto";
        this.video.load();

        const that = this;
        await new Promise((resolve, reject) => {
            const startRender = () => {
                this.render();
                this.drawThumbnail();
                resolve();
            };
            this.video.addEventListener("loadeddata", startRender.bind(that), {
                once: true,
            });
            this.video.onerror = reject;
        });
        this.loaded = true;
        this.video.addEventListener(
            "play",
            (() => {
                this.loaded = true;
            }).bind(this),
            false
        );
    }

    async play() {
        if (this.video === null)
            return console.error("tried to play video without loading");
        if (this.isVideoPlaying()) {
            this.pause()
            return;
        }
        while (!this.loaded) {
            await sleep(100);
        }
        await this.video.play();
    }

    isVideoPlaying() {
        return !!(this.video.currentTime > 0 && !this.video.paused && !this.video.ended && this.video.readyState > 2)
    }

    drawThumbnail() {
        this.mediaCtx.drawImage(
            this.video,
            0,
            0,
            this.mediaCanvas.width,
            this.mediaCanvas.height
        );
        this.mediaCtx.fillStyle = "#FFFFFF";
        const centerX = this.mediaCanvas.width / 2;
        const centerY = this.mediaCanvas.height / 2;
        const triangleOffset = 70;
        const triangleHeight = 125;
        this.mediaCtx.beginPath();
        this.mediaCtx.moveTo(centerX - triangleOffset, centerY);
        this.mediaCtx.lineTo(
            centerX - triangleOffset,
            centerY + triangleHeight
        );
        this.mediaCtx.lineTo(centerX + triangleOffset, centerY);
        this.mediaCtx.lineTo(
            centerX - triangleOffset,
            centerY - triangleHeight
        );
        this.mediaCtx.lineTo(centerX - triangleOffset, centerY);
        this.mediaCtx.closePath();
        this.mediaCtx.fill();
        return this.mediaCanvas;
    }

    pause() {
        this.video.pause();
    }

    render() {
        this.renderLoop();
        requestAnimationFrame(this.render.bind(this));
    }

    renderLoop() {
        this.drawThumbnail();
        if (!this.loaded) return;
        if (this.video.paused) return;
        if (this.video.ended) return;
        this.mediaCtx.drawImage(
            this.video,
            0,
            0,
            this.mediaCanvas.width,
            this.mediaCanvas.height
        );
    }
}
