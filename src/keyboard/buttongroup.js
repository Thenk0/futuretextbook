export default class ButtonGroup {
    buttons = [];
    position = {
        x: 0,
        y: 0,
    };
    selected = false;
    borderHighlightColor = "#FFFFFF";
    constructor(buttons, position) {
        this.buttons = buttons;
        this.position = position;
    }

    render(ctx) {
        this.buttons.forEach((button) => {
            button.render(ctx);
        });
    }

    select() {
        this.selected = true;
    }
    deselect() {
        this.selected = false;
    }
}
