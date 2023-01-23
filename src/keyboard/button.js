export default class Button {
    letter = "";
    color = "";
    borderColor = "";
    position = {
        x: 0,
        y: 0,
    };
    width = 50;
    height = 50;
    borderWidth = 10;
    constructor(letter, { color, borderColor, position }) {
        this.letter = letter;
        this.color = color;
        this.borderColor = borderColor;
        this.position = position;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
    }
}
