const { Mathf } = require("./neko");

var throwableObjects = [];

class Grenade {
    constructor(owner, x, y, dir, MS) {
        this.owner = owner;
        this.dir = dir;
        this.position = { x: x, y: y };
        this.type = 'Grenade';

        this.speed = 60;
        this.damage = 15;
        this.visualDir = dir;
        this.dirSpeed = 0.5;
    }

    delete = (throwableObjects) => {
        throwableObjects.splice(throwableObjects.indexOf(this), 1);
    }

    explode = (io, users, MS) => {
        io.emit('explosion', { position: this.position });

        for (const [key, value] of users.entries()) {
            if (Mathf.getDistance(value.position, this.position) <= MS * 3) {
                value.shield -= this.damage;

                if (value.shield < 0) {
                    value.health -= -value.shield;
                    value.shield = 0;
                }

                value.moveSpeed = value.status.moveSpeed / 5;
            }
        }

        this.delete(throwableObjects);
    }

    movement = (throwableObjects, users, landforms, MS, io) => {
        this.position.x += Math.cos(this.dir) * this.speed;
        this.position.y += Math.sin(this.dir) * this.speed;

        this.speed += (0 - this.speed) / 10;
        this.dirSpeed += (0 - this.dirSpeed) / 20;

        this.visualDir += this.dirSpeed;

        if (Math.round(this.speed) <= 0) {
            this.explode(io, users, MS);
        }

        for (const [key, value] of users.entries()) {
            if (value != this.owner) {
                if (Math.abs(this.position.x - value.position.x) <= (MS / 2 + MS / 3 * 2 / 2) &&
                    Math.abs(this.position.y - value.position.y) <= (MS / 2 + MS / 3 * 2 / 2)) {
                    this.explode(io, users, MS);
                }
            }
        }

        this.position.x = Math.round(this.position.x);
        this.position.y = Math.round(this.position.y);
    }
}

module.exports = { throwableObjects, Grenade };