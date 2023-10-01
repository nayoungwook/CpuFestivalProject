function getDistance(v1, v2) {
    return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
}

class Player {
    constructor(key, name) {
        this.name = name;
        this.key = key;

        this.position = { x: 0, y: 0 };

        this.xv = 0;
        this.yv = 0;


        this.shotTimer = 0;

        this.health = 10;
        this.fullHealth = 10;

        this.status = {
            moveSpeed: 3.5,
            shotSpeed: 0.15,
            shotRange: 350,
            bulletSpeed: 20,
            damage: 2,
        }
    }

    tick = () => {
        if (this.shotTimer < 1) {
            this.shotTimer += this.status.shotSpeed;
        }
    }

    movement = (packet) => {
        if (packet.move) {
            this.position.x += Math.round(Math.cos(packet.joystickDir) * this.status.moveSpeed);
            this.position.y += Math.round(Math.sin(packet.joystickDir) * this.status.moveSpeed);
        }
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

    movement = (bullets, users) => {
        this.position.x += Math.cos(this.dir) * this.speed;
        this.position.y += Math.sin(this.dir) * this.speed;

        for (const [key, value] of users.entries()) {
            if (value != this.owner) {
                if (getDistance(this.position, value.position) <= 30) {
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