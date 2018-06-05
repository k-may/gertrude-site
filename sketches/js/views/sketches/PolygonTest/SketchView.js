import {BaseSketch} from "../../BaseSketch.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";

export default class SketchView extends BaseSketch {

    constructor() {
        super('PolygonTest');

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
            var position = [];
            for (var i = 0; i < numPoints; i++) {
                var angle = i / numPoints * (2 * Math.PI);

                var x = Math.sin(angle);
                var y = Math.cos(angle);

                position.push(x);
                position.push(y);
                position.push(0);

                position.push(0);
                position.push(0);
                position.push(0);

                var index = (i + 1) % numPoints;
                angle = (i + 1)/ numPoints * Math.PI * 2;

                var x = Math.sin(angle);
                var y = Math.cos(angle);

                position.push(x);
                position.push(y);
                position.push(0);
            }

            this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
                position : position
            });

            window.dispatchEvent(new Event('resize'));
        });
    }

    draw(time) {

        if (!this.gl)
            return;

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        const uniforms = {
            time: time * 0.001,
            resolution: [this.gl.canvas.width, this.gl.canvas.height],
        };

        this.gl.useProgram(this.programInfo.program);

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
        twgl.setUniforms(this.programInfo, uniforms);
        twgl.drawBufferInfo(this.gl, this.bufferInfo);
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
    }

    onMouseUp() {
    }

    onMouseDown() {
    }

}