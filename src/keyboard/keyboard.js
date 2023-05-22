import ButtonGroup from "./buttongroup";
import Button from "./button";
import { groups } from "./buttons.json";


export default class Keyboard {
    groups = [];
    selectedGroup = null;
    selectedIndex = null;

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
                const x = group.position.x + (column * buttonOffsetX - buttonOffsetX) + rowOffset;
                const y = group.position.y + (row * buttonOffsetY - buttonOffsetY);
                buttons.push(new Button(button.letter, {
                    width: 60,
                    color,
                    selectedColor,
                    borderColor,
                    position: { x, y }
                }));
            }
            const buttonGroup = new ButtonGroup(buttons, group.position);
            this.groups.push(buttonGroup);
        }

        const specialButtons = [];
        specialButtons.push(new Button(" ", {
            width: 475,
            color: "#999999",
            selectedColor: "FFFFFF",
            borderColor: "AAAAAA",
            position: {
                x: 700,
                y: 860,
            }
        }))
        specialButtons.push(new Button("←", {
            width: 100,
            color: "#999999",
            selectedColor: "FFFFFF",
            borderColor: "AAAAAA",
            position: {
                x: 1215,
                y: 860,
            }
        }))
        const specialGroup = new ButtonGroup(specialButtons);
        this.groups.push(specialGroup);

        this.handlePress = this._handlePress.bind(this)
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
        // Костыли, но бален так лень это всё нормально делать
        if (event.code == "KeyQ") return this.select(0);
        if (event.code == "KeyW") return this.select(1);
        if (event.code == "KeyE") return this.select(2);
        if (event.code == "KeyR") return this.select(3);
        if (event.code == "KeyT") return this.select(4);
        if (event.code == "KeyY") return this.select(5);

        if (event.code == "KeyA") {
            this.inputField.textContent = this.inputField.textContent.slice(0, -1)
            return this.groups[this.groups.length - 1].buttons[1].press();
        }
        let letter = "";
        if (event.code == "KeyM") letter = this.groups[this.groups.length - 1].pressButton(0);
        if (this.selectedGroup === null && letter === "") return;
        if (event.code == "KeyZ") letter = this.selectedGroup.pressButton(0);
        if (event.code == "KeyX") letter = this.selectedGroup.pressButton(1);
        if (event.code == "KeyC") letter = this.selectedGroup.pressButton(2);
        if (event.code == "KeyV") letter = this.selectedGroup.pressButton(3);
        if (event.code == "KeyB") letter = this.selectedGroup.pressButton(4);
        if (event.code == "KeyN") letter = this.selectedGroup.pressButton(5);
        if (event.code == "KeyM") letter = this.groups[this.groups.length - 1].pressButton(0);
        if (letter || letter === " ") {
            if (this.inputField.textContent.length > 0) letter = letter.toLowerCase(0)
            this.inputField.textContent += letter;
            if (letter === " ") return;
            this.deselect(this.selectedIndex);
        }
    }

    registerEvents() {
        window.addEventListener("keydown", this.handlePress);
    }

    unRegisterEvents() {
        window.removeEventListener("keydown", this.handlePress);
    }

    render(ctx) {
        this.groups.forEach(group => {
            group.render(ctx);
        })
    }
}