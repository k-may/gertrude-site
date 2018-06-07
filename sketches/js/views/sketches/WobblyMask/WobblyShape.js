import "../../../node_modules/simplex-noise/simplex-noise.js";

export default class WobblyShape{

    constructor(){

        this._noise = new SimplexNoise();
        this._position = {x: 0, y: 0};

        this._angles = [];
        var numPoints = 80;
        for (var i = 0; i < numPoints; i++) {
            this._angles.push(i / numPoints * (2 * Math.PI));
        }
    }

    set position(value){
        this._position = value;
    }

    getShape() {

        var position = [];
        var numPoints = this._angles.length;

        var w = window.innerWidth;
        var h = window.innerHeight;

        var center = {
            x: this._position.x / w * 2 - 1,
            y: 1 - (this._position.y / h * 2)
        };

        var millis = Date.now() * 0.0001;
        var ampA = 1;
        var ampB = 2;

        for (var i = 0; i < numPoints; i++) {

            var index = i % numPoints;
            var angle = this._angles[i];

            var nA = Math.sin(angle + millis * 0.003) / 2 + 1;
            var nB = Math.sin(angle + millis * 0.002) / 2 + 1;

            var noise = this._noise.noise3D(nA * ampA, nB * ampB, millis);
            var radius = (100 + noise * 40);
            var pos = {
                x: Math.sin(angle) * radius,
                y: Math.cos(angle) * radius
            };

            pos = this._getPositionTranslated(pos, center);
            position.push(pos.x);
            position.push(pos.y);
            position.push(0);

            position.push(center.x);
            position.push(center.y);
            position.push(0);

            index = (i + 1) % numPoints;
            angle = this._angles[index];
            nA = Math.sin(angle + millis * 0.003) / 2 + 1;
            nB = Math.sin(angle + millis * 0.002) / 2 + 1;

            noise = this._noise.noise3D(nA * ampA, nB * ampB, millis);
            radius = (100 + noise * 40);
            pos = {
                x: Math.sin(angle) * radius,
                y: Math.cos(angle) * radius
            };
            pos = this._getPositionTranslated(pos, center);
            position.push(pos.x);
            position.push(pos.y);
            position.push(0);
        }

        return {position: {size: 3, data: position}};
    }

    _getPositionTranslated(pos, tran) {
        return {
            x: pos.x / (window.innerWidth / 2) + tran.x,
            y: pos.y / (window.innerHeight / 2) + tran.y
        };
    }


}