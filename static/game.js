var socket = io();

var ctx = App.ctx;
var canvas = App.canvas;

var MS = 60;

var die = false;

var users = [];
var usersCache = [];

var bullets = [];
var particles = [];

var landforms = [];

var damageCircle = { position: { x: 0, y: 0 }, radius: 50000 };
var targetDamageCircle;

var myPlayer = undefined;
var zoomRatio = 0;
var globalPacket = null;

var startedTouches = [];
var touches = [];

var bush = null;

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

        this.damageCircleImage = document.createElement('canvas');

        this.characterImage = new Image();
        this.characterImage.src = 'assets/character.png';

        this.rockImage = new Image();
        this.rockImage.src = 'assets/rock.png';

        this.bushImage = new Image();
        this.bushImage.src = 'assets/bush.png';

        this.damageArea = new Image();
        this.damageArea.src = 'assets/damageArea.png';

        this.field = new Image();
        this.field.src = 'assets/field.png';

        this.pistolHandImage = new Image();
        this.pistolHandImage.src = 'assets/pistolWithHands.png';

        this.machineGunHandImage = new Image();
        this.machineGunHandImage.src = 'assets/machineGunWithHands.png';
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

        damageCircle.position.x += (targetDamageCircle.position.x - damageCircle.position.x) / 10;
        damageCircle.position.y += (targetDamageCircle.position.y - damageCircle.position.y) / 10;
        damageCircle.radius += (targetDamageCircle.radius - damageCircle.radius) / 10;

        socket.emit("ping", () => {
            const duration = Date.now() - start;
            this.ping = duration;
        });

        ctx = App.ctx;
        canvas = App.canvas;

        this.damageCircleImage.width = canvas.width;
        this.damageCircleImage.height = canvas.height;

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
            if (users[i] == myPlayer)
                bush = users[i].bush;

            let playerBush = users[i].bush;
            let playerInBush = users[i].bush != null;
            let myPlayerInBush = bush != null;

            if (playerInBush) {
                if (myPlayerInBush) {
                    if (users[i] != myPlayer) {
                        if (Mathf.getDistance(playerBush.position, bush.position) > 2)
                            continue;
                    }
                } else {
                    continue;
                }
            }

            ctx.font = "bold 20px blackHanSans";
            ctx.textAlign = 'center';

            let textureCoord = Mathf.getRenderInfo(users[i].position, MS, MS);

            textureCoord.renderPosition.x = Math.round(textureCoord.renderPosition.x);
            textureCoord.renderPosition.y = Math.round(textureCoord.renderPosition.y);

            ctx.fillStyle = 'rgb(39, 39, 54)';
            ctx.fillText(users[i].name, textureCoord.renderPosition.x, textureCoord.renderPosition.y - MS / 3 * 4);

            if (playerInBush)
                ctx.globalAlpha = 0.5;

            ctx.save();
            ctx.translate(textureCoord.renderPosition.x, textureCoord.renderPosition.y);
            ctx.rotate(users[i].visualDir);

            ctx.drawImage(this.characterImage, -textureCoord.renderWidth / 2, -textureCoord.renderHeight / 2, textureCoord.renderWidth, textureCoord.renderHeight);
            ctx.restore();

            if (users[i].gunSize == null || users[i].gunSize == 0)
                continue;

            let gunCoord = Mathf.getRenderInfo(users[i].gunPosition, users[i].gunSize.width, users[i].gunSize.height);

            ctx.save();
            ctx.translate(gunCoord.renderPosition.x, gunCoord.renderPosition.y);
            ctx.rotate(users[i].visualDir);

            if (users[i].gun.name == 'pistol') {
                ctx.drawImage(this.pistolHandImage, -gunCoord.renderWidth / 2, -gunCoord.renderHeight / 2, gunCoord.renderWidth, gunCoord.renderHeight);
            }
            else if (users[i].gun.name == 'machineGun') {
                ctx.drawImage(this.machineGunHandImage, -gunCoord.renderWidth / 2, -gunCoord.renderHeight / 2 + MS / 6, gunCoord.renderWidth, gunCoord.renderHeight);
            }

            ctx.restore();

            ctx.globalAlpha = 1;
        }
    }

    renderBullets = () => {
        for (let i = 0; i < bullets.length; i++) {
            let textureCoord = Mathf.getRenderInfo(bullets[i].position, bullets[i].bulletRadius, bullets[i].bulletRadius);

            textureCoord.renderPosition.x = Math.round(textureCoord.renderPosition.x);
            textureCoord.renderPosition.y = Math.round(textureCoord.renderPosition.y);

            ctx.beginPath();
            ctx.fillStyle = 'rgb(243, 245, 140)';
            ctx.arc(textureCoord.renderPosition.x - textureCoord.renderWidth / 2, textureCoord.renderPosition.y - textureCoord.renderHeight / 2, textureCoord.renderWidth / 2, 0, 2 * Math.PI);
            ctx.fill();

            for (let j = 0; j < 20; j++) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(243, 245, 140, ${(255 - j * 13) / 255})`;
                ctx.arc(textureCoord.renderPosition.x - textureCoord.renderWidth / 2 + Math.cos(Math.PI + bullets[i].dir) * 4 * j
                    , textureCoord.renderPosition.y - textureCoord.renderHeight / 2 + Math.sin(Math.PI + bullets[i].dir) * 4 * j, textureCoord.renderWidth / 2, 0, 2 * Math.PI);
                ctx.fill();
            }
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

    renderDamageCircle = () => {
        if (damageCircle == null) return;

        let _ctx = this.damageCircleImage.getContext('2d');
        let coord = Mathf.getRenderInfo(damageCircle.position, damageCircle.radius, damageCircle.radius);

        _ctx.clearRect(0, 0, canvas.width, canvas.height);
        _ctx.globalAlpha = 0.8;
        _ctx.drawImage(this.damageArea, 0, 0, canvas.width, canvas.height);
        _ctx.globalAlpha = 1;

        _ctx.beginPath();
        _ctx.fillStyle = "rgba(0, 0, 0, 1)";
        _ctx.globalCompositeOperation = 'destination-out';
        _ctx.arc(coord.renderPosition.x, coord.renderPosition.y, coord.renderWidth, 0, Math.PI * 2);
        _ctx.fill();

        _ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.damageCircleImage, 0, 0, canvas.width, canvas.height);
    }

    renderField = () => {
        let coord = Mathf.getRenderInfo(new Vector(-5000, -5000), 5000 * 2, 5000 * 2);
        ctx.drawImage(this.field, coord.renderPosition.x, coord.renderPosition.y, coord.renderWidth, coord.renderHeight);
    }

    renderUI = () => {
        for (let i = 0; i < users.length; i++) {
            if (users[i] == myPlayer)
                bush = users[i].bush;

            let playerBush = users[i].bush;
            let playerInBush = users[i].bush != null;
            let myPlayerInBush = bush != null;

            if (playerInBush) {
                if (myPlayerInBush) {
                    if (users[i] != myPlayer) {
                        if (Mathf.getDistance(playerBush.position, bush.position) > 2)
                            continue;
                    }
                } else {
                    continue;
                }
            }
            let textureCoord = Mathf.getRenderInfo(users[i].position, MS, MS);

            ctx.font = "bold 20px blackHanSans";
            ctx.textAlign = 'center';

            ctx.fillStyle = 'rgb(39, 39, 54)';
            ctx.fillText(users[i].name, textureCoord.renderPosition.x, textureCoord.renderPosition.y - MS / 3 * 4);

            ctx.fillStyle = 'rgb(39, 39, 54)';
            ctx.fillRect(textureCoord.renderPosition.x - MS / 2, textureCoord.renderPosition.y - MS, MS, MS / 5);

            ctx.fillStyle = 'rgb(255, 100, 154)';
            if (users[i].fullHealth != 0)
                ctx.fillRect(textureCoord.renderPosition.x - MS / 2, textureCoord.renderPosition.y - MS, (MS * users[i].health) / users[i].fullHealth, MS / 5);
        }
    }

    renderParticles = () => {
        for (let i = 0; i < particles.length; i++) {
            particles[i].render();
        }
    }

    render = () => {
        ctx.fillStyle = 'rgb(120, 255, 150)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.renderField();

        this.renderBullets();
        this.renderLandforms();
        this.renderPlayers();

        this.renderParticles();

        this.renderDamageCircle();

        this.renderUI();
        this.renderDebug(); // TODO : disable this debug function

        this.renderJoystick(this.padPosition, this.joystickTouch);
        this.renderJoystick(this.gunPadPosition, this.gunJoystickTouch);

        this.renderDieScreen();
    }
}

function findMyPlayer() {
    for (let i = 0; i < users.length; i++) {
        if (users[i].key == document.cookie) {
            let backupHealth = 0;
            if (myPlayer != null)
                backupHealth = myPlayer.health;

            myPlayer = users[i];

            if (myPlayer != null && myPlayer.health != backupHealth) {
                Camera.position.x += Math.round(Math.random() * 30) - 15;
                Camera.position.y += Math.round(Math.random() * 30) - 15;
            }
        }
    }
}

socket.on('gameData', (packet) => {
    globalPacket = packet;

    MS = packet.gameData.MS;

    //    usersCache = users;
    usersCache = packet.users;
    users = packet.users;
    /*
        let _curUsers = new Map();
    
        for (let i = 0; i < users.length; i++) {
            _curUsers.set(users[i].key, users[i]);
        }
    
        for (let i = 0; i < usersCache.length; i++) {
            if (_curUsers.has(usersCache[i].key)) {
                let _tUser = _curUsers.get(usersCache[i].key);
    
                _tUser.position.x += (usersCache[i].position.x - _tUser.position.x) / 10;
                _tUser.position.y += (usersCache[i].position.y - _tUser.position.y) / 10;
            } else {
                _curUsers.set(usersCache[i].key, usersCache[i]);
            }
        }
    
        let updatedUsers = [];
        for (const [key, value] of _curUsers.entries()) {
            updatedUsers.push(value);
        }
    
        users = updatedUsers;
    */

    landforms = packet.landforms;

    bullets = packet.bullets;

    targetDamageCircle = packet.damageCircle;
});

socket.on('playerDied', (packet) => {
    if (packet.key == myPlayer.key) {
        die = true;
        console.log('die!');
    }
});

socket.on('particleBullet', (packet) => {
    for (let i = 0; i < Math.round(Math.random() * 5) + 4; i++)
        particles.push(new BulletParticle(packet.position.x, packet.position.y, packet.radius));
});