const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { Player } = require('./server/gameServer');


app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

var users = new Map();

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

    socket.on('userInput', (packet) => {
        if (users.has(packet.key))
            users.get(packet.key).movement({ w: packet.w, s: packet.s, a: packet.a, d: packet.d });
    });
});

function update() {
    var data = new Object();
    data.users = [];

    for (const [key, value] of users.entries()) {
        data.users.push(value);
    }

    io.emit('gameData', data);
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});

setInterval(update, 1000 / 60);