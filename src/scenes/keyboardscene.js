import Keyboard from "../keyboard/keyboard";
import { clamp } from "../utilities";
import Scene from "./scene";
import { compareTwoStrings } from "string-similarity";

export default class KeyboardScene extends Scene {
    constructor(canvasId) {
        super(canvasId);
        this.keyboard = new Keyboard();
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.guiButtons = document.getElementById("keyboard-buttons");
        this.guiButtonsFake = document.getElementById("keyboard-buttons-fake");
        this.scrollSpeed = 20;

        this.scrollEvent = this._scrollButtons.bind(this);
        this.scrollEnter = this._hoverEffect.bind(this);
        this.scrollExit = this._exitHoverEffect.bind(this);
        this.clickEvent = this._clickEvent.bind(this);
        this.onChangeEvent = this._onChange.bind(this);
        this.observer = new MutationObserver(this.onChangeEvent);
    }

    activate() {
        this.canvas.style.pointerEvents = "auto";
        this.active = true;
        this.render();
        this.canvas.style.display = "block";
        document.getElementById("keyboard-block").style.display = "block";
        this.keyboard.registerEvents();
        window.addEventListener("wheel", this.scrollEvent);
        this.observer.observe(this.keyboard.inputField, { characterData: true, childList: true, attributes: true })

        if (this.keyboard.inputField.innerText.length > 0) {
            return this.search(this.keyboard.inputField.innerText);
        }
        
        this.setOutline(window.bookScene.book.outline);
    }

    deactivate() {
        this.canvas.style.pointerEvents = "none";
        this.active = false;
        this.canvas.style.display = "none";
        document.getElementById("keyboard-block").style.display = "none";
        this.keyboard.unRegisterEvents();

        this.keyboard.inputField.removeEventListener("change", this.onChangeEvent);
        window.removeEventListener("wheel", this.scrollEvent);
        for (const button of this.guiButtons.children) {
            button.removeEventListener("mouseenter", this.scrollEnter);
            button.removeEventListener("mouseleave", this.scrollExit);
        }
        this.observer.disconnect();
    }

    setOutline(outline) {
        this.guiButtons.innerText = "";
        this.guiButtonsFake.innerText = "";
        for (const out of outline) {
            const guiButton = document.createElement("div");
            const guiButtonFake = document.createElement("div");
            guiButton.classList.add("keyboard-button")
            guiButton.setAttribute("page", out.pageNumber)
            guiButtonFake.innerText = out.title;
            guiButtonFake.classList.add("keyboard-button-fake")
            this.guiButtons.appendChild(guiButton)
            this.guiButtonsFake.appendChild(guiButtonFake)
        }
        let index = 0
        for (const button of this.guiButtons.children) {
            button.setAttribute("data-index", index);
            button.addEventListener("mousedown", this.clickEvent);
            button.addEventListener("mouseenter", this.scrollEnter);
            button.addEventListener("mouseleave", this.scrollExit);
            index++;
        }
    }

    search(string) {
        string = string.toLowerCase()
        const outline = window.bookScene.book.outline;
        if (string.length == 0) return this.setOutline(window.bookScene.book.outline);
        let result = [];
        if (string.length < 3) {
            result = outline.filter(obj => obj.title.toLowerCase().includes(string))
            return this.setOutline(result);
        }
        for (const out of outline) {
            const score = clamp(0, compareTwoStrings(string, out.title.toLowerCase()) * 100, 1);
            result.push({
                score, object: out
            });
        }
        result = result.sort((a, b) => a.score > b.score);
        result = result.filter(obj => obj.score > 0.3);
        result = result.map(obj => obj.object)
        this.setOutline(result);
    }

    _onChange(mutationList) {
        for (const mutation of mutationList) {
            this.search(mutation.target.innerText);
            break;
        }
    }

    _scrollButtons(event) {   
        const delta = Math.sign(event.deltaY);
        this.guiButtons.scroll(0, this.guiButtons.scrollTop + delta * this.scrollSpeed);
        this.guiButtonsFake.scroll(0, this.guiButtonsFake.scrollTop + delta * this.scrollSpeed / 4.32);
        // 4.32 - пропорция между размерами кнопок Полный размер блока кнопок / Полный размер фейкового блока 
    }

    _hoverEffect(event) {
        const index = event.target.getAttribute("data-index");
        this.guiButtonsFake.children[index].classList.add("hovered");
    }

    _exitHoverEffect(event) {
        const index = event.target.getAttribute("data-index");
        this.guiButtonsFake.children[index].classList.remove("hovered");
    }

    _clickEvent(event) {
        if (event.button !== 0) return;
        const page = event.target.getAttribute('page');
        for (let i = 0; i < this.guiButtonsFake.children.length; i++) {
            this.guiButtonsFake.children[i].classList.remove("hovered");
        }
        window.sceneManager(false, { page });
    }

    render() {
        if (!this.active) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.keyboard.render(this.ctx);
    }
}
