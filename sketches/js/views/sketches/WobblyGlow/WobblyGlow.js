import {BaseSketch} from "../../BaseSketch.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import WobblyShape from "./WobblyShape.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

export default class WobblyGlow extends BaseSketch {

    constructor() {
        super('WobblyGlow');

        this._shape = new WobblyShape();

        var path = "js/views/sketches/WobblyGlow/";
        LoadingUtils.LoadShaders([path + "vert.glsl", path + "frag.glsl"]).then(src => {

            this.canvas = document.createElement("canvas");
            this.gl = twgl.getContext(this.canvas, {alpha : true, depth:false});
            this.el.appendChild(this.canvas);

            this.programInfo = twgl.createProgramInfo(this.gl, [src[0], src[1]]);

            this._wobblyInfo = twgl.createBufferInfoFromArrays(this.gl, this._shape.getShape());
            twgl.setBuffersAndAttributes(this.gl, this.programInfo, this._wobblyInfo);

            window.dispatchEvent(new Event('resize'));
        });
    }


    draw(time) {
        super.draw(time);

        if(!this.canvas)
            return;

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0,0,0,1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.useProgram(this.programInfo.program);
        var shape = this._shape.getShape();
        twgl.setAttribInfoBufferFromArray(this.gl, this._wobblyInfo.attribs.position, shape.position.data);
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this._wobblyInfo);
        twgl.drawBufferInfo(this.gl, this._wobblyInfo);

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
        this._shape.position = {x: e.clientX, y: e.clientY};
    }

}