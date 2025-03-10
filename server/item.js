const { pistol, shotGun, machineGun, grenadeLauncher } = require("./gun");
const { jmTeacher } = require("./melee");
const { Mathf } = require("./neko");

var items = [];

class Item {
    constructor(type, x, y) {
        this.type = type;
        this.position = {
            x: x,
            y: y,
        };
        this.power = 0;
        this.outDir = 0;
        this.itemType = '';
    }

    update() {
        this.power += (0 - this.power) / 10;
        this.position.x += Math.cos(this.outDir) * this.power;
        this.position.y += Math.sin(this.outDir) * this.power;
    }

    checkObjectCollision = (landforms, MS) => {
        for (let i = 0; i < landforms.length; i++) {
            if (landforms[i].type == 'rock') {
                if (Mathf.getDistance(this.position, landforms[i].position) <= (MS + MS * 2) / 2) {
                    return landforms[i];
                }
            }
        }
        return null;
    }

    collision(MS, users, landforms) {
        let col = this.checkObjectCollision(landforms, MS)
        if (col != null) {
            this.position.x += (this.position.x - col.position.x) / 10;
            this.position.y += (this.position.y - col.position.y) / 10;
        }

        for (const [key, value] of users.entries()) {
            let _dist = Mathf.getDistance(this.position, value.position);

            let itemCount = 0;
            let newItemIndex = -1;

            for (let i = 0; i < value.items.length; i++) {
                if (value.items[i] != null) itemCount++;
                if (value.items[i] == null && newItemIndex == -1) newItemIndex = i;
            }

            if (_dist <= MS) {
                if (itemCount >= 3) {
                    if (_dist == 0) {
                        this.position.x += 1;
                        this.position.y += 1;
                        continue;
                    }

                    this.position.x += (this.position.x - value.position.x) / 20;
                    this.position.y += (this.position.y - value.position.y) / 20;

                    value.position.x += (value.position.x - this.position.x) / 20;
                    value.position.y += (value.position.y - this.position.y) / 20;
                } else {
                    value.items[newItemIndex] = this;
                    items.splice(items.indexOf(this), 1);
                }
            }
        }

        for (let i = 0; i < items.length; i++) {
            if (items[i] == this) continue;

            let _dist = Mathf.getDistance(this.position, items[i].position);
            if (_dist <= MS) {
                if (_dist == 0) {
                    this.position.x += 1;
                    this.position.y += 1;
                    continue;
                }

                this.position.x += (this.position.x - items[i].position.x) / 20;
                this.position.y += (this.position.y - items[i].position.y) / 20;

                items[i].position.x += (items[i].position.x - this.position.x) / 20;
                items[i].position.y += (items[i].position.y - this.position.y) / 20;
            }
        }
    }
}

class PistolItem extends Item {
    constructor(x, y) {
        super('Pistol', x, y);
        this.itemType = 'Gun';
        this.gunData = pistol;
    }
}

class MachineGunItem extends Item {
    constructor(x, y) {
        super('MachineGun', x, y);
        this.itemType = 'Gun';
        this.gunData = machineGun;
    }
}

class ShotGunItem extends Item {
    constructor(x, y) {
        super('ShotGun', x, y);
        this.itemType = 'Gun';
        this.gunData = shotGun;
    }
}

class GrenadeLauncherItem extends Item {
    constructor(x, y) {
        super('GrenadeLauncher', x, y);
        this.itemType = 'Gun';
        this.gunData = grenadeLauncher;
    }
}

class BandageItem extends Item {
    constructor(x, y) {
        super('Bandage', x, y);
        this.itemType = 'Expendable';
        this.heal = 10;
        this.chargeTime = 1 / 60 / 4;
    }
}

class AidKitItem extends Item {
    constructor(x, y) {
        super('AidKit', x, y);
        this.itemType = 'Expendable';
        this.heal = 20;
        this.chargeTime = 1 / 60 / 7;
    }
}

class MonsterEnergyItem extends Item {
    constructor(x, y) {
        super('MonsterEnergy', x, y);
        this.itemType = 'Expendable';
        this.shield = 10;
        this.chargeTime = 1 / 60 / 5;
    }
}

class GrenadeItem extends Item {
    constructor(x, y) {
        super('Grenade', x, y);
        this.itemType = 'Throwable';
    }
}

class HalloweenGrenadeItem extends Item {
    constructor(x, y) {
        super('HalloweenGrenade', x, y);
        this.itemType = 'Throwable';
    }
}

class JPTeacherItem extends Item {
    constructor(x, y) {
        super('JPTeacher', x, y);
        this.itemType = 'Passive';
    }
}

class JMTeacherItem extends Item {
    constructor(x, y) {
        super('JMTeacher', x, y);
        this.itemType = 'Melee';
        this.meleeData = jmTeacher;
    }
}

class JATeacherItem extends Item {
    constructor(x, y) {
        super('JATeacher', x, y);
        this.itemType = 'Expendable';
        this.heal = 10;
        this.chargeTime = 1 / 60 / 4;
    }
}

module.exports = {
    items, Item, PistolItem, MachineGunItem, ShotGunItem, GrenadeLauncherItem
    , BandageItem, AidKitItem, MonsterEnergyItem, GrenadeItem, HalloweenGrenadeItem,
    JPTeacherItem, JMTeacherItem, JATeacherItem,
};
