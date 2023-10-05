var socket = io();

var ctx = App.ctx;
var canvas = App.canvas;

var MS = 60;

var die = false;

var users = [];
var usersCache = [];

var bullets = [];
var landforms = [];

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

class GameScene extends Scene {
    constructor() {
        super();

        this.initializeGame();
        this.padPosition = new Vector(0, 0);
        this.gunPadPosition = new Vector(0, 0);
        this.joystickDir = 0;
        this.gunJoystickDir = 0;
        this.frame = 0;
        this.ping = 0;
        this.lastUpdate = Date.now();

        this.characterImage = new Image();
        this.characterImage.src = 'assets/character.png';

        this.bulletImage = new Image();
        this.bulletImage.src = 'assets/bullet.png';

        this.rockImage = new Image();
        this.rockImage.src = 'assets/rock.png';

        this.bushImage = new Image();
        this.bushImage.src = 'assets/bush.png';
    }

    initializeGame = () => {

    }

    sendPacket = () => {
        let _joystickDir = 0;
        if (this.joystickTouch != null)
            _joystickDir = Math.atan2(this.joystickTouch.clientY - this.padPosition.y, this.joystickTouch.clientX - this.padPosition.x);

        let _gunDir = 0;
        if (this.gunJoystickTouch != null)
            _gunDir = Math.atan2(this.gunJoystickTouch.clientY - this.gunPadPosition.y, this.gunJoystickTouch.clientX - this.gunPadPosition.x);

        this.joystickDir = _joystickDir;
        this.gunJoystickDir = _gunDir;

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
        const start = Date.now();

        socket.emit("ping", () => {
            const duration = Date.now() - start;
            this.ping = duration;
        });

        ctx = App.ctx;
        canvas = App.canvas;

        var now = Date.now();
        var dt = now - this.lastUpdate;
        this.lastUpdate = now;
        this.frame = Math.round(1000 / dt);

        zoomRatio = (canvas.width / 1920);
        let padSize = 100 * zoomRatio;

        this.padPosition.x = padSize / 5 * 14;
        this.padPosition.y = canvas.height - padSize / 5 * 14;

        this.gunPadPosition.x = canvas.width - padSize / 5 * 14;
        this.gunPadPosition.y = canvas.height - padSize / 5 * 14;

        if (die) {
            Camera.position.z += (0.3 - Camera.position.z) / 20;
        }
        else {
            Camera.position.z = zoomRatio;
        }

        findMyPlayer();
        if (!myPlayer) return;

        Camera.position.x += Math.round(((myPlayer.position.x - canvas.width / 2) - Camera.position.x) / 15);
        Camera.position.y += Math.round(((myPlayer.position.y - canvas.height / 2) - Camera.position.y) / 15);

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
        ctx.fillText('Ping : ' + this.ping, 10, 90);
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
            if (dist >= 90) dist = 90;
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

            let textureCoord = Mathf.getRenderInfo(users[i].position, MS, MS);

            textureCoord.renderPosition.x = Math.round(textureCoord.renderPosition.x);
            textureCoord.renderPosition.y = Math.round(textureCoord.renderPosition.y);

            ctx.fillStyle = 'rgb(39, 39, 54)';
            ctx.fillText(users[i].name, textureCoord.renderPosition.x, textureCoord.renderPosition.y - MS / 3 * 4);

            ctx.drawImage(this.characterImage, textureCoord.renderPosition.x - textureCoord.renderWidth / 2,
                textureCoord.renderPosition.y - textureCoord.renderHeight / 2, textureCoord.renderWidth, textureCoord.renderHeight);

            ctx.fillStyle = 'rgb(39, 39, 54)';
            ctx.fillRect(textureCoord.renderPosition.x - MS / 2, textureCoord.renderPosition.y - MS, MS, MS / 5);

            ctx.fillStyle = 'rgb(255, 100, 154)';
            if (users[i].fullHealth != 0)
                ctx.fillRect(textureCoord.renderPosition.x - MS / 2, textureCoord.renderPosition.y - MS, (MS * users[i].health) / users[i].fullHealth, MS / 5);

        }
    }

    renderBullets = () => {
        for (let i = 0; i < bullets.length; i++) {

            let textureCoord = Mathf.getRenderInfo(bullets[i].position, MS / 3 * 2, MS / 3 * 2);

            textureCoord.renderPosition.x = Math.round(textureCoord.renderPosition.x);
            textureCoord.renderPosition.y = Math.round(textureCoord.renderPosition.y);

            ctx.fillStyle = 'rgb(250, 255, 120)';
            ctx.drawImage(this.bulletImage, textureCoord.renderPosition.x - textureCoord.renderWidth / 2,
                textureCoord.renderPosition.y - textureCoord.renderHeight / 2, textureCoord.renderWidth, textureCoord.renderHeight);
        }
    }

    renderDieScreen = () => {
        if (!die) return;

        ctx.fillStyle = 'rgba(40, 40, 40, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "bold 100px blackHanSans";
        ctx.textAlign = 'center';

        ctx.fillStyle = 'rgb(250, 150, 120)';
        ctx.fillText('사망하셨습니다.', canvas.width / 2, canvas.height / 3);

    }

    renderLandforms = () => {
        for (let i = 0; i < landforms.length; i++) {
            let textureCoord = Mathf.getRenderInfo(landforms[i].position, MS * 2, MS * 2);

            textureCoord.renderPosition.x = Math.round(textureCoord.renderPosition.x);
            textureCoord.renderPosition.y = Math.round(textureCoord.renderPosition.y);

            let landformImage = null;
            if (landforms[i].type == 'rock')
                landformImage = this.rockImage;
            else if (landforms[i].type == 'bush')
                landformImage = this.bushImage;

            if (landformImage == null) continue;

            ctx.drawImage(landformImage, textureCoord.renderPosition.x - textureCoord.renderWidth / 2,
                textureCoord.renderPosition.y - textureCoord.renderHeight / 2, textureCoord.renderWidth, textureCoord.renderHeight);
        }
    }

    render = () => {
        ctx.fillStyle = 'rgb(120, 255, 150)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.renderLandforms();
        this.renderPlayers();
        this.renderBullets();

        this.renderDebug(); // TODO : disable this debug function

        this.renderJoystick(this.padPosition, this.joystickTouch);
        this.renderJoystick(this.gunPadPosition, this.gunJoystickTouch);

        this.renderDieScreen();
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

    MS = packet.gameData.MS;

    //    usersCache = users;
    users = packet.users;
    landforms = packet.landforms;

    bullets = packet.bullets;
});

socket.on('playerDied', (packet) => {
    if (packet.key == myPlayer.key) {
        die = true;
        console.log('die!');
    }
})