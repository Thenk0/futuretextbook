import Scene from "./scene";
import BookScene from "./bookscene";

export default class LibraryScene extends Scene {
    constructor(canvasId) {
        super(canvasId)
        const books = document.querySelectorAll('.book');
        this._hoverFunc = this._hover.bind(this);
        this._clickFunc = this._click.bind(this);
        this._clickLibFunc = this._clickLibrary.bind(this);
        const library = document.querySelector('.bookshelf-block');
        library.addEventListener('mousedown', this._clickLibFunc);
        this._unhoverFunc = this._unhover.bind(this);
        for (const book of books) {
            book.addEventListener("mouseenter", this._hoverFunc);
            book.addEventListener("mousedown", this._clickFunc);
            book.addEventListener("mouseleave", this._unhoverFunc);
        }
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.render();
    }

    backClick() {
        const library = document.querySelector('.bookshelf-block');
        library.classList.remove('active')
    }


    _clickLibrary() {
        const videoMedia = document.getElementById("video-wrapper");
        videoMedia.classList.remove("active")
        const library = document.querySelector('.bookshelf-block');
        library.classList.add('active')
    }

    _hover(event) {
        const target = event.target;
        const bookTitle = target.getAttribute('data-book-title');
        if (typeof bookTitle === "undefined") return;
        const bookLargeTitle = document.querySelector('.book-large-title');
        bookLargeTitle.innerText = bookTitle;
    }

    _click(event) {
        const target = event.target;
        const bookUrl = target.getAttribute('data-book-url');
        if (bookUrl === null) return;
        const bookLargeTitle = document.querySelector('.book-large-title');
        bookLargeTitle.innerText = '';
        window.bookScene = new BookScene("app", bookUrl);
        window.bookScene.activate();
        this.deactivate();
    }

    _unhover() {
        const bookLargeTitle = document.querySelector('.book-large-title');
        bookLargeTitle.innerText = '';
    }

    activate() {
        const canvas = document.getElementById('library-canvas');
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        const libraryBlock = document.getElementById('library-block');
        libraryBlock.style.pointerEvents = 'all'
        libraryBlock.style.display = 'block';
        this.reference = this._resize.bind(this);
        window.addEventListener("resize", this.reference, false);
        this.reference();
        this.active = true;

    }

    deactivate() {
        this.active = false;
        const libraryBlock = document.getElementById('library-block');
        libraryBlock.style.display = 'none';
        libraryBlock.style.pointerEvents = 'none';
        window.removeEventListener("resize", this.reference, false);
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}
