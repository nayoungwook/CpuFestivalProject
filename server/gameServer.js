class Player {
    constructor(key, name) {
        this.name = name;
        this.key = key;

        this.position = { x: 0, y: 0 };
        this.moveSpeed = 5;
    }

    movement = (packet) => {
        if (packet.move) {
            this.position.x += Math.round(Math.cos(packet.joystickDir) * this.moveSpeed);
            this.position.y += Math.round(Math.sin(packet.joystickDir) * this.moveSpeed);
        }
    }
}

module.exports = { Player };