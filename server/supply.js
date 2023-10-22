var supplies = [];
const { items, PistolItem, MachineGunItem, ShotGunItem, BandageItem, MonsterEnergyItem, AidKitItem, GrenadeItem } = require('./item');

class Supply {
    constructor(MS, x, y) {
        this.position = {
            x: x, y: y
        };

        this.width = MS * 3;
        this.height = MS * 3;
        this.health = 20;
    }



    tick = () => {
        if (this.health <= 0) {

            items.push(new MachineGunItem(this.position.x, this.position.y));
            items.push(new ShotGunItem(this.position.x, this.position.y));
            items.push(new BandageItem(this.position.x, this.position.y));
            items.push(new BandageItem(this.position.x, this.position.y));
            items.push(new AidKitItem(this.position.x, this.position.y));
            items.push(new MonsterEnergyItem(this.position.x, this.position.y));
            items.push(new MonsterEnergyItem(this.position.x, this.position.y));
            items.push(new GrenadeItem(this.position.x, this.position.y));
            items.push(new GrenadeItem(this.position.x, this.position.y));
            items.push(new GrenadeItem(this.position.x, this.position.y));

            supplies.splice(supplies.indexOf(this), 1);
        }
    }

}

module.exports = { Supply, supplies };