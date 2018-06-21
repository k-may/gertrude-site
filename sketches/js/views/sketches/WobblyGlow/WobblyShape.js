import "../../../node_modules/simplex-noise/simplex-noise.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

var m4 = twgl.m4;

export default class WobblyShape {

    constructor() {

        this._noise = new SimplexNoise();
        this._position = {x: 0, y: 0};

        this._angles = [];
        var numPoints = 20;
        for (var i = 0; i < numPoints; i++) {
            this._angles.push(i / numPoints * (2 * Math.PI));
        }
    }

    set position(value) {
        this._position = value;
    }

    get position() {
        return this._position;
    }

    getShape() {

        var position = [];
        var normals = [];

        var numPoints = this._angles.length;

        var w = window.innerWidth;
        var h = window.innerHeight;

        var millis = Date.now() * 0.0001;
        var ampA = 1;
        var ampB = 2;

        var noiseAmount = 15;
        var radius, noise, index, angle, nA, nB, pos;

        for (var i = 0; i < numPoints; i++) {

            var index = i % numPoints;
            var angle = this._angles[i];

            var nA = Math.sin(angle + millis * 0.003) / 2 + 1;
            var nB = Math.sin(angle + millis * 0.002) / 2 + 1;

            var noise = this._noise.noise3D(nA * ampA, nB * ampB, millis);
            var radius = (100 + noise * noiseAmount);
            var pos = {
                x: Math.sin(angle) * radius,
                y: Math.cos(angle) * radius
            };

            position.push(pos.x);
            position.push(pos.y);

            position.push(0);
            position.push(0);

            index = (i + 1) % numPoints;
            angle = this._angles[index];
            nA = Math.sin(angle + millis * 0.003) / 2 + 1;
            nB = Math.sin(angle + millis * 0.002) / 2 + 1;

            noise = this._noise.noise3D(nA * ampA, nB * ampB, millis);
            radius = (100 + noise * noiseAmount);
            pos = {
                x: Math.sin(angle) * radius,
                y: Math.cos(angle) * radius
            };

            position.push(pos.x);
            position.push(pos.y);
        }

        return {
            position: {size: 2, data: position}
        };
    }

    getMatrix(scale) {
        var m = m4.ortho(0, window.innerWidth, window.innerHeight, 0, -1, 1);


        m = m4.translate(m, [this.position.x, this.position.y, 0]);

        if(scale) {
            m = m4.scale(m, [scale, scale, 0]);
        }

        return m;
    }

    _getPositionTranslated(pos, tran) {
        return {
            x: pos.x / (window.innerWidth / 2) + tran.x,
            y: pos.y / (window.innerHeight / 2) + tran.y
        };
    }


}