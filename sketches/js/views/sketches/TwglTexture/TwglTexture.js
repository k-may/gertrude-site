import {BaseSketch} from "../../BaseSketch.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

export default class TwglTexture extends BaseSketch {

    constructor() {
        super('TwglTexture');

        var path = "js/views/sketches/TwglTexture/";
        LoadingUtils.LoadShaders([path + "vert.glsl", path + "frag.glsl"]).then(src => {


            this.canvas = document.createElement("canvas");
            this.gl = twgl.getContext(this.canvas);
            this.el.appendChild(this.canvas);

            this.programInfo = twgl.createProgramInfo(this.gl, src);

            var arrays = {
                position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
                texcoord: [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]
            };

            this._sprite1 = twgl.createBufferInfoFromArrays(this.gl, arrays);
            twgl.setUniforms(this._sprite1, {
                texture: twgl.createTexture(this.gl, {src: "assets/WobblyMask/face.png"})
            });

            var matrix = twgl.m4.identity();
            twgl.m4.rotateX(matrix, Math.PI /2);
            this._sprite2 = twgl.primitives.createPlaneBufferInfo(this.gl);
            twgl.setUniforms(this._sprite2, {
                texture: twgl.createTexture(this.gl, {src: "assets/WobblyMask/face.png"})
            });

            window.dispatchEvent(new Event('resize'));
        });

    }

    draw(time) {

        if (!this.gl)
            return;

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.useProgram(this.programInfo.program);

        //draw sprite1
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this._sprite1);
        twgl.drawBufferInfo(this.gl, this._sprite1);

        //draw sprite2
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this._sprite2);
        twgl.drawBufferInfo(this.gl, this._sprite2);

    }

    onResize(w, h) {

        if (!this.gl)
            return;

        if (w !== this.width || h !== this.height) {
            this.canvas.width = this.width = w;
            this.canvas.height = this.height = h;
        }
    }

}