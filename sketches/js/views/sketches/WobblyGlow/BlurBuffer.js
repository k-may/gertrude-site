import {LoadingUtils} from "../../../utils/LoadingUtils.js";

import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

var m4 = twgl.m4;

export default class BlurBuffer {

    constructor(gl) {

        this.gl = gl;
        var path = "js/views/sketches/WobblyGlow/";

        LoadingUtils.LoadShaders([path + "vert-fb.glsl", path + "frag-blur.glsl"]).then(src => {

            this.programInfo = twgl.createProgramInfo(this.gl, src);

            var attribs = {
                position: [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]
            };
            this.plane = twgl.createBufferInfoFromArrays(this.gl, attribs);

            this._fbi = [];
            for (var i = 0; i < 2; i++) {
                var fbi = twgl.createFramebufferInfo(this.gl, null, window.innerWidth, window.innerHeight);
                twgl.bindFramebufferInfo(this.gl, null);
                this._fbi.push(fbi);
            }

            this.src = this._fbi[0];
            this.dest = this._fbi[1];

            this._ready = false;
        });
    }

    swap() {
        var temp = this.dest;
        this.dest = this.src;
        this.src = temp;

        twgl.bindFramebufferInfo(this.gl, this.dest);
    }

    draw(texture) {

        if (!this.programInfo || !this._checkReady())
            return;

        var numPasses = 10;

        this.gl.useProgram(this.programInfo.program);

        this.gl.enable(this.gl.BLEND);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.swap();
        this.pass(texture, 1);

        for (var i = 0; i < numPasses; i++) {

            this.swap();

            if (i == numPasses - 1)
                twgl.bindFramebufferInfo(this.gl, null);

            var radius = (numPasses - i - 1) * 0.1;
            this.pass(this.src.attachments[0], i % 2, radius);
        }

    }

    pass(texture, direction, radius) {


        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.plane);
        twgl.setUniforms(this.programInfo, {
            "u_texture": texture,
            "u_matrix": this._getFBMtrix(),
            "u_direction": direction === 0 ? [1, 0] : [0, 1]
        });
        twgl.drawBufferInfo(this.gl, this.plane);
    }

    _getFBMtrix() {
        var m = m4.ortho(0, this.gl.canvas.width, 0, this.gl.canvas.height, -1, 1);
        return m4.scale(m, [this.gl.canvas.width, this.gl.canvas.height, 0]);
    }

    _checkReady() {
        if (!this._ready) {
            if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) === this.gl.FRAMEBUFFER_COMPLETE)
                this._ready = true;
            else
                console.log("framebuffers not ready");
        }

        return this._ready;
    }

}