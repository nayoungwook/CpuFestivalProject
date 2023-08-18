var Mathf = /** @class */ (function () {
    function Mathf() {
    }
    Mathf.getDistance = function (v1, v2) {
        return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
    };
    return Mathf;
}());
var Color = /** @class */ (function () {
    function Color(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = (a == undefined ? 1 : a);
    }
    Color.prototype.getString = function () {
        return "rgb(".concat(this.r, ",").concat(this.g, ",").concat(this.b, ",").concat(this.a, ")");
    };
    return Color;
}());
var Vector = /** @class */ (function () {
    function Vector(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Vector;
}());
var Input = /** @class */ (function () {
    function Input() {
    }
    Input.touchPos = new Vector(0, 0);
    Input.touch = false;
    return Input;
}());
var Scene = /** @class */ (function () {
    function Scene() {
        this.init();
    }
    Scene.prototype.init = function () { };
    ;
    Scene.prototype.tick = function () { };
    Scene.prototype.render = function () { };
    return Scene;
}());
var Camera = /** @class */ (function () {
    function Camera() {
    }
    Camera.position = new Vector(0, 0, 1);
    Camera.rotation = 0;
    return Camera;
}());
var Sprite = /** @class */ (function () {
    function Sprite(path) {
        this.path = path;
        this.image = new Image();
        this.image.src = path;
    }
    Sprite.prototype.getPath = function () {
        return this.path;
    };
    return Sprite;
}());
var GameObject = /** @class */ (function () {
    function GameObject(x, y, width, height) {
        this.renderType = 'image';
        this.textAlign = 'center';
        this.position = new Vector(x, y, 1);
        this.renderPosition = new Vector(0, 0, 1);
        this.anchor = new Vector(0.5, 0.5);
        this.color = new Color(255, 40, 150, 1);
        this.rotation = 0;
        this.width = width != undefined ? width : 100;
        this.height = height != undefined ? height : 100;
    }
    GameObject.prototype.tick = function () { };
    GameObject.prototype.render = function () {
        App.renderQueue.push(this);
    };
    GameObject.prototype._render = function () {
        this.renderWidth = this.width * Camera.position.z;
        this.renderHeight = this.height * Camera.position.z;
        var _dist = Mathf.getDistance(new Vector(App.canvas.width / 2 + Camera.position.x, App.canvas.height / 2 + Camera.position.y), new Vector(this.position.x, this.position.y));
        var _rot = Math.atan2(App.canvas.height / 2 + Camera.position.y - this.position.y, App.canvas.width / 2 + Camera.position.x - this.position.x) + Camera.rotation;
        var xx = (this.position.x - (App.canvas.width / 2 + Camera.position.x));
        var yy = (this.position.y - (App.canvas.height / 2 + Camera.position.y));
        var _zDist = _dist * (Camera.position.z);
        var _zx = (Math.cos(_rot) * _zDist), _zy = (Math.sin(_rot) * _zDist);
        this.renderPosition.x = this.position.x - Camera.position.x - (xx + _zx);
        this.renderPosition.y = this.position.y - Camera.position.y - (yy + _zy);
        var outScreenSize = Math.sqrt(this.renderWidth * this.renderWidth + this.renderHeight * this.renderHeight);
        this.inScreen = true;
        if (this.position.x < -outScreenSize || this.position.x > App.canvas.width + outScreenSize)
            this.inScreen = false;
        if (this.position.y < -outScreenSize || this.position.y > App.canvas.width + outScreenSize)
            this.inScreen = false;
        App.ctx.save();
        App.ctx.translate(this.renderPosition.x, this.renderPosition.y);
        App.ctx.rotate(this.rotation + Camera.rotation);
        if (this.renderType == 'image') {
            if (this.sprite != null) {
                App.ctx.drawImage(this.sprite.image, -this.renderWidth / 2, -this.renderHeight / 2, this.renderWidth, this.renderHeight);
            }
        }
        else if (this.renderType == 'rect') {
            App.ctx.fillStyle = this.color.getString();
            App.ctx.fillRect(-this.renderWidth / 2, -this.renderHeight / 2, this.renderWidth, this.renderHeight);
        }
        else if (this.renderType == 'text') {
            App.ctx.fillStyle = this.color.getString();
            App.ctx.textAlign = this.textAlign;
            App.ctx.fillText(this.text, -this.renderWidth / 2, -this.renderHeight / 2);
        }
        App.ctx.restore();
    };
    return GameObject;
}());
var Renderer = /** @class */ (function () {
    function Renderer() {
    }
    Renderer.image = function (sprite, x, y, width, height, z, rotation) {
        var image = new GameObject(x, y, width, height);
        image.position.z = (z == undefined ? 1 : z);
        image.rotation = (rotation == undefined ? 0 : rotation);
        image.sprite = sprite;
        image.render();
    };
    Renderer.rect = function (x, y, width, height, z, rotation, color) {
        var rect = new GameObject(x, y, width, height);
        rect.renderType = 'rect';
        if (color != undefined)
            rect.color = color;
        rect.position.z = (z == undefined ? 1 : z);
        rect.rotation = (rotation == undefined ? 0 : rotation);
        rect.render();
    };
    return Renderer;
}());
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        App.canvas = this.createCanvas();
        document.body.appendChild(App.canvas);
        document.body.style.margin = '0px';
        document.body.style.border = '0px';
        document.addEventListener('touchstart', function (e) {
            Input.touchPos.x = e.touches[0].clientX;
            Input.touchPos.y = e.touches[0].clientY;
            Input.touch = true;
        });
        document.addEventListener('touchmove', function (e) {
            Input.touchPos.x = e.touches[0].clientX;
            Input.touchPos.y = e.touches[0].clientY;
        });
        document.addEventListener('touchend', function (e) {
            Input.touch = false;
        });
        setInterval(function () { _this._update(); }, 1000 / 60);
    }
    App.prototype._resize = function () {
        App.canvas.width = window.innerWidth;
        App.canvas.height = window.innerHeight;
    };
    App.prototype._update = function () {
        this._resize();
        if (App.scene != null)
            App.scene.tick();
        App.renderQueue = [];
        if (App.scene != null)
            App.scene.render();
        App.renderQueue = App.renderQueue.sort(function (fir, sec) {
            return fir.position.z - sec.position.z;
        });
        for (var i = 0; i < App.renderQueue.length; i++) {
            App.renderQueue[i]._render();
        }
    };
    App.prototype.createCanvas = function () {
        var _canvas = document.createElement('canvas');
        _canvas.id = 'canvas';
        _canvas.width = 600;
        _canvas.height = 600;
        App.ctx = _canvas.getContext('2d');
        App.ctx.imageSmoothingEnabled = true;
        return _canvas;
    };
    return App;
}());