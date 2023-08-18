const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
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
        console.debug('[Debug] : user key ' + key + ' has entered.');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});