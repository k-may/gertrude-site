import {BaseSketch} from "../../BaseSketch.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

var m4 = twgl.m4;

export default class MaskBuffer extends BaseSketch {

    constructor() {
        super('MaskBuffer');

        this._maskPosition = {
            x: 0,
            y: 0,
            w: 200,
            h: 200
        };



        var path = 'js/views/sketches/MaskBuffer/';
        LoadingUtils.LoadImage("assets/pineapple.png").then(img => {
            LoadingUtils.LoadShaders([path + 'vert.glsl', path + 'frag.glsl', path + 'sprite-frag.glsl']).then(src => {

                this.canvas = document.createElement("canvas");
                this.gl = twgl.getContext(this.canvas);
                this.el.appendChild(this.canvas);

                this.texture = twgl.createTexture(this.gl, {
                    src: img
                });

                this.fbProgram = twgl.createProgramInfo(this.gl, [src[0], src[2]]);

                this.spriteProgramInfo = twgl.createProgramInfo(this.gl, [src[0], src[2]]);
                this.gl.useProgram(this.spriteProgramInfo.program);
                twgl.setUniforms(this.spriteProgramInfo, {
                    'u_texture': this.texture
                });

                this.programInfo = twgl.createProgramInfo(this.gl, src.slice(0, 2));

                const arrays = {
                    position: [0, 0, 0,
                        0, 1, 0,
                        1, 0, 0,
                        1, 0, 0,
                        0, 1, 0,
                        1, 1, 0],
                    texcoord: [0, 0,
                        0, 1,
                        1, 0,
                        1, 0,
                        0, 1,
                        1, 1]
                };
                this.plane = twgl.createBufferInfoFromArrays(this.gl, arrays);

                var gl = this.gl;
                var attachments = [
                    {format: gl.RGB, type: gl.UNSIGNED_BYTE, min: gl.LINEAR, wrap: gl.CLAMP_TO_EDGE},
                    {format: gl.DEPTH_STENCIL,},
                ];

                const fbSize = 200;
                this.fbi = twgl.createFramebufferInfo(gl, undefined, fbSize, fbSize);
                twgl.bindFramebufferInfo(this.gl, null);

                window.dispatchEvent(new Event("resize"));

            });
        });
    }

    draw(time) {
        super.draw(time);

        if (!this.gl)
            return;


        this.drawFB(time);

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 1, 0, 1);

        var m = m4.ortho(0, this.canvas.width, this.canvas.height, 0, -1, 1);
        m = m4.scale(m, [this._maskPosition.w, this._maskPosition.h, 0]);

        this.gl.useProgram(this.fbProgram.program);
        twgl.setUniforms(this.fbProgram, {
            "u_texture" : this.fbi.attachments[0],
            "u_matrix" : m
        });
        twgl.setBuffersAndAttributes(this.gl, this.fbProgram, this.plane);
        twgl.drawBufferInfo(this.gl, this.plane);

    }

    drawFB(time) {

        twgl.bindFramebufferInfo(this.gl, this.fbi);
        var gl = this.gl;
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            return;

        this.gl.clearColor(0, 0, 1, 1);   // clear to blue
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);


         this.gl.viewport(0, 0, this._maskPosition.w, this._maskPosition.h);

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

        this.drawMask(time);

        // Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
        this.gl.stencilFunc(this.gl.EQUAL, 1, 1);
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
        // enabling back the color buffer
        this.gl.colorMask(true, true, true, true);

        this.drawBg();

        this.gl.disable(this.gl.STENCIL_TEST);

        twgl.bindFramebufferInfo(this.gl, null);

    }

    drawBg() {

        //draw bg
        this.gl.useProgram(this.programInfo.program);
        twgl.setUniforms(this.programInfo, {
            "u_matrix": this._getBgMatrix()
        });
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.plane);
        twgl.drawBufferInfo(this.gl, this.plane);

    }

    drawMask(time) {
        //draw mask
        this.gl.useProgram(this.spriteProgramInfo.program);
        twgl.setUniforms(this.spriteProgramInfo, {
            "u_matrix": this._getMaskMatrix(time * 0.001),
            "u_texture" : this.texture
        });
        twgl.setBuffersAndAttributes(this.gl, this.spriteProgramInfo, this.plane);
        twgl.drawBufferInfo(this.gl, this.plane);
    }

    onResize(w, h) {
        super.onResize(w, h);

        if (!this.canvas)
            return;

        if (w !== this.width || h !== this.height) {
            this.canvas.width = this.width = w;
            this.canvas.height = this.height = h;
        }

        twgl.resizeCanvasToDisplaySize(this.canvas);

    }

    //----------------------------

    _getBgMatrix() {
        var m = m4.ortho(0, this._maskPosition.w, this._maskPosition.h, 0, -1, 1);
        m = m4.translate(m, [this._maskPosition.x, this._maskPosition.y, 0]);
        m = m4.scale(m, [this._maskPosition.w, this._maskPosition.h, 0]);
        return m;
    }

    _getMaskMatrix(rot) {
        var m = m4.ortho(0, this._maskPosition.w, this._maskPosition.h, 0, -1, 1);
        m = m4.translate(m, [this._maskPosition.x, this._maskPosition.y, 0]);
        m = m4.translate(m, [this._maskPosition.w / 2, this._maskPosition.h / 2, 0]);
        m = m4.rotateZ(m, rot);
        m = m4.translate(m, [-this._maskPosition.w / 2, -this._maskPosition.h / 2, 0]);
        m = m4.scale(m, [this._maskPosition.w, this._maskPosition.h, 0]);
        return m;
    }

    _generateMaskShape() {

        var position = [];

        return position;
    }

}