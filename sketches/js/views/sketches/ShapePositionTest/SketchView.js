import {BaseSketch} from "../../BaseSketch.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";

export default class SketchView extends BaseSketch {

    constructor() {
        super('ShapePositionTest');

        this._points = [];
        this._position = {x: 200, y: 600};

        var path = "js/views/sketches/PolygonTest/";
        LoadingUtils.LoadShaders([path + "vert.glsl", path + "frag.glsl"]).then(src => {

            this.canvas = document.createElement("canvas");

            this.gl = this.canvas.getContext("webgl2");//twgl.getContext(this.canvas);
            this.el.appendChild(this.canvas);

            console.log("using:" + this.gl.getParameter(this.gl.VERSION));  // eslint-disable-line
            if (!twgl.isWebGL2(this.gl)) {
                alert("Sorry, this example requires WebGL 2.0");  // eslint-disable-line
                return;
            }
            this.programInfo = twgl.createProgramInfo(this.gl, src);

            var numPoints = 80;

            for (var i = 0; i < numPoints; i++) {
                var angle = i / numPoints * (2 * Math.PI);

                this._points.push({
                    x: Math.sin(angle) * 0.2 * (window.innerWidth),
                    y: Math.cos(angle) * 0.2 * (window.innerWidth)
                });
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

        this.drawShape();


        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
        twgl.setUniforms(this.programInfo, uniforms);

        twgl.drawBufferInfo(this.gl, this.bufferInfo);
    }

    drawShape() {

        var position = [];
        var numPoints = 80;
        
        var w = window.innerWidth;
        var h = window.innerHeight;

        var center = {
            x : this._position.x / w * 2- 1,
            y : 1 - (this._position.y / h * 2)
         };

        for (var i = 0; i < numPoints; i++) {

            var pos = this.getPositionTranslated(this._points[i], center);
            var x = pos.x;
            var y = pos.y;

            var angle = i / numPoints * (2 * Math.PI);
            var x2 = Math.sin(angle);
            var y2 = Math.cos(angle);

            position.push(x);
            position.push(y);
            position.push(0);

            position.push(center.x);
            position.push(center.y);
            position.push(0);

            var index = (i + 1) % numPoints;
            var pos = this.getPositionTranslated(this._points[index], center);
            x = pos.x;
            y = pos.y;

            position.push(x);
            position.push(y);
            position.push(0);
        }

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
            position: position
        });

    }

    getPositionTranslated(pos, tran){
        return {
            x : pos.x / window.innerWidth + tran.x,
            y : pos.y / window.innerHeight + tran.y
        };
    }

    onResize(w, h) {

        if (!this.gl)
            return;

        if (w !== this.width || h !== this.height) {
            this.canvas.width = this.width = w;
            this.canvas.height = this.height = h;
        }
    }

    onScroll(percentage) {
    }

    onClick(e) {
    }

    onMouseMove(e) {
                this._position = {x: e.clientX, y: e.clientY};
    }

    onMouseUp() {
    }

    onMouseDown() {
    }

}