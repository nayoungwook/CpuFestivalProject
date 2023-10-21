const { Rock, Bush } = require("./mapObject");
const { Player } = require("./player");
const { Mathf } = require('./neko');

const MAP_SCALE = 10000;

function checkLandforms(position, landforms, MS) {
    for (let i = 0; i < landforms.length; i++) {
        if (Mathf.getDistance(landforms[i].position, position) <= MS * 3) {
            return true;
        }
    }
    return false;
}

function createLandforms(landforms, MS) {
    for (let i = 0; i < 60; i++) {
        let _position = { x: 0, y: 0 };

        do {
            _position = { x: Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, y: Math.round(Math.random() * 8000) - 4000 };
        } while (checkLandforms(_position, landforms, MS));

        landforms.push(new Rock(_position.x, _position.y));
    }
    for (let i = 0; i < 60; i++) {

        let _position = { x: 0, y: 0 };

        do {
            _position = { x: Math.round(Math.random() * MAP_SCALE) - MAP_SCALE / 2, y: Math.round(Math.random() * 8000) - 4000 };
        } while (checkLandforms(_position, landforms, MS));

        landforms.push(new Bush(_position.x, _position.y));
    }
}

module.exports = { createLandforms, MAP_SCALE };