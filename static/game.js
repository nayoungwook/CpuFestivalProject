var socket = io();

var app = new App();
var ctx = App.ctx;
var canvas = App.canvas;

const MS = 60;

var keyW = false, keyS = false, keyA = false, keyD = false;

var users = [];
var myPlayer = undefined;
var zoomRatio = 0;

var touch = false;
var touchPosition = new Vector(0, 0);
var touchStartPosition = new Vector(0, 0);

addEventListener('touchstart', (e) => {
    touchPosition.x = e.touches[0].clientX;
    touchPosition.y = e.touches[0].clientY;
    touchStartPosition.x = e.touches[0].clientX;
    touchStartPosition.y = e.touches[0].clientY;
    touch = true;
});

addEventListener('touchmove', (e) => {
    touchPosition.x = e.touches[0].clientX;
    touchPosition.y = e.touches[0].clientY;
});

addEventListener('touchend', (e) => {
    touch = false;
});

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
        this.padPosition = new Vector(0, 0);
        this.joystickTouched = false;
        this.joystickDir = 0;
        this.frame = 0;
        this.lastUpdate = Date.now();
    }

    initializeGame = () => {

    }

    sendPacket = () => {
        socket.emit('userInput', { joystickDir: this.joystickDir, move: this.joystickTouched, key: document.cookie });
    }

    updateJoyStick = () => {
        this.joystickTouched = Mathf.getDistance(touchStartPosition, this.padPosition) <= 100 * zoomRatio && touch;
    }

    tick = () => {
        var now = Date.now();
        var dt = now - this.lastUpdate;
        this.lastUpdate = now;
        this.frame = Math.round(1000 / dt);

        zoomRatio = (canvas.width / 1920);
        let padSize = 100 * zoomRatio;
        this.padPosition.x = padSize / 5 * 8;
        this.padPosition.y = canvas.height - padSize / 5 * 8;

        Camera.position.z = zoomRatio;

        findMyPlayer();
        if (!myPlayer) return;

        Camera.position.x += ((myPlayer.position.x - canvas.width / 2) - Camera.position.x) / 10;
        Camera.position.y += ((myPlayer.position.y - canvas.height / 2) - Camera.position.y) / 10;

        this.updateJoyStick();

        this.renderJoystick();
        this.sendPacket();
    }

    renderDebug = () => {
        ctx.font = "bold 30px blackHanSans";
        ctx.textAlign = 'left';

        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.fillText('Key : ' + document.cookie, 10, 30);

        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.fillText('Frame : ' + this.frame, 10, 60);
    }

    renderJoystick = () => {
        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.beginPath();
        let padSize = 100 * zoomRatio;
        ctx.arc(padSize / 5 * 8, canvas.height - padSize / 5 * 8, padSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.fillStyle = 'rgba(250, 250, 245, 1)';
        ctx.beginPath();
        let tokenSize = 30 * zoomRatio;
        let tokenPosition = this.padPosition;

        //token
        if (this.joystickTouched) {
            let dist = Mathf.getDistance(touchPosition, this.padPosition);
            if (dist >= 30) dist = 30;
            let dir = Math.atan2(touchPosition.y - this.padPosition.y, touchPosition.x - this.padPosition.x);

            this.joystickDir = dir;

            tokenPosition.x += Math.cos(dir) * dist;
            tokenPosition.y += Math.sin(dir) * dist;

            tokenPosition.x += (tokenPosition.x - this.padPosition.x) / 20;
            tokenPosition.y += (tokenPosition.y - this.padPosition.y) / 20;

            ctx.arc(tokenPosition.x, tokenPosition.y, tokenSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgba(150, 150, 150, 1)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    render = () => {
        ctx.fillStyle = 'rgb(120, 255, 150)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < users.length; i++) {
            Renderer.rect(users[i].position.x, users[i].position.y, 40, 40, 2, 0, new Color(250, 150, 120));
        }

        this.renderJoystick();
        this.renderDebug(); // TODO : disable this debug function
    }
}

function findMyPlayer() {
    for (let i = 0; i < users.length; i++) {
        if (users[i].key == document.cookie) {
            myPlayer = users[i];
        }
    }
}

socket.on('gameData', (packet) => {
    users = packet.users;
});

window.onload = () => {
    App.scene = new GameScene();
}