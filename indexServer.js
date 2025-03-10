const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const { createLandforms, MAP_SCALE } = require('./server/gameServer');
const { Mathf } = require('./server/neko');
const { Bush, Rock } = require('./server/mapObject');
const { Bullet, bullets } = require('./server/bullet');
const { createUserKey } = require('./server/keyCreator');
const { Player, users } = require('./server/player');
const { items, PistolItem, MachineGunItem, ShotGunItem, BandageItem, MonsterEnergyItem, AidKitItem, GrenadeItem, HalloweenGrenadeItem, GrenadeLauncherItem, JPTeacherItem, JMTeacherItem, JATeacherItem } = require('./server/item');
const { throwableObjects, Grenade } = require('./server/throwableObject');
const { Supply, supplies } = require('./server/supply');
const { grenadeLauncher } = require('./server/gun');

app.use(express.static('static'));
app.use(express.static('static/assets'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

module.exports = { io };

const MS = 100;
const DAMAGE_CIRCLE_RADIUS = MAP_SCALE / 2;

var damageCircle = { position: { x: 0, y: 0 }, radius: DAMAGE_CIRCLE_RADIUS };
var landforms = [];

function createPositionInCircle() {
    let done = false;
    let result;

    while (!done) {
        let _position = { x: Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, y: Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2 }
        if (Mathf.getDistance(_position, damageCircle.position) <= damageCircle.radius - MS * 5) {
            result = _position;
            done = true;
        }
    }

    return result;
}

io.on('connection', (socket) => {
    socket.on('enterGameRoom', (packet) => {
        let key = createUserKey(users);
        io.emit('enterGameRoomConfirmed', { key: key });

        let _position = createPositionInCircle();
        users.set(key, new Player(key, packet.name, _position.x, _position.y));
        // users.set(key, new Player(key, packet.name, 0, 0));
    });
    socket.on("ping", (callback) => {
        callback();
    });
    socket.on('userInput', (packet) => {
        if (users.has(packet.key)) {
            // update user with packet
            users.get(packet.key).movement({ joystickDir: packet.joystickDir, move: packet.move }, landforms, supplies, MS, MAP_SCALE);
            users.get(packet.key).useUpdate({ gunDir: packet.gunDir, use: packet.use }, bullets, MS, items, io);
            users.get(packet.key).selectedSlot = packet.selectedSlot;
        }
    });
    socket.on('dropItem', (packet) => {
        if (users.has(packet.key)) {
            let user = users.get(packet.key);

            let item = user.items[packet.selectedSlot - 1];

            if (item == null) return;

            let userItems = user.items;

            userItems[(userItems.indexOf(item))] = null;
            let _outItem = item;
            let _outDir = Math.random() * Math.PI * 2;

            _outItem.power = 10;
            _outItem.outDir = _outDir;

            _outItem.position.x = user.position.x + Math.cos(_outDir) * MS * 1.5;
            _outItem.position.y = user.position.y + Math.sin(_outDir) * MS * 1.5;

            items.push(_outItem);
        }
    });
});

function playSound(src, position) {
    io.emit('playSound', { src: src, position: position });
}

var gameInterval = null;

function updateGame() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].movement(bullets, users, landforms, supplies, MS, io);
    }

    for (let i = 0; i < throwableObjects.length; i++) {
        throwableObjects[i].movement(throwableObjects, users, landforms, supplies, MS, io);
    }

    for (let i = 0; i < supplies.length; i++) {
        supplies[i].tick();
    }

    for (const [key, value] of users.entries()) {
        value.tick(users, damageCircle, io, MS, items);
    }

    for (let i = 0; i < items.length; i++) {
        items[i].update();
        items[i].collision(MS, users, landforms);
    }

    if (users.size == 1) {
        io.emit('gameEnd', { winner: Array.from(users.values())[0] });
        console.log('게임 종료. 승자 : ' + Array.from(users.values())[0].name);
        console.log('!!!상품 수령 후, 서버를 종료하세요!!!');
        if (gameInterval != null) {
            clearInterval(gameInterval);
        }
    }
}

function sendGamePackets() {
    var data = new Object();

    data.users = [];
    data.bullets = bullets;
    data.landforms = landforms;
    data.items = items;
    data.throwableObjects = throwableObjects;
    data.MAP_SCALE = MAP_SCALE;
    data.damageCircle = damageCircle;

    data.supplies = supplies;

    var gameData = new Object();
    gameData.MS = MS;

    data.gameData = gameData;

    for (const [key, value] of users.entries()) {
        let userData = new Object();
        userData.position = { x: Math.round(value.position.x), y: Math.round(value.position.y) };
        userData.health = value.health;
        userData.fullHealth = value.fullHealth;
        userData.key = value.key;
        userData.name = value.name;
        userData.bush = value.bush;
        userData.visualDir = value.visualDir;
        userData.reboundValue = value.reboundValue;
        userData.gun = value.gun;
        userData.gunPosition = value.gunPosition;
        userData.gunSize = value.gunSize;
        userData.items = value.items;
        userData.currentItem = value.currentItem;
        userData.expendableCharge = value.expendableCharge;
        userData.shield = value.shield;
        userData.selectedSlot = value.selectedSlot;
        userData.meleeDir = value.meleeDir;
        userData.kill = value.kill;

        data.users.push(userData);
    }

    io.emit('gameData', data);
}

function decreaseDamageCircle() {
    damageCircle.position.x += Math.round(Math.random() * 200) - 100;
    damageCircle.position.y += Math.round(Math.random() * 200) - 100;
    damageCircle.radius -= 90;

    if (damageCircle.radius > 0)
        setTimeout(() => { decreaseDamageCircle() }, 1000 * (Math.round(Math.random() * 5) + 3));
}

function summonSupply() {
    let _position = createPositionInCircle();
    supplies.push(new Supply(MS, _position.x, _position.y));
    io.emit('addLog', { content: '보급품이 드랍되었습니다!' });

    setTimeout(() => {
        summonSupply();
    }, 1000 * 60 * (Math.round(Math.random() * 3) + 1));
}

function initialize() {
    createLandforms(landforms, MS);
    decreaseDamageCircle();

    setTimeout(() => {
        summonSupply();
    }, 1000 * 60 * (Math.round(Math.random() * 3) + 1));

    for (let i = 0; i < 2; i++) {
        items.push(new PistolItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new PistolItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new MachineGunItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new MachineGunItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new ShotGunItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new ShotGunItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new BandageItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new BandageItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new AidKitItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new MonsterEnergyItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new MonsterEnergyItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new MonsterEnergyItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new GrenadeItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new GrenadeItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new GrenadeItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new HalloweenGrenadeItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new HalloweenGrenadeItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
        items.push(new GrenadeLauncherItem(Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, Math.round(Math.random() * 8000) - 4000));
    }
}

function update() {
    updateGame();
    sendGamePackets();
}

server.listen(3000, async () => {
    console.log('listening on *:3000');
    console.log('CpuFestivalProject 서버 시작중...');
    console.log('initialize completed.');

    const rl = readline.createInterface({ input, output });

    let userCount = 0;

    await rl.question('유저 수 입력 : ', (answer) => {
        // TODO: Log the answer in a database
        userCount = answer;
        rl.close();

        const waitInterval = setInterval(
            () => {
                console.log('서버 인원 대기중, 현재 인원 : ' + users.size + '/' + userCount);
                if (users.size >= userCount) {

                    console.log('서버인원 확인됨.');
                    io.emit('endWaiting');
                    initialize();

                    clearInterval(waitInterval);
                    gameInterval = setInterval(update, 1000 / 60);
                }
            }, 1000);
    });
});


module.exports = { playSound };
