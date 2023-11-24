export default class Frame{

    mediaScene = window.mediaScene;
    mediaCanvas = null;
    constructor(url){
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
        this.mediaScene.loadImage(this.url, true);
        this.mediaScene.activate();
        window.bookScene.deactivate();
        
    }

    drawThumbnail() {
        this.mediaCtx.drawImage(
            this.image,
            0,
            0,
            this.mediaCanvas.width,
            this.mediaCanvas.height
        );
        const preview = new Image();
        preview.src = "/media/frame/mapPreview.png";
        this._drawMediaTypeIcon(this.mediaCtx, preview, 128, 128)
    }

    _drawMediaTypeIcon(ctx, image, width, height){
        const offsetX = 150;
        const offsetY = 50;
        const rect = new Path2D();
        rect.rect(this.mediaCanvas.width - offsetX, offsetY, width + 5, height + 5)
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 5
        ctx.stroke(rect);
        ctx.drawImage(image, this.mediaCanvas.width - offsetX, offsetY, width, height);
    }

    render() {
        this.drawThumbnail();
        requestAnimationFrame(this.render.bind(this));
    }
    
}