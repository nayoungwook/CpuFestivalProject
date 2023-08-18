var socket = io();

var app = new App();
var ctx = App.ctx;
var canvas = App.canvas;

class LobbyScene extends Scene {
    constructor() {
        super();

        this.createNameInput();
        this.createEnterButton();
    }

    createEnterButton = () => {
        let _width = 200, _height = 50;

        this.button = document.createElement('button');

        this.button.style.position = 'fixed';
        this.button.style.left = (window.innerWidth / 2 - _width / 2 + 5) + 'px';
        this.button.style.top = (window.innerHeight / 2 - _height / 2 + _height * 2) + 'px';
        this.button.style.width = _width + 'px';
        this.button.style.height = _height + 'px';
        this.button.style.borderWidth = '3px';
        this.button.style.borderRadius = '10px';
        this.button.style.backgroundColor = 'rgb(255, 255, 245)';
        this.button.textContent = '게임 입장';
        this.button.style.font = '30px blackHanSans';

        document.body.appendChild(this.button);

        this.button.onclick = () => {
            socket.emit('enterGameRoom', { name: this.input.value });
        }
    }

    createNameInput = () => {
        let _width = 250, _height = 40;

        this.input = document.createElement('input');

        this.input.type = 'text';
        this.input.style.position = 'fixed';
        this.input.style.left = (window.innerWidth / 2 - _width / 2) + 'px';
        this.input.style.top = (window.innerHeight / 2 - _height / 2) + 'px';
        this.input.style.width = _width + 'px';
        this.input.style.height = _height + 'px';
        this.input.style.borderColor = 'rgb(255, 255, 245)';
        this.input.style.font = '30px blackHanSans';
        this.input.style.textAlign = 'center';
        this.input.style.borderRadius = '5px';
        this.input.placeholder = '이름을 입력하세요.';

        document.body.appendChild(this.input);
        this.input.focus();
    }

    tick = () => {

    }

    renderTitle = () => {
        ctx.font = "bold 48px blackHanSans";
        ctx.textAlign = 'center';

        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.fillText('Cpu Festival Battle Royale', canvas.width / 2, 150);
    }

    render = () => {
        ctx.fillStyle = 'rgb(120, 255, 150)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.renderTitle();
    }
}

socket.on('enterGameRoomConfirmed', (packet) => {
    document.cookie = packet.key;

    location.href = 'game.html';
});

window.onload = () => {
    App.scene = new LobbyScene();
}