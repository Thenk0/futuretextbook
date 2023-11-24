import ButtonGroup from "./buttongroup";
import Button from "./button";
import { groups } from "./buttons.json";

export default class Keyboard {
    groups = [];
    groupLetters = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY"];
    inputLetters = ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN"];

    selectedGroup = null;
    selectedIndex = null;
    selectedLetter = null;
    selectedLetterIndex = 0;
    selectedGroupIndex = 0;

    constructor() {
        this.inputField = document.getElementById("keyboard-input");

        const buttonOffsetX = 75;
        const buttonOffsetY = 75;
        for (const group of groups) {
            const buttons = [];
            for (const button of group.buttons) {
                const { color, selectedColor, borderColor } = group;
                const { row, column } = button;
                let rowOffset = row * 20 - 20;
                if (group.orientation === "right") {
                    rowOffset = -rowOffset;
                }
                const x =
                    group.position.x +
                    (column * buttonOffsetX - buttonOffsetX) +
                    rowOffset;
                const y =
                    group.position.y + (row * buttonOffsetY - buttonOffsetY);
                buttons.push(
                    new Button(button.letter, {
                        width: 60,
                        color,
                        selectedColor,
                        borderColor,
                        position: { x, y },
                    })
                );
            }
            const buttonGroup = new ButtonGroup(buttons, group.position);
            this.groups.push(buttonGroup);
        }

        const specialButtons = [];
        specialButtons.push(
            new Button(" ", {
                width: 475,
                color: "#999999",
                selectedColor: "FFFFFF",
                borderColor: "AAAAAA",
                position: {
                    x: 700,
                    y: 860,
                },
            })
        );
        specialButtons.push(
            new Button("←", {
                width: 100,
                color: "#999999",
                selectedColor: "FFFFFF",
                borderColor: "AAAAAA",
                position: {
                    x: 1215,
                    y: 860,
                },
            })
        );
        const specialGroup = new ButtonGroup(specialButtons);
        this.groups.push(specialGroup);

        this.handlePress = this._handlePress.bind(this);
    }

    select(groupIndex) {
        if (groupIndex > this.groups.length) return;
        if (this.selectedGroup) this.selectedGroup.deselect();
        this.selectedGroup = this.groups[groupIndex];
        this.selectedIndex = groupIndex;
        this.groups[groupIndex].select();
    }

    deselect(groupIndex) {
        if (groupIndex > this.groups.length) return;
        this.groups[groupIndex].deselect();
        this.selectedGroup = null;
        this.selectedIndex = null;
    }

    _handlePress(event) {
        let spacePressed = false;
        // Выбор группы
        for (let i = 0; i < this.groupLetters.length; i++) {
            console.log(event.code)
            if (
                event.type === "keydown" &&
                this._isKeyPressed(event, this.groupLetters[i])
            ) {
                this.selectedGroupIndex = i;
                return this.select(i);
            }
            if (
                event.type === "keyup" &&
                this._isKeyReleased(event, this.groupLetters[i])
            ) {
                if (this.selectedLetter) {
                    this.selectedLetter = null;
                }
                return this.deselect(i);
            }
        }
        // Стереть
        if (event.code == "KeyA" && event.type === "keydown") {
            this.inputField.textContent = this.inputField.textContent.slice(
                0,
                -1
            );
            return this.groups[this.groups.length - 1].buttons[1].press();
        }
        let letter = "";
        // Ввод букв
        for (let i = 0; i < this.inputLetters.length; i++) {
            if (event.code === "KeyM" && event.type === "keydown") {
                letter = this.groups[this.groups.length - 1].pressButton(0);
                spacePressed = true;
            }
            if (this.selectedGroup === null && letter === "") return;
            if (event.code === this.inputLetters[i]) {
                if (this.selectedLetter) {
                    this.selectedLetter.scale = 1;
                }
                this.selectedLetter = this.selectedGroup.getButton(i);
                this.letterIndex = i;
            }
            if (event.code === "KeyS" && event.type === "keydown" && this.selectedLetter) {
                // Подтверждение ввода буквы
                letter = this.selectedGroup.pressButton(this.letterIndex);
                this.selectedLetter.isConfirmed = true;
            }
        }
        // Если введён символ -> ввести его в поле, снять выделение группы
        if (
            (letter || letter === " ") &&
            ((this.selectedLetter === null && spacePressed) ||
                this.selectedLetter.isConfirmed)
        ) {
            if (this.inputField.textContent.length > 0)
                letter = letter.toLowerCase(0);
            this.inputField.textContent += letter;
            if (letter === " ") return;
            // this.deselect(this.selectedIndex);
            if(!this.selectedLetter) this.selectedLetter = null;
        }
    }

    _isKeyReleased(event, keycode) {
        return event.code === keycode;
    }

    _isKeyPressed(event, keycode) {
        return event.code === keycode;
    }

    registerEvents() {
        window.addEventListener("keydown", this.handlePress);
        window.addEventListener("keyup", this.handlePress);
    }

    unRegisterEvents() {
        window.removeEventListener("keydown", this.handlePress);
        window.removeEventListener("keyup", this.handlePress);
    }

    render(ctx) {
        if (this.selectedLetter) this.selectedLetter.scale = 1.5;
        this.groups.forEach((group) => {
            group.render(ctx);
        });
    }
}
