class BulletParticle {
    constructor(x, y, r) {
        this.position = {
            x: x,
            y: y,
        };
        this.r = r / 3 * 2;
        this.timer = 1;

        this.xv = Math.round(Math.random() * 10) - 5;
        this.yv = Math.round(Math.random() * 10) - 5;
    }

    render() {

        this.xv += (0 - this.xv) / 10;
        this.yv += (0 - this.yv) / 10;

        this.position.x += this.xv;
        this.position.y += this.yv;

        this.textureCoord = Mathf.getRenderInfo(this.position, this.r, this.r);
        this.textureCoord.renderPosition.x = Math.round(this.textureCoord.renderPosition.x);
        this.textureCoord.renderPosition.y = Math.round(this.textureCoord.renderPosition.y);

        this.timer -= 0.01;

        ctx.beginPath();
        ctx.fillStyle = `rgba(243, 245, 140, ${this.timer})`;
        ctx.arc(this.textureCoord.renderPosition.x - this.textureCoord.renderWidth / 2
            , this.textureCoord.renderPosition.y - this.textureCoord.renderHeight / 2, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class BloodParticle {
    constructor(x, y, r, v) {
        this.position = {
            x: x,
            y: y,
        };
        this.r = r;
        this.rv = 0;
        this.timer = 1;

        this.xv = Math.round(Math.random() * v) - (v / 2);
        this.yv = Math.round(Math.random() * v) - (v / 2);
    }

    render() {

        this.xv += (0 - this.xv) / 10;
        this.yv += (0 - this.yv) / 10;

        this.r += this.rv;
        if (this.r <= 0) this.r = 0;

        this.rv -= 0.05;

        this.position.x += this.xv;
        this.position.y += this.yv;

        this.textureCoord = Mathf.getRenderInfo(this.position, this.r, this.r);
        this.textureCoord.renderPosition.x = Math.round(this.textureCoord.renderPosition.x);
        this.textureCoord.renderPosition.y = Math.round(this.textureCoord.renderPosition.y);

        this.timer -= 0.01;

        ctx.beginPath();
        ctx.fillStyle = `rgba(250, 3, 97, ${this.timer})`;
        ctx.arc(this.textureCoord.renderPosition.x - this.textureCoord.renderWidth / 2
            , this.textureCoord.renderPosition.y - this.textureCoord.renderHeight / 2, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class ShieldParticle {
    constructor(x, y, r, v) {
        this.position = {
            x: x,
            y: y,
        };
        this.r = r;
        this.rv = 0;
        this.timer = 1;

        this.xv = Math.round(Math.random() * v) - (v / 2);
        this.yv = Math.round(Math.random() * v) - (v / 2);
    }

    render() {

        this.xv += (0 - this.xv) / 10;
        this.yv += (0 - this.yv) / 10;

        this.r += this.rv;
        if (this.r <= 0) this.r = 0;

        this.rv -= 0.05;

        this.position.x += this.xv;
        this.position.y += this.yv;

        this.textureCoord = Mathf.getRenderInfo(this.position, this.r, this.r);
        this.textureCoord.renderPosition.x = Math.round(this.textureCoord.renderPosition.x);
        this.textureCoord.renderPosition.y = Math.round(this.textureCoord.renderPosition.y);

        this.timer -= 0.01;

        ctx.beginPath();
        ctx.fillStyle = `rgba(100, 255, 120, ${this.timer})`;
        ctx.arc(this.textureCoord.renderPosition.x - this.textureCoord.renderWidth / 2
            , this.textureCoord.renderPosition.y - this.textureCoord.renderHeight / 2, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}