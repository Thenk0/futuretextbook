
export default class Panorama {
    mediaScene = window.mediaScene;
    mediaCanvas = null;
    constructor(url) {
        this.url = url;
    }

    setLoaded(state) {
        this.loaded = state;
    }

    async load() {
        this.mediaCanvas = new OffscreenCanvas(1280, 720);
        this.mediaCtx = this.mediaCanvas.getContext("2d");
        function loadImage(url) {
            return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
        }
        this.image = await loadImage(this.url);
        this.render();
    }

    async play() {
        this.mediaScene.loadImage(this.url);
        this.mediaScene.activate();
    }

    drawThumbnail() {
        this.mediaCtx.drawImage(
            this.image,
            0,
            0,
            this.mediaCanvas.width,
            this.mediaCanvas.height
        );
    }

    render() {
        this.drawThumbnail();
        requestAnimationFrame(this.render.bind(this));
    }

}
