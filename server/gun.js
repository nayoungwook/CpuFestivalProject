const pistol = {
    name: 'pistol',
    shotSpeed: 0.05,
    shotRange: 1250,
    bulletSpeed: 35,
    damage: 6,
    gap: 0,
};

const machineGun = {
    name: 'machineGun',
    shotSpeed: 0.15,
    shotRange: 1250,
    bulletSpeed: 40,
    damage: 1.5,
    gap: 50 / 5,
};

const shotGun = {
    name: 'shotGun',
    shotSpeed: 0.02,
    shotRange: 550,
    bulletSpeed: 30,
    damage: 3,
    gap: 50 / 5,
};


module.exports = { pistol, machineGun, shotGun };