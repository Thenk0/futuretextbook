/* global pdfjsLib */
import "./style.css";
import Button from "./src/keyboard/button";
import BookScene from "./src/scenes/bookscene";
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.2.146/build/pdf.worker.min.js ";
const scene = new BookScene("app", "");
scene.activate();

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

// Main loop
let now = performance.now();
let lastUpdate = 0;
function render(time) {
    now = performance.now();
    window.deltaTime = now - lastUpdate;
    lastUpdate = now;
    scene.render(time);
    requestAnimationFrame(render);
}
render(0);
