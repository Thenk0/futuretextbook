import { InOutQuadBlend } from "../utilities";

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
    borderSize = 3;
    textSize = 36;
    pressAnimationDuration = 100;
    animating = false;
    animationCounter = 0;
    constructor(letter, { color, borderColor, position }) {
        this.letter = letter;
        this.color = color;
        this.borderColor = borderColor;
        this.position = position;
    }

    press() {
        this.stopAnimation();
        this.animating = true;
    }

    stopAnimation() {
        this.animating = false;
        this.animationCounter = 0;
    }

    _renderAnimation() {
        if (this.animationCounter > this.pressAnimationDuration) {
            this.stopAnimation();
            return 1;
        }
        let progress = this.animationCounter / this.pressAnimationDuration;
        if (this.animationCounter === 0) progress = 0;
        progress = Math.min(progress, 1);
        const animation = InOutQuadBlend(progress);

        /* Вот эта ужасная штука
         . Формула параболы с офсетом по y равным 0.5
         . 1.4 Подобрано случайно чтобы диапазон начинался от 0 до 1
         . 0.7 смещение по x по той же причине
        Ограничение не больше 1 чтобы кнопка не увеличивалась в размере при обратной анимации
        */
        const scale = Math.min(1, Math.pow(animation * 1.4 - 0.7, 2) + 0.5);
        this.animationCounter += window.deltaTime;
        return scale;
    }

    render(ctx) {
        let scale = 1;
        if (this.animating) {
            scale = this._renderAnimation(ctx);
        }
        const centerX = this.position.x - this.width * 0.5;
        const centerY = this.position.y - this.height * 0.5;
        const borderW = this.width + this.borderSize * 2;
        const borderH = this.height + this.borderSize * 2;
        ctx.save();
        ctx.setTransform(
            scale,
            0,
            0,
            scale,
            this.position.x - this.width / 2,
            this.position.y - this.height / 2
        );
        ctx.fillStyle = this.borderColor;
        ctx.fillRect(
            this.position.x - centerX - this.borderSize,
            this.position.y - centerY - this.borderSize,
            borderW,
            borderH
        );
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x - centerX,
            this.position.y - centerY,
            this.width,
            this.height
        );
        ctx.font = `${this.textSize}px Arial`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            this.letter,
            this.position.x - centerX + this.width / 2,
            this.position.y - centerY + this.height / 2
        );
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.restore();
    }
}
