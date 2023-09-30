class Player {
    constructor(key, name) {
        this.name = name;
        this.key = key;

        this.position = { x: 0, y: 0 };
        this.moveSpeed = 3.2;
    }

    movement = (packet) => {
        if (packet.move) {
            this.position.x += Math.round(Math.cos(packet.joystickDir) * this.moveSpeed);
            this.position.y += Math.round(Math.sin(packet.joystickDir) * this.moveSpeed);
        }
    }

    shot = (packet, bullets) => {
        if (packet.shot) {
            bullets.push(new Bullet(this.position, packet.gunDir, 15));
        }
    }
}

class Bullet {
    constructor(position, dir, speed) {
        this.position = { x: position.x, y: position.y };
        this.dir = dir;
        this.speed = speed;
    }

    movement = () => {
        this.position.x += Math.cos(this.dir) * this.speed;
        this.position.y += Math.sin(this.dir) * this.speed;
    }
}

module.exports = { Player };