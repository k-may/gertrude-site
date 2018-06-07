import {BaseSketch} from "../../BaseSketch.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";

export default class Test extends BaseSketch {

    constructor() {
        super('Test');

        var path = "js/views/sketches/Test/";
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

            const arrays = {
                position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
            };
            this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);

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

        var p1 = {
            x: Math.sin(time * 0.001),
            y: -1
        };
        var p2 = {
            x: 1,
            y: -1
        };

        var p3 = {
            x: -1,
            y: 1
        };
        var p4 = {
            x: 1,
            y: 1
        };

        const arrays = {
            position: [p1.x, p1.y, 0, p2.x, p2.y, 0, p3.x, p3.y, 0, p3.x, p3.y, 0, p2.x, p2.y, 0, p4.x, p4.y, 0],
        };

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);

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