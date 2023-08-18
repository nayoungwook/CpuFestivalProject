class Player {
    constructor(key, name) {
        this.key = key;
        this.name = name;

        this.position = { x: 0, y: 0 };
    }

    movement = (packet) => {
        if (packet.w)
            this.position.y -= 4;
        if (packet.s)
            this.position.y += 4;
        if (packet.a)
            this.position.x -= 4;
        if (packet.d)
            this.position.x += 4;
    }
}

module.exports = { Player };