/* global pdfjsLib */
import "./style.css";
import BookScene from "./src/scenes/bookscene";
import MediaScene from "./src/scenes/mediascene";
import KeyboardScene from "./src/scenes/keyboardscene";
import LibraryScene from "./src/scenes/libraryscene";
import MapScene from "./src/scenes/mapscene";
import VideoPlayer from "./src/videoPlayer";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.2.146/build/pdf.worker.min.js ";

window.mediaScene = new MediaScene("media");
window.keyboardScene = new KeyboardScene("keyboard");
window.bookScene = new BookScene("app", "/pages.pdf");
window.libraryScene = new LibraryScene("library-canvas");
window.mapScene = new MapScene("map-canvas");
window.libraryScene.activate();
// window.mediaScene.activate();
// window.mediaScene.load3d('./media/3d/котел.glb', true);

window.addEventListener("mousedown", function (event) {
    if (event.button === 2) {
        event.preventDefault();
        window.sceneManager(true);
    }
    if (event.button === 1) {
        const elem = document.body; // Make the body go full screen.
        requestFullScreen(elem);
    }
});

const button = document.getElementById("search-button");
button.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
        window.bookScene.deactivate();
        window.keyboardScene.activate();
    }
});

const map = document.querySelector(".map-wrapper");
map.addEventListener("click", (event) => {
    window.mapScene.activate();
});

window.sceneManager = function sceneManager(isBack = false, info = {}) {
    if (
        window.mapScene.active &&
        !document.getElementById("video-wrapper").classList.contains("active")
    ) {
        window.mediaScene.deactivate();
        window.mapScene.deactivate();
    }

    if (window.libraryScene.active) {
        window.libraryScene.backClick();
    }

    if (window.bookScene.active) {
        window.libraryScene.activate();
        window.bookScene.deactivate();
    }

    if (window.mediaScene.active && !window.mapScene.active) {
        window.bookScene.activate();
        window.mediaScene.deactivate();
    }

    if (window.keyboardScene.active) {
        if (!isBack) {
            window.keyboardScene.keyboard.inputField.innerText = "";
            window.bookScene.resetPages(info.page);
        }
        window.bookScene.activate();
        window.keyboardScene.deactivate();
    }
};

function requestFullScreen(element) {
    var requestMethod =
        element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullScreen;

    if (requestMethod) requestMethod.call(element);
}

// Main loop
let now = performance.now();
let lastUpdate = 0;

function render(time) {
    now = performance.now();
    window.deltaTime = now - lastUpdate;
    lastUpdate = now;
    window.bookScene.render(time);
    window.mediaScene.render();
    window.keyboardScene.render();
    window.libraryScene.render();
    requestAnimationFrame(render);
}
render(0);
