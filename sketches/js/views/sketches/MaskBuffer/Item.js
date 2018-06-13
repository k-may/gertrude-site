import {LoadingUtils} from "../../../utils/LoadingUtils.js";

import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

var m4 = twgl.m4;
var fbi;

class Item {

    constructor(gl) {

        this.gl = gl;
        this.loaded = false;

        this.position = {
            x: 0,
            y: 0,
            w: 200,
            h: 200
        };

        var path = 'js/views/sketches/MaskBuffer/';
        LoadingUtils.LoadImage("assets/pineapple.png").then(img => {
            LoadingUtils.LoadShaders([path + 'vert.glsl', path + 'frag.glsl', path + 'sprite-frag.glsl']).then(src => {
                this.position.w = img.naturalWidth * 0.2;
                this.position.h = img.naturalHeight * 0.2;
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

        this.bgMatrix = this._getBgMatrix();
        this.fbMatrix = this._getFBMatrix();
        this.orthoMatrix =  m4.ortho(0, this.position.w, this.position.h, 0, -1, 1);
        if (!Item.FBI) {
            const attachments = [
                {format: this.gl.RGBA, mag: this.gl.NEAREST},
                {format: this.gl.STENCIL_INDEX8},
            ];
            Item.FBI = twgl.createFramebufferInfo(this.gl, attachments, this.position.w, this.position.h);
        }
        twgl.bindFramebufferInfo(this.gl, null);

    }

    drawStencil(time){

        if (!this.spriteProgramInfo)
            return;

        this.gl.viewport(0, 0, this.position.w, this.position.h);

        this.drawMask(time);

        // Telling the stencil now to draw/keep only pixels that equals 1 - which we set earlier
        this.gl.stencilFunc(this.gl.EQUAL, 1, 1);
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
        // enabling back the color buffer
        this.gl.colorMask(true, true, true, true);

        this.drawBg();
    }

    draw(time) {

        if (!this.spriteProgramInfo)
            return;

        // if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        //  return;

        /*twgl.bindFramebufferInfo(this.gl, Item.FBI);
        this.gl.clearColor(0, 0, 1, 1);   // clear to blue
        this.gl.clearStencil(0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);*/






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
            "u_matrix": this.bgMatrix
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
        var m = m4.ortho(0, this.gl.canvas.width, this.gl.canvas.height, 0, -1, 1);
        m = m4.translate(m, [this.position.x, this.position.y, 0]);
        return m4.scale(m, [this.position.w, this.position.h, 0]);
    }

    _getBgMatrix() {
        var m = m4.ortho(0, this.position.w, this.position.h, 0, -1, 1);
        m = m4.scale(m, [this.position.w, this.position.h, 0]);
        return m;
    }

    _getMaskMatrix(rot) {
        //var m = m4.ortho(0, this.position.w, this.position.h, 0, -1, 1);
        var m = m4.translate( this.orthoMatrix, [this.position.w / 2, this.position.h / 2, 0]);
        m = m4.rotateZ(m, rot);
        m = m4.translate(m, [-this.position.w / 2, -this.position.h / 2, 0]);
        return m4.scale(m, [this.position.w, this.position.h, 0]);
    }

}

Item.FBI = null;

export default Item;