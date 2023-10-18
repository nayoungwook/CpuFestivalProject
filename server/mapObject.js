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

module.exports = { Rock, Bush };