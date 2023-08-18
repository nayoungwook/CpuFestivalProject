var socket = io();

var app = new App();
var ctx = App.ctx;
var canvas = App.canvas;

class GameScene extends Scene {
    constructor() {
        super();
    }

    tick = () => {

    }

    renderDebug = () => {
        ctx.font = "bold 16px blackHanSans";
        ctx.textAlign = 'left';

        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.fillText('Key : ' + document.cookie, 10, 20);
    }

    render = () => {
        ctx.fillStyle = 'rgb(120, 255, 150)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.renderDebug(); // TODO : disable this debug function
    }
}

window.onload = () => {
    App.scene = new GameScene();
}