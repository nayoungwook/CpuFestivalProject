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
        if (!this.textureCoord.inScreen) return;

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
        if (!this.textureCoord.inScreen) return;

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
        if (!this.textureCoord.inScreen) return;
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
        if (!this.textureCoord.inScreen) return;
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

class SupplyGas {
    constructor(x, y, v) {
        this.position = {
            x: x,
            y: y,
        };
        this.r = 120;
        this.rv = 0;
        this.timer = 1;

        this.xv = Math.round(Math.random() * v) - (v / 2);
        this.yv = Math.round(Math.random() * v) - (v / 2);

        this.color = {
            r: 255,
            g: Math.round(Math.random() * 50) + 20,
            b: Math.round(Math.random() * 50) + 20,
        }
    }

    render() {

        this.xv += (0 - this.xv) / 20;
        this.yv += (0 - this.yv) / 20;

        this.r += this.rv;
        if (this.r <= 0) this.r = 0;

        this.rv -= 0.05;

        this.position.x += this.xv;
        this.position.y += this.yv;

        this.textureCoord = Mathf.getRenderInfo(this.position, this.r, this.r);
        if (!this.textureCoord.inScreen) return;
        this.textureCoord.renderPosition.x = Math.round(this.textureCoord.renderPosition.x);
        this.textureCoord.renderPosition.y = Math.round(this.textureCoord.renderPosition.y);

        this.timer -= 0.01;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.timer})`;
        ctx.arc(this.textureCoord.renderPosition.x
            , this.textureCoord.renderPosition.y, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        if (this.timer <= 0)
            particles.splice(particles.indexOf(this), 1);
    }
}


class HalloweenExplosion extends Explosion {
    constructor(x, y, r, v) {
        super(x, y, r, v);

        let _colorTemps = [
            `#962E40`,
            `#330136`,
            `#F27405`,
            `#F29B30`,
            `#F2E422`,
            `#F2B705`,
        ];

        this._colorTemps = _colorTemps;
        this.batImage = new Image();
        this.batImage.src = 'assets/bat.png';

        this.colorIndex = Math.round(Math.random() * (_colorTemps.length));

        if (this.colorIndex == 0 || this.colorIndex == _colorTemps.length)
            this.r += 35;

        if (this.colorIndex == _colorTemps.length) {
            this.xv = Math.round(Math.random() * v * 2) - (v);
            this.yv = Math.round(Math.random() * v * 2) - (v);
        }

        if (this.colorIndex != _colorTemps.length)
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
        if (!this.textureCoord.inScreen) return;
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

        if (this.colorIndex != this._colorTemps.length) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.textureCoord.renderPosition.x
                , this.textureCoord.renderPosition.y, this.textureCoord.renderWidth / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        else {
            ctx.save();
            ctx.translate(this.textureCoord.renderPosition.x, this.textureCoord.renderPosition.y)
            ctx.rotate(this.r / 50);
            ctx.drawImage(this.batImage, this.textureCoord.renderWidth / (-3 / 2), this.textureCoord.renderHeight / (-3 / 2), this.textureCoord.renderWidth * 3, this.textureCoord.renderHeight * 3);
            ctx.restore();
        }

        if (this.timer <= 0)
            particles.splice(particles.indexOf(this), 1);
    }
}
