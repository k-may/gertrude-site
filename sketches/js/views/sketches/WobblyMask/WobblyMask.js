import {BaseSketch} from "../../BaseSketch.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";
import WobblyShape from "./WobblyShape.js";

export default class WobblyMask extends BaseSketch {

    constructor() {
        super('WobblyMask');

        this._shape = new WobblyShape();

        this._addRule();

        var path = "js/views/sketches/WobblyMask/";
        LoadingUtils.LoadShaders([path + "vert.glsl", path + "frag.glsl", path + "vert-sprite.glsl", path + "frag-sprite.glsl"]).then(src => {

            this.canvas = document.createElement("canvas");
            this.gl = twgl.getContext(this.canvas);
            this.el.appendChild(this.canvas);

            this.programInfo = twgl.createProgramInfo(this.gl, [src[0], src[1]]);
            var shape = this._shape.getShape();
            this._wobblyInfo = twgl.createBufferInfoFromArrays(this.gl, shape);//createBufferInfoFromArrays(this.gl, this._shape.getShape());
            twgl.setBuffersAndAttributes(this.gl, this.programInfo, this._wobblyInfo);

            const arrays = {
                position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
                texcoord: [0, 1,  1, 1,  0, 0,  0, 0,  1, 1,  1, 0]
            };
            this._sprite = twgl.primitives.createPlaneBufferInfo(this.gl);
            twgl.setAttribInfoBufferFromArray(this.gl, this._sprite.attribs.position, arrays.position);
            twgl.setAttribInfoBufferFromArray(this.gl, this._sprite.attribs.texcoord, arrays.texcoord);
            this.spriteProgramInfo = twgl.createProgramInfo(this.gl, [src[2], src[3]]);

            this._texture = twgl.createTexture(this.gl, {src: "assets/WobblyMask/face.png"});
            twgl.setUniforms(this.spriteProgramInfo, {
                texture : this._texture
            });
            twgl.setBuffersAndAttributes(this.gl, this.spriteProgramInfo, this._sprite);

            window.dispatchEvent(new Event('resize'));
        });
    }

    draw(time) {
        if (!this.gl)
            return;

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        //draw sprite
        this.gl.useProgram(this.spriteProgramInfo.program);
         twgl.setBuffersAndAttributes(this.gl, this.spriteProgramInfo, this._sprite);
        twgl.drawBufferInfo(this.gl, this._sprite);

        //draw shape
        this.gl.useProgram(this.programInfo.program);
        var shape = this._shape.getShape();
        twgl.setAttribInfoBufferFromArray(this.gl, this._wobblyInfo.attribs.position, shape.position.data);
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this._wobblyInfo);
        twgl.drawBufferInfo(this.gl, this._wobblyInfo);
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
        this._shape.position = {x: e.clientX, y: e.clientY};
    }


}