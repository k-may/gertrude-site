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
            this.gl = twgl.getContext(this.canvas, {stencil: true});
            this.el.appendChild(this.canvas);

            this.programInfo = twgl.createProgramInfo(this.gl, [src[0], src[1]]);
            this._wobblyInfo = twgl.createBufferInfoFromArrays(this.gl, this._shape.getShape());
            twgl.setBuffersAndAttributes(this.gl, this.programInfo, this._wobblyInfo);

            const arrays = {
                position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
                texcoord: [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]
            };
            this._sprite = twgl.createBufferInfoFromArrays(this.gl, arrays);

            //todo why doesn't this work?...
            //this._sprite = twgl.primitives.createPlaneBufferInfo(this.gl);
            //twgl.setAttribInfoBufferFromArray(this.gl, this._sprite.attribs.position, arrays.position);
            // twgl.setAttribInfoBufferFromArray(this.gl, this._sprite.attribs.texcoord, arrays.texcoord);

            this.spriteProgramInfo = twgl.createProgramInfo(this.gl, [src[2], src[3]]);

            this._texture = twgl.createTexture(this.gl, {src: "assets/WobblyMask/face.png"});
            twgl.setUniforms(this.spriteProgramInfo, {
                texture: this._texture
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

        // Clearing the stencil buffer
        this.gl.clearStencil(0);
        this.gl.clear(this.gl.STENCIL_BUFFER_BIT);

        // Replacing the values at the stencil buffer to 1 on every pixel we draw
        this.gl.stencilFunc(this.gl.ALWAYS, 1, 1);
        this.gl.stencilOp(this.gl.REPLACE, this.gl.REPLACE, this.gl.REPLACE);
        this.gl.depthMask(false);
        // disable color (u can also disable here the depth buffers)
        this.gl.colorMask(false, false, false, false);

        this.gl.enable(this.gl.STENCIL_TEST);

        //draw shape
        this.gl.useProgram(this.programInfo.program);
        var shape = this._shape.getShape();
        twgl.setAttribInfoBufferFromArray(this.gl, this._wobblyInfo.attribs.position, shape.position.data);
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this._wobblyInfo);
        twgl.drawBufferInfo(this.gl, this._wobblyInfo);

        // Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
        this.gl.stencilFunc(this.gl.EQUAL, 1, 1);
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
        // enabling back the color buffer
        this.gl.colorMask(true, true, true, true);

        //draw sprite
        this.gl.useProgram(this.spriteProgramInfo.program);
        twgl.setAttribInfoBufferFromArray(this.gl, this._sprite.attribs.position, this._getPlane());
        twgl.setBuffersAndAttributes(this.gl, this.spriteProgramInfo, this._sprite);
        twgl.drawBufferInfo(this.gl, this._sprite);

        this.gl.disable(this.gl.STENCIL_TEST);
    }

    _addRule() {
        var html = '<div style="position:absolute;top : 20px;left:20px;width:200px;height:20px;background-color: black;"></div>';
        this.el.innerHTML = html;
    }

    _getPlane() {

        var width = 300;
        var height = 300;

        var position = [
            -width/2,
            height/2,
            0,
            width/2,
            height/2,
            0,
            -width/2,
            -height/2,
            0,
            -width/2,
            -height/2,
            0,
            width/2,
            height/2,
            0,
            width/2,
            -height/2,
            0
        ];

        var w = window.innerWidth;
        var h = window.innerHeight;


        var center = {
            x: this._shape.position.x / w * 2 - 1,
            y: 1 - (this._shape.position.y / h * 2)
        };

        for(var i =0 ; i < position.length; i += 3){
            position[i] = (position[i])/ (window.innerWidth / 2) + center.x;
            position[i+1] = (position[i+1])/ (window.innerHeight / 2) + center.y;
           // var z = position[i+2];
        }

        return position;
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