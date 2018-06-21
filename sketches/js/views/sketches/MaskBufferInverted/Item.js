import {LoadingUtils} from "../../../utils/LoadingUtils.js";

import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

var m4 = twgl.m4;
var fbi;

class Item {

    constructor(gl, stencilInFunc, stencilOutFunc, stencilOp) {

        this._stencilInFun = stencilInFunc;
        this._stencilOutFunc = stencilOutFunc;

        this._stencilOp = stencilOp;

        this.gl = gl;
        this.loaded = false;

        this.position = {
            x: 0,
            y: 0,
            w: 200,
            h: 200
        };

        LoadingUtils.LoadImage("assets/pineapple.png").then(img => {
            var path = 'js/views/sketches/MaskBufferInverted/';
            LoadingUtils.LoadShaders([path + 'vert.glsl', path + 'frag.glsl', path + 'sprite-frag.glsl']).then(src => {
              /*  this.position.w = img.naturalWidth * 0.2;
                this.position.h = img.naturalHeight * 0.2;*/
                this.spriteProgramInfo = twgl.createProgramInfo(this.gl, [src[0], src[2]]);
                this.programInfo = twgl.createProgramInfo(this.gl, src.slice(0, 2));
                this.pineappleTexture = twgl.createTexture(this.gl, {
                    src: img
                });
                this.init();
            });
        });
    }

    init() {

        const arrays = {
            position: [0, 0, 0,
                0, 1, 0,
                1, 0, 0,
                1, 0, 0,
                0, 1, 0,
                1, 1, 0]
        };
        this.plane = twgl.createBufferInfoFromArrays(this.gl, arrays);

        this.orthoMatrix = m4.ortho(0, window.innerWidth, window.innerHeight, 0, -1, 1);
        this.bgMatrix = this._getBgMatrix();
        this.fbMatrix = this._getFBMatrix();

        if (!Item.FBI) {
            const attachments = [
                {format: this.gl.RGBA, mag: this.gl.NEAREST},
                {format: this.gl.STENCIL_INDEX8},
            ];
            Item.FBI = twgl.createFramebufferInfo(this.gl, attachments, this.position.w, this.position.h);
        }

        //unbind fbo
        twgl.bindFramebufferInfo(this.gl, null);

    }

    drawStencil(time) {

        if (!this.spriteProgramInfo)
            return;

        //start stencil
        // Replacing the values at the stencil buffer to 1 on every pixel we draw

        this.gl.stencilFunc(this._stencilInFun, 1, 1);
        this.gl.stencilOp(this.gl.REPLACE, this.gl.REPLACE, this.gl.REPLACE);
        this.gl.depthMask(false);
        // disable color (u can also disable here the depth buffers)
        this.gl.colorMask(false, false, false, false);

        this.drawMask(time);

        // Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
        this.gl.stencilFunc(this._stencilOutFunc, 1, 1);
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
        // enabling back the color buffer
        this.gl.colorMask(true, true, true, true);

        this.drawBg();

    }

    draw(time) {

        if (!this.spriteProgramInfo)
            return;

        twgl.bindFramebufferInfo(this.gl, null);

        this.gl.useProgram(this.spriteProgramInfo.program);
        twgl.setUniforms(this.spriteProgramInfo, {
            "u_texture": Item.FBI.attachments[0],
            "u_matrix": this.fbMatrix
        });
        twgl.setBuffersAndAttributes(this.gl, this.spriteProgramInfo, this.plane);
        twgl.drawBufferInfo(this.gl, this.plane);


    }

    drawBg() {
        //draw bg
        this.gl.useProgram(this.programInfo.program);
        twgl.setUniforms(this.programInfo, {
            "u_matrix": this._getBgMatrix(0),
        });
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.plane);
        twgl.drawBufferInfo(this.gl, this.plane);

    }

    drawMask(time) {
        //draw mask
        this.gl.useProgram(this.spriteProgramInfo.program);
        twgl.setUniforms(this.spriteProgramInfo, {
            "u_matrix": this._getMaskMatrix(time * 0.001),
            "u_texture": this.pineappleTexture
        });
        twgl.setBuffersAndAttributes(this.gl, this.spriteProgramInfo, this.plane);
        twgl.drawBufferInfo(this.gl, this.plane);
    }

    //-------------------------------

    _getFBMatrix() {
        var m = m4.translate(this.orthoMatrix, [this.position.x, this.position.y, 0]);
        return m4.scale(m, [this.position.w, this.position.h, 0]);
    }

    _getBgMatrix() {
        var m = m4.translate(this.orthoMatrix, [this.position.x, this.position.y, 0]);
        return m4.scale(m, [this.position.w, this.position.h, 0]);
    }

    _getMaskMatrix(rot) {
       /* var m = m4.translate( this.orthoMatrix, [-this.position.w / 2, -this.position.h / 2, 0]);
        m = m4.rotateZ(m, rot);
        m = m4.translate(m, [this.position.w / 2, this.position.h / 2, 0]);
        return m4.scale(m, [this.position.w, this.position.h, 0]);*/

        var m = m4.translate( this.orthoMatrix, [this.position.x + this.position.w / 2, this.position.y + this.position.h / 2, 0]);
        m = m4.rotateZ(m, rot);
        m = m4.translate(m, [-this.position.w / 2, -this.position.h / 2, 0]);
        return m4.scale(m, [this.position.w, this.position.h, 0]);
    }

}

Item.FBI = null;

export default Item;