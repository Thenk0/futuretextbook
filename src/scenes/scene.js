export default class Scene {
    canvas = null;
    ctx = null;
    width = 0;
    height = 0;
    active = false;
    reference = null;
    constructor(canvasId) {
        canvasId;
        this.active = false;
    }
    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.render();
    }

    action() {}

    activate(id) {
        const canvas = document.getElementById(id);
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.reference = this._resize.bind(this);
        window.addEventListener("resize", this.reference, false);
        window.addEventListener("resize", this.reference, false);
        this.reference();
        this.active = true;
    }

    deactivate() {
        this.active = false;
        window.removeEventListener("resize", this.reference, false);
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}
