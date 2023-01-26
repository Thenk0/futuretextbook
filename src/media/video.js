import { sleep } from "../utilities";

export default class Video {
    video = null;
    mediaCanvas = null;
    loaded = false;
    constructor(url) {
        this.url = url;
    }

    setLoaded(state) {
        this.loaded = state;
    }

    load() {
        this.mediaCanvas = document.querySelector("#media");
        this.mediaCtx = this.mediaCanvas.getContext("2d");
        this.video = document.createElement("video");
        this.video.src = this.url;
        this.video.preload = "auto";
        this.video.load();
        this.video.onerror = function (e) {
            console.error(e);
        };
        this.video.addEventListener(
            "loadeddata",
            this.setLoaded.bind(this, true),
            { once: true }
        );
        this.video.addEventListener(
            "play",
            this._renderEvent.bind(this),
            false
        );
    }

    async play() {
        if (this.video === null)
            return console.error("tried to play video without loading");
        while (!this.loaded) {
            await sleep(100);
        }
        await sleep(1000);
        await this.video.play();
    }

    pause() {
        this.video.pause();
    }

    _renderEvent() {
        requestAnimationFrame(this.render.bind(this));
    }

    render() {
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
        requestAnimationFrame(this.render.bind(this));
    }
}
