import {BaseSketch} from "../../BaseSketch.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import "../../../node_modules/simplex-noise/simplex-noise.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl.js";

export default class WobblyShape extends BaseSketch {

    constructor() {
        super('WobblyShape');

        this._points = [];
        this._noise = new SimplexNoise();
        this._position = {x: 200, y: 600};
        this._angles = [];
        this._seeds = [];

        this._addRule();

        var path = "js/views/sketches/WobblyShape/";
        LoadingUtils.LoadShaders([path + "vert.glsl", path + "frag.glsl"]).then(src => {

            this.canvas = document.createElement("canvas");
            this.gl = twgl.getContext(this.canvas);
            this.el.appendChild(this.canvas);
            this.programInfo = twgl.createProgramInfo(this.gl, src);

            var numPoints = 80;
            for (var i = 0; i < numPoints; i++) {
                this._angles.push(i / numPoints * (2 * Math.PI));
                this._seeds.push(i / numPoints * (Math.PI * 2));

            }

            window.dispatchEvent(new Event('resize'));
        });
    }

    draw(time) {
        if (!this.gl)
            return;

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        const uniforms = {
            time: time * 0.01,
            resolution: [this.gl.canvas.width, this.gl.canvas.height],
        };

        this.gl.useProgram(this.programInfo.program);

        this._drawShape();


        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
        twgl.setUniforms(this.programInfo, uniforms);

        twgl.drawBufferInfo(this.gl, this.bufferInfo);
    }


    _drawShape() {

        var arrays = this._getShape();

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);

    }

    _getShape() {

        var position = [];
        var color = [];
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
            color.push(index / numPoints);
            var angle = this._seeds[i];

            var nA = Math.sin(angle + millis * 0.003) / 2 + 1;
            var nB = Math.sin(angle + millis * 0.002) / 2 + 1;

            var noise = this._noise.noise3D(nA * ampA, nB * ampB, millis);
            var radius = (100 + noise * 40);

            angle = this._angles[i];
            var pos = {
                x: Math.sin(angle) * radius,
                y: Math.cos(angle) * radius
            };

            pos = this.getPositionTranslated(pos, center);
            var x = pos.x;
            var y = pos.y;
            color.push(index / numPoints);
            position.push(x);
            position.push(y);
            position.push(0);

            position.push(center.x);
            position.push(center.y);
            position.push(0);

            index = (i + 1) % numPoints;
            angle = this._seeds[index];
            nA = Math.sin(angle + millis * 0.003) / 2 + 1;
            nB = Math.sin(angle + millis * 0.002) / 2 + 1;

            noise = this._noise.noise3D(nA * ampA, nB * ampB, millis);
            radius = (100 + noise * 40);
            angle = this._angles[index];
            pos = {
                x: Math.sin(angle) * radius,
                y: Math.cos(angle) * radius
            };
            pos = this.getPositionTranslated(pos, center);
            x = pos.x;
            y = pos.y;
            color.push(index / numPoints);
            position.push(x);
            position.push(y);
            position.push(0);
        }

        return {position: {size: 3, data: position}, color: {size: 1, data: color}};
    }

    getPositionTranslated(pos, tran) {
        return {
            x: pos.x / (window.innerWidth / 2) + tran.x,
            y: pos.y / (window.innerHeight / 2) + tran.y
        };
    }

    _addRule() {
        var html = '<div style="position:absolute;top : 20px;left:20px;width:200px;height:20px;background-color: black;"></div>';
        this.el.innerHTML = html;
    }

        onResize(w, h) {

            if (!this.gl)
                return;

            if (w !== this.width || h !== this.height) {
                this.canvas.width = this.width = w;
                this.canvas.height = this.height = h;
            }
        }

    onMouseMove(e) {
        this._position = {x: e.clientX, y: e.clientY};
    }

    millis() {
        return Date().now;
    }

}