export default class VideoPlayer {
    constructor(url) {
        this.url = url;
        this.canvas = document.querySelector(".video-player");
        this.context = this.canvas.getContext("2d");
        this.isPlaying = false;
        this.video = document.createElement("video");
        this.video.src = this.url;
        this.video.loop = "loop"

        const playButtonSize = 30; // Размер кнопки
        const playButtonX = (this.canvas.width - playButtonSize) / 2;
        const playButtonY = (this.canvas.height - playButtonSize) / 2;

        this.canvas.addEventListener("click", this.togglePlay.bind(this));

        this.drawPlayButton(playButtonX, playButtonY, playButtonSize);
        this.playVideo();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.video.pause();
            console.log("Video paused");
        } else {
            this.isPlaying = true;
            this.video.play();
            console.log("Video played");
            this.updateVideoFrame();
        }
    }

    playVideo() {
        this.video.onloadedmetadata = () => {
            this.context.drawImage(
                this.video,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        };
    }

    updateVideoFrame() {
        if (this.isPlaying) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.drawImage(
                this.video,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
            requestAnimationFrame(this.updateVideoFrame.bind(this));
        } else {
            this.drawPlayButton(
                (this.canvas.width - 30) / 2,
                (this.canvas.height - 30) / 2,
                30
            );
        }
    }

    drawPlayButton(x, y, size) {
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x, y + size);
        this.context.lineTo(x + size, y + size / 2);
        this.context.fillStyle = "white";
        this.context.fill();
        this.context.closePath();
    }
}
