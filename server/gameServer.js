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

        this.bush = null;
        this.shotTimer = 0;

        this.fullHealth = 50;
        this.health = this.fullHealth;

        this.status = {
            moveSpeed: 5,
            shotSpeed: 0.05,
            shotRange: 850,
            bulletSpeed: 55,
            damage: 2,
        }
    }

    tick = (users, damageCircle, io) => {
        if (this.shotTimer < 1) {
            this.shotTimer += this.status.shotSpeed;
        }
        if (getDistance(damageCircle.position, this.position) > damageCircle.radius) {
            this.health -= 0.1;
        }
        if (this.health <= 0) {
            io.emit('playerDied', { key: this.key });
            users.delete(this.key);
        }
    }

    checkCollision = (landforms, MS) => {
        for (let i = 0; i < landforms.length; i++) {
            if (landforms[i].type == 'rock') {
                if (Math.abs(this.targetPosition.x - landforms[i].position.x) <= (MS + MS / 2) &&
                    Math.abs(this.targetPosition.y - landforms[i].position.y) <= (MS + MS / 2)) {
                    return landforms[i];
                }
            }
        }
        return null;
    }

    movement = (packet, landforms, MS) => {
        if (packet.move) {
            let backupX = this.targetPosition.x;
            this.targetPosition.x += Math.round(Math.cos(packet.joystickDir) * this.status.moveSpeed);
            if (this.checkCollision(landforms, MS) != null) {
                this.targetPosition.x = backupX;
            }

            let backupY = this.targetPosition.y;
            this.targetPosition.y += Math.round(Math.sin(packet.joystickDir) * this.status.moveSpeed);
            if (this.checkCollision(landforms, MS) != null) {
                this.targetPosition.y = backupY;
            }
        }

        this.bush = null;
        for (let i = 0; i < landforms.length; i++) {
            if (landforms[i].type == 'bush') {
                if (Math.abs(this.targetPosition.x - landforms[i].position.x) <= (MS + MS / 2) &&
                    Math.abs(this.targetPosition.y - landforms[i].position.y) <= (MS + MS / 2)) {
                    this.bush = landforms[i];
                }
            }
        }

        this.position.x += (this.targetPosition.x - this.position.x) / 10;
        this.position.y += (this.targetPosition.y - this.position.y) / 10;

        this.position.x = Math.round(this.position.x);
        this.position.y = Math.round(this.position.y);
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
        this.bulletRadius = 120 / 2;
    }

    delete = (bullets) => {
        bullets.splice(bullets.indexOf(this), 1);
    }

    movement = (bullets, users, landforms, MS) => {
        this.position.x += Math.cos(this.dir) * this.speed;
        this.position.y += Math.sin(this.dir) * this.speed;

        for (let i = 0; i < landforms.length; i++) {
            if (landforms[i].type == 'rock') {
                if (Math.abs(this.position.x - landforms[i].position.x) <= (MS + this.bulletRadius / 2) &&
                    Math.abs(this.position.y - landforms[i].position.y) <= (MS + this.bulletRadius / 2)) {
                    this.delete(bullets);
                }
            }
        }

        for (const [key, value] of users.entries()) {
            if (value != this.owner) {
                if (Math.abs(this.position.x - value.position.x) <= (MS / 2 + this.bulletRadius / 2) &&
                    Math.abs(this.position.y - value.position.y) <= (MS / 2 + this.bulletRadius / 2)) {
                    value.health -= this.damage;
                    this.delete(bullets);
                }
            }
        }

        if (getDistance(this.spawnPosition, this.position) > this.range)
            this.delete(bullets);

        this.position.x = Math.round(this.position.x);


        this.position.y = Math.round(this.position.y);
    }
}

class Rock {
    constructor(x, y) {
        this.position = { x: Math.round(x), y: Math.round(y) };
        this.type = 'rock';
    }
}

class Bush {
    constructor(x, y) {
        this.position = { x: Math.round(x), y: Math.round(y) };
        this.type = 'bush';
    }
}

module.exports = { Player, Rock, Bush };