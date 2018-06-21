import {BaseSketch} from "../../BaseSketch.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import WobblyShape from "./WobblyShape.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";
import PingPongBuffer from "../MaskBuffer/PingPongBuffer.js";
import BlurBuffer from "./BlurBuffer.js";

var m4 = twgl.m4;

export default class WobblyGlow extends BaseSketch {

    constructor() {
        super('WobblyGlow');

        this._shape = new WobblyShape();
        this.pingPong = false;
        this.glowRadius = 50;

        var path = "js/views/sketches/WobblyGlow/";
        LoadingUtils.LoadShaders([path + "vert-glow.glsl", path + "frag-glow.glsl", path + "vert-shape.glsl", path + "frag-shape.glsl", path + "vert-fb.glsl", path + "frag-fb.glsl"]).then(src => {

            this.canvas = document.createElement("canvas");
            this.gl = twgl.getContext(this.canvas, {alpha: true, depth: false});
            this.el.appendChild(this.canvas);

            this.pingPongBuffer = new PingPongBuffer(this.gl);

            this.blurBuffer = new BlurBuffer(this.gl);

            this._glowProgramInfo = twgl.createProgramInfo(this.gl, src.slice(0, 2));
            this._bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this._shape.getShape());
            twgl.setBuffersAndAttributes(this.gl, this._glowProgramInfo, this._bufferInfo);

            this._shapeProgramInfo = twgl.createProgramInfo(this.gl, src.slice(2, 4));
            this._shapeBufferInfo = twgl.createBufferInfoFromArrays(this.gl, this._shape.getShape());
            twgl.setBuffersAndAttributes(this.gl, this._shapeProgramInfo, this._shapeBufferInfo);

            var attributes = {
                position: [0, 0, 0,
                    0, 1, 0,
                    1, 0, 0,
                    1, 0, 0,
                    0, 1, 0,
                    1, 1, 0]
            };
            this._fbBufferInfo = twgl.createBufferInfoFromArrays(this.gl, attributes);
            this._fbProgramInfo = twgl.createProgramInfo(this.gl, src.slice(4, 6));

            window.dispatchEvent(new Event('resize'));
        });
    }


    draw(time) {
        super.draw(time);

        if (!this.canvas)
            return;     

        this.gl.enable(this.gl.BLEND);

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        var shape = this._shape.getShape();

        if(this.pingPong) {
            this.pingPongBuffer.swap();
            this.pingPongBuffer.bind();
            //draw src into dest
            this.pingPongBuffer.draw();
        }

        //draw new shapes
        this._drawGlowShapes(shape);

        if(this.pingPong) {
            this.pingPongBuffer.unbind();
            //swap and draw new dest to canvas
            if (this.pingPongBuffer.dest)
                this.blurBuffer.draw(this.pingPongBuffer.dest.attachments[0]);
        }

        this._drawShapes(shape);
    }

    _drawGlowShapes(shape){

        this.gl.useProgram(this._glowProgramInfo.program);
        twgl.setAttribInfoBufferFromArray(this.gl, this._bufferInfo.attribs.position, shape.position.data);
        twgl.setBuffersAndAttributes(this.gl, this._glowProgramInfo, this._bufferInfo);
        twgl.setUniforms(this._glowProgramInfo, {
            "u_matrix": this._shape.getMatrix(this.glowRadius)
        });
        twgl.drawBufferInfo(this.gl, this._bufferInfo);
    }

    _drawShapes(shape){

        this.gl.useProgram(this._shapeProgramInfo.program);
        twgl.setAttribInfoBufferFromArray(this.gl, this._shapeBufferInfo.attribs.position, shape.position.data);
        twgl.setBuffersAndAttributes(this.gl, this._shapeProgramInfo, this._shapeBufferInfo);
        twgl.setUniforms(this._shapeProgramInfo, {
            "u_matrix": this._shape.getMatrix()
        });

        twgl.drawBufferInfo(this.gl, this._shapeBufferInfo);
    }

    onResize(w, h) {

        if (!this.gl)
            return;

        if (w !== this.width || h !== this.height) {
            this.canvas.width = this.width = w;
            this.canvas.height = this.height = h;
        }
    }

    _getFBI(){


    }

    onMouseMove(e) {
        this._shape.position = {x: e.clientX, y: e.clientY};
    }

    _getFBMtrix() {
        var m = m4.ortho(0, this.gl.canvas.width, 0, this.gl.canvas.height, -1, 1);
        return m4.scale(m, [this.gl.canvas.width, this.gl.canvas.height, 0]);
    }

}