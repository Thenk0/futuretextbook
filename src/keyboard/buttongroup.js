export default class ButtonGroup {
    buttons = [];
    position = {
        x: 0,
        y: 0,
    };
    selected = false;
    constructor(buttons, position) {
        this.buttons = buttons;
        this.position = position;
    }

    render(ctx) {
        this.buttons.forEach((button) => {
            button.render(ctx);
        });
    }

    pressButton(index) {
        if (index > this.buttons.length) return;
        const letter = this.buttons[index].press();
        this.deselect();
        return letter;
    }

    select() {
        this.selected = true;
        for (const button of this.buttons) {
            button.selected = true;
        }
    }

    deselect() {
        this.selected = false;
        for (const button of this.buttons) {
            button.selected = false;
        }
    }
}
