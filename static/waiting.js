
class Waiting extends Scene {
    constructor() {
        super();
    }

    tick = () => {
        ctx = App.ctx;
        canvas = App.canvas;

    }

    render = () => {
        ctx.fillStyle = 'rgb(120, 255, 150)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "bold 48px blackHanSans";
        ctx.textAlign = 'center';

        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.fillText('대기중...', canvas.width / 2, canvas.height / 2);
    }
}

socket.on('endWaiting', (packet) => {
    if (state == 'waiting') {
        changeState('game');
    }
});