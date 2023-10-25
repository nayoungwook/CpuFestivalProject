var state = 'null';

changeState = (_state) => {
    if (state == 'index') {
        while (document.getElementById('element') != undefined) {
            document.getElementById('element').remove();
        }
    }
    if (state != 'null')
        document.getElementById('canvas').remove();

    state = _state;

    var app = new App();
    if (state == 'index') {
        App.scene = new LobbyScene();
    } else if (state == 'game') {
        App.scene = new GameScene();
    } else if(state == 'waiting'){
        App.scene = new Waiting();
    }
}

changeState('index');