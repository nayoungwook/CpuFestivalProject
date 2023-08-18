var socket = io();

var app = new App();
var ctx = App.ctx;
var canvas = App.canvas;

const MS = 60;

var keyW = false, keyS = false, keyA = false, keyD = false;

var users = [];

addEventListener('keydown', (e) => {
    if (e.key == 'w')
        keyW = true;
    if (e.key == 's')
        keyS = true;
    if (e.key == 'a')
        keyA = true;
    if (e.key == 'd')
        keyD = true;
});

addEventListener('keyup', (e) => {
    if (e.key == 'w')
        keyW = false;
    if (e.key == 's')
        keyS = false;
    if (e.key == 'a')
        keyA = false;
    if (e.key == 'd')
        keyD = false;
});

class GameScene extends Scene {
    constructor() {
        super();

        this.initializeGame();
    }

    initializeGame = () => {

    }

    tick = () => {
        socket.emit('userInput', { w: keyW, s: keyS, a: keyA, d: keyD, key: document.cookie });
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

        for (let i = 0; i < users.length; i++) {
            ctx.fillStyle = 'rgb(240, 150, 150)';
            ctx.fillRect(users[i].position.x - 20, users[i].position.y - 20, 40, 40);
        }

        this.renderDebug(); // TODO : disable this debug function
    }
}

socket.on('gameData', (packet) => {
    users = packet.users;
});

window.onload = () => {
    App.scene = new GameScene();
}