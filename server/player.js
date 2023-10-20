const { Bullet } = require('./bullet');
const { pistol, machineGun, shotGun } = require('./gun');
const { Mathf } = require('./neko');

var users = new Map();

class Player {
    constructor(key, name, x, y) {
        this.name = name;
        this.key = key;

        this.position = { x: x, y: y };
        this.targetPosition = { x: x, y: y };

        this.gunPosition = { x: 0, y: 0 };

        this.items = [];
        this.selectedSlot = 0;
        this.currentItem = null;

        this.gunSize = {
            width: 0, height: 0
        }

        this.xv = 0;
        this.yv = 0;

        this.bush = null;
        this.useTimer = 0;

        this.fullHealth = 50;
        this.health = this.fullHealth / 2;

        this.dir = 0;
        this.visualDir = 0;

        this.gun = machineGun;
        this.moveSpeed = 4;

        this.status = {
            moveSpeed: 4,
            gun: this.gun,
        }

        this.reboundValue = 0;
        this.shotVisualDir = false;
        this.expendableCharge = 0;
    }

    tick = (users, damageCircle, io) => {
        this.moveSpeed += (this.status.moveSpeed - this.moveSpeed) / 10;
        this.reboundValue += (0 - this.reboundValue) / 10;

        this.currentItem = this.items[this.selectedSlot - 1];

        if (this.currentItem != null) {
            if (this.currentItem.itemType == 'Gun') {
                this.gun = this.currentItem.gunData;
                this.status.gun = this.gun;
            }
        } else {
            this.status.gun = null;
        }

        if (this.useTimer < 1) {
            if (this.currentItem != null) {
                if (this.currentItem.itemType == 'Gun')
                    this.useTimer += this.status.gun.shotSpeed;
                else if (this.currentItem.itemType == 'Expendable')
                    this.useTimer = 1;
            }
        }
        if (Mathf.getDistance(damageCircle.position, this.position) > damageCircle.radius) {
            this.health -= 0.1;
        }
        if (this.health <= 0) {
            io.emit('playerDied', { user: this, key: this.key });
            users.delete(this.key);
        }
    }

    checkCollision = (landforms, MS) => {
        for (let i = 0; i < landforms.length; i++) {
            if (landforms[i].type == 'rock') {
                if (Mathf.getDistance(this.position, landforms[i].position) <= (MS + MS * 2) / 2) {
                    return landforms[i];
                }
            }
        }
        return null;
    }

    movement = (packet, landforms, MS) => {
        if (packet.move) {
            this.dir = packet.joystickDir;

            this.targetPosition.x += Math.round(Math.cos(packet.joystickDir) * this.moveSpeed);
            this.targetPosition.y += Math.round(Math.sin(packet.joystickDir) * this.moveSpeed);

            let col = this.checkCollision(landforms, MS)
            if (col != null) {
                this.targetPosition.x += (this.targetPosition.x - col.position.x) / 10;
                this.targetPosition.y += (this.targetPosition.y - col.position.y) / 10;
            }
        }

        if (!this.shotVisualDir)
            this.visualDir = this.dir;

        if (this.gun.name == 'pistol') {
            this.gunPosition = {
                x: this.position.x + Math.cos(this.visualDir) * (MS + this.reboundValue),
                y: this.position.y + Math.sin(this.visualDir) * (MS + this.reboundValue),
            }

            this.gunSize = {
                width: MS, height: MS
            }
        }

        if (this.gun.name == 'machineGun') {
            this.gunPosition = {
                x: this.position.x + Math.cos(this.visualDir) * (MS / 3 + this.reboundValue) + Math.cos(this.visualDir + Math.PI / 2) * MS / 2,
                y: this.position.y + Math.sin(this.visualDir) * (MS / 3 + this.reboundValue) + Math.sin(this.visualDir + Math.PI / 2) * MS / 2,
            }

            this.gunSize = {
                width: MS * 8.4 / 5, height: MS * 5 / 5
            }
        }

        if (this.gun.name == 'shotGun') {
            this.gunPosition = {
                x: this.position.x + Math.cos(this.visualDir) * (MS / 3 + this.reboundValue) + Math.cos(this.visualDir + Math.PI / 2) * MS / 2,
                y: this.position.y + Math.sin(this.visualDir) * (MS / 3 + this.reboundValue) + Math.sin(this.visualDir + Math.PI / 2) * MS / 2,
            }

            this.gunSize = {
                width: MS * 8.4 / 5, height: MS * 5 / 5
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
    }

    use = (packet, bullets, MS, items) => {
        this.reboundValue = -MS / 10;

        if (this.currentItem == null) return;

        if (this.currentItem.itemType == 'Gun') {
            if (this.gun != null) {
                if (this.gun.name != 'shotGun') {
                    bullets.push(new Bullet(this, packet.gunDir, MS));
                } else {
                    for (let i = 0; i < 6; i++)
                        bullets.push(new Bullet(this, packet.gunDir + Math.random() / 2 - 0.5 / 2, MS));
                }
            }
            this.useTimer = 0;
        } else if (this.currentItem.itemType == 'Expendable') {
            this.expendableCharge += this.currentItem.chargeTime;
            this.moveSpeed = this.status.moveSpeed / 2;
            if (this.expendableCharge >= 1) {
                this.expendableCharge = 0;

                if (this.currentItem.type == 'Bandage') {
                    this.health += this.currentItem.heal;
                    if (this.health >= this.fullHealth) {
                        this.health = this.fullHealth;
                    }
                }

                let item = this.items[this.selectedSlot - 1];

                if (item == null) return;

                let userItems = this.items;

                userItems.splice(userItems.indexOf(item), 1);
            }
        }
    }

    useUpdate = (packet, bullets, MS, items) => {
        let ableToUse = this.useTimer >= 1 && packet.use;
        this.shotVisualDir = false;

        if (packet.use) {
            this.shotVisualDir = true;
            this.visualDir = packet.gunDir;
            this.dir = packet.gunDir;
        } else {
            this.expendableCharge = 0;
        }

        if (ableToUse) {
            this.use(packet, bullets, MS, items);
        }
    }
}

module.exports = { Player, users };