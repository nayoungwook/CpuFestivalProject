function getDistance(v1, v2) {
    return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
}

class Player {
    constructor(key, name) {
        this.name = name;
        this.key = key;

        this.position = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };

        this.xv = 0;
        this.yv = 0;


        this.shotTimer = 0;

        this.fullHealth = 50;
        this.health = this.fullHealth;

        this.status = {
            moveSpeed: 4.5,
            shotSpeed: 0.05,
            shotRange: 850,
            bulletSpeed: 40,
            damage: 2,
        }
    }

    tick = (users, io) => {
        if (this.shotTimer < 1) {
            this.shotTimer += this.status.shotSpeed;
        }
        if (this.health <= 0) {
            io.emit('playerDied', { key: this.key });
            users.delete(this.key);
        }
    }

    movement = (packet) => {
        if (packet.move) {
            this.targetPosition.x += Math.round(Math.cos(packet.joystickDir) * this.status.moveSpeed);
            this.targetPosition.y += Math.round(Math.sin(packet.joystickDir) * this.status.moveSpeed);
        }

        this.position.x += (this.targetPosition.x - this.position.x) / 5;
        this.position.y += (this.targetPosition.y - this.position.y) / 5;
    }

    shot = (packet, bullets) => {
        bullets.push(new Bullet(this, packet.gunDir));
        this.shotTimer = 0;
    }

    shotUpdate = (packet, bullets) => {
        let ableToShot = this.shotTimer >= 1 && packet.shot;
        if (ableToShot) {
            this.shot(packet, bullets);
        }
    }
}

class Bullet {
    constructor(owner, dir) {
        this.owner = owner;
        this.position = { x: owner.position.x, y: owner.position.y };
        this.spawnPosition = { x: owner.position.x, y: owner.position.y };
        this.dir = dir;
        this.speed = owner.status.bulletSpeed;
        this.range = owner.status.shotRange;
        this.damage = owner.status.damage;
    }

    delete = (bullets) => {
        bullets.splice(bullets.indexOf(this), 1);
    }

    movement = (bullets, users, MS) => {
        this.position.x += Math.cos(this.dir) * this.speed;
        this.position.y += Math.sin(this.dir) * this.speed;

        for (const [key, value] of users.entries()) {
            if (value != this.owner) {
                if (Math.abs(this.position.x - value.position.x) <= (MS / 2 + (MS / 3 * 2) / 2) &&
                    Math.abs(this.position.y - value.position.y) <= (MS / 2 + (MS / 3 * 2) / 2)) {
                    value.health -= this.damage;
                    this.delete(bullets);
                }
            }
        }

        if (getDistance(this.spawnPosition, this.position) > this.range)
            this.delete(bullets);
    }
}

module.exports = { Player };