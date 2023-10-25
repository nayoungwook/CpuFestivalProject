var socket = io();
var ctx = App.ctx;
var canvas = App.canvas;
var ip = '';
var waitingEnter = false;

class LobbyScene extends Scene {
    constructor() {
        super();

        this.createNameInput();
        this.createEnterButton();
        this.createFullScreenButton();
    }

    createFullScreenButton = () => {
        let _width = 200, _height = 50;

        this.fullscreenButton = document.createElement('button');

        this.fullscreenButton.style.position = 'fixed';
        this.fullscreenButton.id = 'element';
        this.fullscreenButton.style.left = (window.innerWidth / 2 - _width / 2 + 5) + 'px';
        this.fullscreenButton.style.top = (window.innerHeight / 2 - _height / 2 + _height * 2 + 60) + 'px';
        this.fullscreenButton.style.width = _width + 'px';
        this.fullscreenButton.style.height = _height + 'px';
        this.fullscreenButton.style.borderWidth = '3px';
        this.fullscreenButton.style.borderRadius = '10px';
        this.fullscreenButton.style.backgroundColor = 'rgb(255, 255, 245)';
        this.fullscreenButton.textContent = '풀스크린';
        this.fullscreenButton.style.font = '30px blackHanSans';

        document.body.appendChild(this.fullscreenButton);

        this.fullscreenButton.onclick = () => {
            document.documentElement.requestFullscreen();
        }
    }

    createEnterButton = () => {
        let _width = 200, _height = 50;

        this.button = document.createElement('button');

        this.button.style.position = 'fixed';
        this.button.id = 'element';
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
            waitingEnter = true;
            socket.emit('enterGameRoom', { name: this.input.value, ip: ip });
        }
    }

    createNameInput = () => {
        let _width = 250, _height = 40;

        this.input = document.createElement('input');

        this.input.type = 'text';
        this.input.id = 'element';
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
        ctx = App.ctx;
        canvas = App.canvas;

        let _width = 200, _height = 50;
        this.button.style.left = (window.innerWidth / 2 - _width / 2 + 5) + 'px';
        this.button.style.top = (window.innerHeight / 2 - _height / 2 + _height * 2) + 'px';

        this.fullscreenButton.style.left = (window.innerWidth / 2 - _width / 2 + 5) + 'px';
        this.fullscreenButton.style.top = (window.innerHeight / 2 - _height / 2 + _height * 2 + 60) + 'px';

        _width = 250, _height = 40;
        this.input.style.left = (window.innerWidth / 2 - _width / 2) + 'px';
        this.input.style.top = (window.innerHeight / 2 - _height / 2) + 'px';

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

        ctx.fillSTyle - 'rgb(0, 0, 0)';
        ctx.textAlign = 'left';
        ctx.font = "bold 20px blackHanSans";
        ctx.fillText('<Copyright 2023. made by 나영욱, 이대원, 김보승, 왕환웅, 김리안, 최수경, 송지원, 최종훈, 박건하, 김민제, 임혜원 (Cpu 동아리) All right reserved.>', 20, canvas.height - 20);
    }
}

socket.on('enterGameRoomConfirmed', (packet) => {
    if (state == 'index' && waitingEnter) {
        document.cookie = packet.key;
        changeState('game');
    }
});