const { Mathf } = require("./neko");

const pistol = {
    name: 'pistol',
    shotSpeed: 0.05,
    shotRange: 850,
    bulletSpeed: 35,
    damage: 2,
};

const machineGun = {
    name: 'machineGun',
    shotSpeed: 0.15,
    shotRange: 850,
    bulletSpeed: 40,
    damage: 1.5,
};

const shotGun = {
    name: 'shotGun',
    shotSpeed: 0.02,
    shotRange: 450,
    bulletSpeed: 30,
    damage: 4.5,
};

class Item {
    constructor(owner, x, y, type) {
        this.position = { x: x, y: y };
        this.type = type;
        this.owner = owner;

        this.force = 0;
        this.dir = 0;
    }

    addForce = (dir) => {
        this.dir = dir;
        this.force = 12;
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

    update = (items, landforms, MS) => {

        this.force += (0 - this.force) / 5;
        this.position.x += Math.cos(this.dir) * this.force;
        this.position.y += Math.sin(this.dir) * this.force;

        for (let i = 0; i < items.length; i++) {
            if (items[i] == this) continue;

            if (Mathf.getDistance(items[i].position, this.position) == 0) {
                this.position.x += Math.random() - 0.5;
                this.position.y += Math.random() - 0.5;
            }

            if (Mathf.getDistance(items[i].position, this.position) <= MS) {
                items[i].position.x += (items[i].position.x - this.position.x) / 10;
                this.position.x += (this.position.x - items[i].position.x) / 10;

                items[i].position.y += (items[i].position.y - this.position.y) / 10;
                this.position.y += (this.position.y - items[i].position.y) / 10;
            }
        }

        let col = this.checkCollision(landforms, MS)
        if (col != null) {
            this.position.x += (this.position.x - col.position.x) / 10;
            this.position.y += (this.position.y - col.position.y) / 10;
        }
    }
}

class PistolItem extends Item {
    constructor(owner, x, y) {
        super(owner, x, y, 'Pistol');
        this.gunData = pistol;

        if (owner != null)
            this.position = owner.position;
    }
}

class MachineGunItem extends Item {
    constructor(owner, x, y) {
        super(owner, x, y, 'MachineGun');
        this.gunData = machineGun;

        if (owner != null)
            this.position = owner.position;
    }
}

module.exports = { Item, PistolItem, MachineGunItem };