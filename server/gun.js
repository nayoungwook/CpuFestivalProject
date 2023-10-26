const pistol = {
    name: 'pistol',
    shotSpeed: 0.05,
    shotRange: 750,
    bulletSpeed: 35,
    damage: 4,
    gap: 0,
};

const machineGun = {
    name: 'machineGun',
    shotSpeed: 0.1,
    shotRange: 950,
    bulletSpeed: 40,
    damage: 1,
    gap: 50 / 5,
};

const shotGun = {
    name: 'shotGun',
    shotSpeed: 0.02,
    shotRange: 650,
    bulletSpeed: 30,
    damage: 4,
    gap: 50 / 5,
};

const grenadeLauncher = {
    name: 'grenadeLauncher',
    shotSpeed: 0.01,
    shotRange: 550,
    bulletSpeed: 30,
    damage: 3,
    gap: 50 / 5,
};


module.exports = { pistol, machineGun, shotGun, grenadeLauncher };
