const { Mathf } = require("./neko");

var bullets = [];

class Bullet {
    constructor(owner, dir, MS) {
        this.owner = owner;
        this.dir = dir;
        this.position = { x: owner.gunPosition.x, y: owner.gunPosition.y };
        this.spawnPosition = { x: this.position.x, y: this.position.y };
        this.speed = owner.status.gun.bulletSpeed;
        this.range = owner.status.gun.shotRange;
        this.damage = owner.status.gun.damage;
        this.bulletRadius = 30 / 2;

        this.position.x += Math.cos(this.dir) * MS / 2 * 3;
        this.position.y += Math.sin(this.dir) * MS / 2 * 3;
    }

    delete = (bullets) => {
        let { playSound } = require('../indexServer');
        playSound('BulletHit', this.position);
        bullets.splice(bullets.indexOf(this), 1);
    }

    movement = (bullets, users, landforms, supplies, MS, io) => {
        this.position.x += Math.cos(this.dir) * this.speed;
        this.position.y += Math.sin(this.dir) * this.speed;

        for (let i = 0; i < landforms.length; i++) {
            if (landforms[i].type == 'rock') {
                if (Mathf.getDistance(this.position, landforms[i].position) <= (this.bulletRadius * 2 + MS * 2) / 2) {
                    io.emit('particleBullet', { position: this.position, radius: this.bulletRadius });
                    this.delete(bullets);
                }
            }
        }

        for (let i = 0; i < supplies.length; i++) {
            if (Math.abs(supplies[i].position.x - this.position.x) <= (this.bulletRadius * 2 + supplies[i].width) / 2 &&
                Math.abs(supplies[i].position.y - this.position.y) <= (this.bulletRadius * 2 + supplies[i].height) / 2) {
                supplies[i].health -= this.damage;
                io.emit('particleBullet', { position: this.position, radius: this.bulletRadius });
                this.delete(bullets);
            }
        }

        for (const [key, value] of users.entries()) {
            if (value != this.owner) {
                if (Math.abs(this.position.x - value.position.x) <= (MS / 2 + this.bulletRadius / 2) &&
                    Math.abs(this.position.y - value.position.y) <= (MS / 2 + this.bulletRadius / 2)) {

                    if (value.shield > 0)
                        io.emit('particleShield', { position: this.position });

                    value.shield -= this.damage;

                    if (value.shield < 0) {
                        io.emit('particleBlood', { position: this.position });
                        value.health -= -value.shield;
                        value.shield = 0;
                    }

                    value.moveSpeed = value.status.moveSpeed / 2;

                    io.emit('particleBullet', { position: this.position, radius: this.bulletRadius });
                    this.delete(bullets);
                }
            }
        }

        if (Mathf.getDistance(this.spawnPosition, this.position) > this.range)
            this.delete(bullets);

        this.position.x = Math.round(this.position.x);


        this.position.y = Math.round(this.position.y);
    }
}

module.exports = { Bullet, bullets };