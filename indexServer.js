const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');

const { Player, Rock, Bush } = require('./server/gameServer');
const { deflateRaw } = require('zlib');

app.use(express.static('static'));
app.use(express.static('static/assets'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

const MS = 100;
const DAMAGE_CIRCLE_RADIUS = 5000;

var damageCircle = { position: { x: 0, y: 0 }, radius: DAMAGE_CIRCLE_RADIUS };
var users = new Map();
var bullets = [];
var landforms = [];

function createLandforms() {
    for (let i = 0; i < 20; i++) {
        landforms.push(new Rock(Math.round(Math.random() * 8000) - 4000, Math.round(Math.random() * 8000) - 4000));
    }
    for (let i = 0; i < 20; i++) {
        landforms.push(new Bush(Math.round(Math.random() * 8000) - 4000, Math.round(Math.random() * 8000) - 4000));
    }
}

createLandforms();

var keyCache = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '!', '@', '#', '$', '%', '^', '&', '*',
];

function createUserKey() {
    let done = false;

    let _key = '';
    while (!done) {
        _key = '';

        for (let i = 0; i < 10; i++) {
            _key += keyCache[Math.round(Math.random() * (keyCache.length - 1))];
        }

        if (!users.has('_key'))
            done = true;
    }

    return _key;
}

io.on('connection', (socket) => {
    socket.on('enterGameRoom', (packet) => {
        let key = createUserKey();
        io.emit('enterGameRoomConfirmed', { key: key });

        users.set(key, new Player(key, packet.name));
    });
    socket.on("ping", (callback) => {
        callback();
    });
    socket.on('userInput', (packet) => {
        if (users.has(packet.key)) {
            // update user with packet
            users.get(packet.key).movement({ joystickDir: packet.joystickDir, move: packet.move }, landforms, MS);
            users.get(packet.key).shotUpdate({ gunDir: packet.gunDir, shot: packet.shot }, bullets, MS);
        }
    });
});

function updateGame() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].movement(bullets, users, landforms, MS, io);
    }

    for (const [key, value] of users.entries()) {
        value.tick(users, damageCircle, io);
    }
}

function sendGamePackets() {
    var data = new Object();

    data.users = [];
    data.bullets = bullets;
    data.landforms = landforms;

    data.damageCircle = damageCircle;

    var gameData = new Object();
    gameData.MS = MS;

    data.gameData = gameData;

    for (const [key, value] of users.entries()) {
        let userData = new Object();
        userData.position = value.position;
        userData.health = value.health;
        userData.fullHealth = value.fullHealth;
        userData.key = value.key;
        userData.name = value.name;
        userData.bush = value.bush;
        userData.visualDir = value.visualDir;
        userData.reboundValue = value.reboundValue;

        data.users.push(userData);
    }

    io.emit('gameData', data);
}

function decreaseDamageCircle() {

    damageCircle.position.x += Math.round(Math.random() * 200) - 100;
    damageCircle.position.y += Math.round(Math.random() * 200) - 100;
    damageCircle.radius -= 200;

    if (damageCircle.radius > 0)
        setTimeout(() => { decreaseDamageCircle() }, 1000 * 5);
}

function update() {
    updateGame();
    sendGamePackets();
}

server.listen(3000, async () => {
    console.log('listening on *:3000');
});

decreaseDamageCircle();
setInterval(update, 1000 / 60);