/* global pdfjsLib */
import "./style.css";
import Scene from "./src/scenes/scene";
import Button from "./src/keyboard/button";
import Book from "./src/book/book";
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.2.146/build/pdf.worker.min.js ";
const scene = new Scene("app");
let lastUpdate = 0;
let now = performance.now();
const btn = new Button("A", {
    color: "#FF0000",
    borderColor: "#FFF000",
    selectedColor: "#FFFFFF",
    position: {
        x: 60,
        y: 60,
    },
});
const btn1 = new Button("B", {
    color: "#FF0000",
    borderColor: "#FFF000",
    selectedColor: "#FFFFFF",
    position: {
        x: 400,
        y: 200,
    },
});
window.addEventListener("keyup", function (event) {
    if (event.key === "w") {
        btn.press();
    }
    if (event.key === "e") {
        btn1.press();
    }
});
const book = new Book();
book.loadBook();
console.log(pdfjsLib);
function render() {
    now = performance.now();
    window.deltaTime = now - lastUpdate;
    lastUpdate = now;
    // scene.render();
    // btn.render(scene.ctx);
    // btn1.render(scene.ctx);
    requestAnimationFrame(render);
}
render();
