const { Bullet } = require('./bullet');
const { pistol, machineGun, shotGun } = require('./gun');
const { GrenadeItem } = require('./item');
const { Mathf } = require('./neko');
const { throwableObjects, Grenade, HalloweenGrenade } = require('./throwableObject');

var users = new Map();

class Player {
    constructor(key, name, x, y) {
        this.name = name;
        this.key = key;

        this.position = { x: x, y: y };
        this.targetPosition = { x: x, y: y };

        this.gunPosition = { x: 0, y: 0 };

        this.items = [null, null, null];
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
        this.health = this.fullHealth;
        this.shield = 0;

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

    tick = (users, damageCircle, io, MS, items) => {
        this.moveSpeed += (this.status.moveSpeed - this.moveSpeed) / 10;
        this.reboundValue += (0 - this.reboundValue) / 10;

        this.currentItem = this.items[this.selectedSlot - 1];

        if (this.health + this.shield >= this.fullHealth) {
            this.shield = this.fullHealth - this.health;
        }

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
            let outItems = [];
            for (let i = 0; i < this.items.length; i++) {
                let item = this.items[i];
                if (item == null) continue;

                let _outItem = item;
                let _outDir = Math.random() * Math.PI * 2;

                _outItem.power = 10;
                _outItem.outDir = _outDir;

                _outItem.position.x = this.position.x + Math.cos(_outDir) * MS * 1.5;
                _outItem.position.y = this.position.y + Math.sin(_outDir) * MS * 1.5;
                outItems.push(_outItem);
            }
            for (let i = 0; i < outItems.length; i++) {
                items.push(outItems[i]);
            }

            this.items = [null, null, null];

            io.emit('playerDied', { user: this, key: this.key });
            users.delete(this.key);
        }
    }

    checkCollision = (landforms, supplies, MS) => {
        for (let i = 0; i < landforms.length; i++) {
            if (landforms[i].type == 'rock') {
                if (Mathf.getDistance(this.position, landforms[i].position) <= (MS + MS * 2) / 2) {
                    return landforms[i];
                }
            }
        }

        for (let i = 0; i < supplies.length; i++) {
            if (Math.abs(supplies[i].position.x - this.position.x) <= (MS + supplies[i].width) / 2 &&
                Math.abs(supplies[i].position.y - this.position.y) <= (MS + supplies[i].height) / 2) {
                return supplies[i];
            }
        }

        return null;
    }

    movement = (packet, landforms, supplies, MS) => {
        if (packet.move) {
            this.dir = packet.joystickDir;

            this.targetPosition.x += Math.round(Math.cos(packet.joystickDir) * this.moveSpeed);
            this.targetPosition.y += Math.round(Math.sin(packet.joystickDir) * this.moveSpeed);

            let col = this.checkCollision(landforms, supplies, MS)
            if (col != null) {
                this.targetPosition.x += (this.targetPosition.x - col.position.x) / 20;
                this.targetPosition.y += (this.targetPosition.y - col.position.y) / 20;
            }
        }

        if (!this.shotVisualDir)
            this.visualDir = this.dir;

        if (this.currentItem != null && this.currentItem.itemType == 'Gun') {

            if (this.gun.name == 'pistol') {
                this.gunPosition = {
                    x: this.position.x + Math.cos(this.visualDir) * (MS + this.reboundValue),
                    y: this.position.y + Math.sin(this.visualDir) * (MS + this.reboundValue),
                }

                this.gunSize = {
                    width: MS, height: MS
                }
            }
            else if (this.gun.name == 'machineGun') {
                this.gunPosition = {
                    x: this.position.x + Math.cos(this.visualDir) * (MS / 3 + this.reboundValue) + Math.cos(this.visualDir + Math.PI / 2) * MS / 2,
                    y: this.position.y + Math.sin(this.visualDir) * (MS / 3 + this.reboundValue) + Math.sin(this.visualDir + Math.PI / 2) * MS / 2,
                }

                this.gunSize = {
                    width: MS * 8.4 / 5, height: MS * 5 / 5
                }
            }
            else if (this.gun.name == 'shotGun') {
                this.gunPosition = {
                    x: this.position.x + Math.cos(this.visualDir) * (MS / 3 + this.reboundValue) + Math.cos(this.visualDir + Math.PI / 2) * MS / 2,
                    y: this.position.y + Math.sin(this.visualDir) * (MS / 3 + this.reboundValue) + Math.sin(this.visualDir + Math.PI / 2) * MS / 2,
                }

                this.gunSize = {
                    width: MS * 8.4 / 5, height: MS * 5 / 5
                }
            }
            else if (this.gun.name == 'grenadeLauncher') {
                this.gunPosition = {
                    x: this.position.x + Math.cos(this.visualDir) * (MS / 3 + this.reboundValue) + Math.cos(this.visualDir + Math.PI / 2) * MS / 2,
                    y: this.position.y + Math.sin(this.visualDir) * (MS / 3 + this.reboundValue) + Math.sin(this.visualDir + Math.PI / 2) * MS / 2,
                }

                this.gunSize = {
                    width: MS * 8.4 / 5, height: MS * 5 / 5
                }
            }
        } else {

            this.gunPosition = {
                x: this.position.x + Math.cos(this.visualDir) * (MS / 3 + this.reboundValue) + Math.cos(this.visualDir + Math.PI / 2) * MS / 2,
                y: this.position.y + Math.sin(this.visualDir) * (MS / 3 + this.reboundValue) + Math.sin(this.visualDir + Math.PI / 2) * MS / 2,
            }
            this.gunSize = {
                width: MS, MS
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

    useGun = (packet, bullets, MS, items) => {
        this.reboundValue = -MS / 10;
        if (this.gun != null) {
            if (this.gun.name == 'pistol' || this.gun.name == 'machineGun') {
                let { playSound } = require('../indexServer');
                playSound('Gun', this.gunPosition);

                bullets.push(new Bullet(this, packet.gunDir, MS));
            } else if (this.gun.name == 'shotGun') {
                let { playSound } = require('../indexServer');
                playSound('ShotGun', this.gunPosition);

                for (let i = 0; i < 6; i++)
                    bullets.push(new Bullet(this, packet.gunDir + Math.random() / 2 - 0.5 / 2, MS));
            } else if (this.gun.name == 'grenadeLauncher') {
                let { playSound } = require('../indexServer');
                playSound('Grenade', this.position);

                if (Math.round(Math.random() * 20) == 0) {
                    throwableObjects.push(new HalloweenGrenade(this, this.gunPosition.x, this.gunPosition.y, packet.gunDir, MS));
                } else {
                    throwableObjects.push(new Grenade(this, this.gunPosition.x, this.gunPosition.y, packet.gunDir, MS));
                }
            }
        }
        this.useTimer = 0;
    }

    useExpendable = (packet, bullets, MS, items) => {

        if (this.expendableCharge == 0) {

            if (this.currentItem.type == 'Bandage') {
                let { playSound } = require('../indexServer');
                playSound('Bandage', this.position);
            } else if (this.currentItem.type == 'AidKit') {

            } else if (this.currentItem.type == 'MonsterEnergy') {
                let { playSound } = require('../indexServer');
                playSound('Drink', this.position);
            }
        }

        this.expendableCharge += this.currentItem.chargeTime;
        this.moveSpeed = this.status.moveSpeed / 2;

        if (this.expendableCharge >= 1) {
            this.expendableCharge = 0;

            if (this.currentItem.type == 'Bandage') {
                this.health += this.currentItem.heal;
                if (this.health >= this.fullHealth) {
                    this.health = this.fullHealth;
                }
            } else if (this.currentItem.type == 'AidKit') {
                this.health += this.currentItem.heal;

                if (this.health >= this.fullHealth) {
                    this.health = this.fullHealth;
                }
            } else if (this.currentItem.type == 'MonsterEnergy') {
                this.shield += this.currentItem.shield;
            }

            let item = this.items[this.selectedSlot - 1];

            if (item == null) return;

            let userItems = this.items;

            userItems[userItems.indexOf(item)] = null;
            this.currentItem = null;
        }
    }

    useThrowableObject = (packet, throwableObjects, MS, items) => {
        let item = this.items[this.selectedSlot - 1];

        if (item == null) return;

        if (this.currentItem.type == 'Grenade') {
            let { playSound } = require('../indexServer');
            playSound('Grenade', this.position);
            throwableObjects.push(new Grenade(this, this.position.x, this.position.y, packet.gunDir, MS));
        }
        else if (this.currentItem.type == 'HalloweenGrenade') {
            let { playSound } = require('../indexServer');
            playSound('Grenade', this.position);
            throwableObjects.push(new HalloweenGrenade(this, this.position.x, this.position.y, packet.gunDir, MS));
        }

        let userItems = this.items;

        userItems[(userItems.indexOf(item))] = null;
    }

    use = (packet, bullets, MS, items) => {
        if (this.currentItem == null) return;

        if (this.currentItem.itemType == 'Gun') {
            this.useGun(packet, bullets, MS, items);
        } else if (this.currentItem.itemType == 'Expendable') {
            this.useExpendable(packet, bullets, MS, items);
        } else if (this.currentItem.itemType == 'Throwable') {
            this.useThrowableObject(packet, throwableObjects, MS, items);
        }
    }

    useUpdate = (packet, bullets, MS, items) => {

        if (this.currentItem != null && this.currentItem.itemType == 'Throwable')
            this.useTimer = 1;

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
