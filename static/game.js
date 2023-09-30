var socket = io();

var ctx = App.ctx;
var canvas = App.canvas;

const MS = 60;

var keyW = false, keyS = false, keyA = false, keyD = false;

var users = [];
var bullets = [];
var myPlayer = undefined;
var zoomRatio = 0;
var globalPacket = null;

var startedTouches = [];
var touches = [];

addEventListener('touchstart', (e) => {
    startedTouches = e.touches;
    touches = e.touches;
});

addEventListener('touchmove', (e) => {
    touches = e.touches;
});

addEventListener('touchend', (e) => {
    touches = e.touches;
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
        this.gunPadPosition = new Vector(0, 0);
        this.joystickTouched = false;
        this.joystickDir = 0;
        this.gunJoystickTouched = false;
        this.gunJoystickDir = 0;
        this.frame = 0;
        this.lastUpdate = Date.now();
    }

    initializeGame = () => {

    }

    sendPacket = () => {

        let _joystickDir;
        if (this.joystickTouch != null)
            _joystickDir = Math.atan2(this.joystickTouch.clientY - this.padPosition.y, this.joystickTouch.clientX - this.padPosition.x);

        let _gunDir;
        if (this.gunJoystickTouch != null)
            _gunDir = Math.atan2(this.gunJoystickTouch.clientY - this.gunPadPosition.y, this.gunJoystickTouch.clientX - this.gunPadPosition.x);

        socket.emit('userInput', {
            joystickDir: _joystickDir, move: this.joystickTouch != null,
            gunDir: _gunDir, shot: this.gunJoystickTouch != null,
            key: document.cookie
        });
    }

    updateJoyStick = () => {
        this.joystickTouch = null;
        this.gunJoystickTouch = null;
        for (let i = 0; i < touches.length; i++) {
            if (Mathf.getDistance(new Vector(touches[i].clientX, touches[i].clientY), this.padPosition) <= 500 * zoomRatio)
                this.joystickTouch = touches[i];

            if (Mathf.getDistance(new Vector(touches[i].clientX, touches[i].clientY), this.gunPadPosition) <= 500 * zoomRatio)
                this.gunJoystickTouch = touches[i];
        }
    }

    tick = () => {
        ctx = App.ctx;
        canvas = App.canvas;
        var now = Date.now();
        var dt = now - this.lastUpdate;
        this.lastUpdate = now;
        this.frame = dt;

        zoomRatio = (canvas.width / 1920);
        let padSize = 100 * zoomRatio;

        this.padPosition.x = padSize / 5 * 14;
        this.padPosition.y = canvas.height - padSize / 5 * 14;

        this.gunPadPosition.x = canvas.width - padSize / 5 * 14;
        this.gunPadPosition.y = canvas.height - padSize / 5 * 14;

        Camera.position.z = zoomRatio;

        findMyPlayer();
        if (!myPlayer) return;

        Camera.position.x += ((myPlayer.position.x - canvas.width / 2) - Camera.position.x) / 10;
        Camera.position.y += ((myPlayer.position.y - canvas.height / 2) - Camera.position.y) / 10;

        this.updateJoyStick();

        this.sendPacket();
    }

    renderDebug = () => {
        ctx.font = "bold 30px blackHanSans";
        ctx.textAlign = 'left';

        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.fillText('Key : ' + document.cookie, 10, 30);

        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.fillText('Frame : ' + this.frame, 10, 60);

        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.font = "bold 10px blackHanSans";
        ctx.fillText('Packet : ' + JSON.stringify(globalPacket), 10, 90);
    }

    renderJoystick = (padPosition, touch) => {

        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.beginPath();
        let padSize = 100 * zoomRatio;
        ctx.arc(padPosition.x, padPosition.y, padSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.fillStyle = 'rgba(250, 250, 245, 1)';
        ctx.beginPath();
        let tokenSize = 30 * zoomRatio;
        let tokenPosition = padPosition;

        if (touch == null) return;

        //token
        if (touch != null) {
            let touchPosition = new Vector(touch.clientX, touch.clientY);
            let dist = Mathf.getDistance(touchPosition, padPosition);
            if (dist >= 30) dist = 30;
            let dir = Math.atan2(touchPosition.y - padPosition.y, touchPosition.x - padPosition.x);

            tokenPosition.x += Math.cos(dir) * dist;
            tokenPosition.y += Math.sin(dir) * dist;

            tokenPosition.x += (tokenPosition.x - padPosition.x) / 20;
            tokenPosition.y += (tokenPosition.y - padPosition.y) / 20;

            ctx.arc(tokenPosition.x, tokenPosition.y, tokenSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgba(150, 150, 150, 1)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    renderPlayers = () => {
        for (let i = 0; i < users.length; i++) {
            ctx.font = "bold 20px blackHanSans";
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgb(39, 39, 54)';

            let textCoord = Mathf.getRenderInfo(users[i].position, 80, 80);

            ctx.fillText(users[i].name, textCoord.renderPosition.x, textCoord.renderPosition.y - MS / 2);
            ctx.fillStyle = 'rgb(250, 150, 120)';
            let playerCoord = Mathf.getRenderInfo(users[i].position, 80, 80);
            ctx.fillRect(playerCoord.renderPosition.x, playerCoord.renderPosition.y, 80, 80);
        }
    }

    renderBullets = () => {
        for (let i = 0; i < bullets.length; i++) {

            let coord = Mathf.getRenderInfo(bullets[i].position, 20, 20);

            ctx.fillStyle = 'rgb(250, 255, 120)';
            ctx.fillRect(coord.renderPosition.x, coord.renderPosition.y, 20, 20);
        }
    }

    render = () => {
        ctx.fillStyle = 'rgb(120, 255, 150)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.renderPlayers();
        this.renderBullets();
        this.renderDebug(); // TODO : disable this debug function
        this.renderJoystick(this.padPosition, this.joystickTouch);
        this.renderJoystick(this.gunPadPosition, this.gunJoystickTouch);
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
    globalPacket = packet;
    users = packet.users;
    bullets = packet.bullets;
});
