import "./style.css";
import Scene from "./src/scenes/scene";

const scene = new Scene("app");
let counter = 0;
function render() {
    scene.render();
    if (Math.round(counter / 1000) % 2 == 0) {
        if (scene.active) scene.deactivate();
    } else {
        if (!scene.active) scene.activate();
    }
    requestAnimationFrame(render);
    counter += 1;
}
render();
