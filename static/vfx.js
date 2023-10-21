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
        ctx.arc(this.textureCoord.renderPosition.x
            , this.textureCoord.renderPosition.y, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        if (this.timer <= 0)
            particles.splice(particles.indexOf(this), 1);
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
        ctx.arc(this.textureCoord.renderPosition.x
            , this.textureCoord.renderPosition.y, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        if (this.timer <= 0)
            particles.splice(particles.indexOf(this), 1);
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
        ctx.arc(this.textureCoord.renderPosition.x
            , this.textureCoord.renderPosition.y, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        if (this.timer <= 0)
            particles.splice(particles.indexOf(this), 1);
    }
}

class Explosion {
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

        let _colorTemps = [
            `rgb(255, 255, 120)`,
            `rgb(50, 50, 50)`,
            `rgb(255, 100, 120)`,
            `rgb(255, 200, 120)`,
        ]

        this.colorIndex = Math.round(Math.random() * (_colorTemps.length - 1));

        if (this.colorIndex == 2)
            this.r += 35;

        this.color = _colorTemps[this.colorIndex];
    }

    render() {
        this.xv += (0 - this.xv) / 10;
        this.yv += (0 - this.yv) / 10;

        this.r += this.rv;
        if (this.r <= 0) this.r = 0;


        this.position.x += this.xv;
        this.position.y += this.yv;

        this.textureCoord = Mathf.getRenderInfo(this.position, this.r, this.r);
        this.textureCoord.renderPosition.x = Math.round(this.textureCoord.renderPosition.x);
        this.textureCoord.renderPosition.y = Math.round(this.textureCoord.renderPosition.y);

        if (this.colorIndex == 1) {
            this.rv -= 0.005;
            this.timer -= 0.002;
        }
        else {
            this.rv -= 0.05;
            this.timer -= 0.01;
        }

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.textureCoord.renderPosition.x
            , this.textureCoord.renderPosition.y, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        if (this.timer <= 0)
            particles.splice(particles.indexOf(this), 1);
    }
}