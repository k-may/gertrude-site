import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

var m4 = twgl.m4;

export default class BlurBuffer {

    constructor(gl, src) {

        this.gl = gl;
        this.position = {
            x: 0,
            y: 0,
            w: 200,
            h: 200
        };

        this.programInfo = twgl.createProgramInfo(this.gl, src);

        const arrays = {
            position: [0, 0, 0,
                0, 1, 0,
                1, 0, 0,
                1, 0, 0,
                0, 1, 0,
                1, 1, 0]
        };
        this.plane = twgl.createBufferInfoFromArrays(this.gl, arrays);
        this.matrix = this._getFBMatrix();

        this._fbi = [];
        for (var i = 0; i < 2; i++) {
            var fbi = twgl.createFramebufferInfo(this.gl, null, window.innerWidth, window.innerHeight);
            twgl.bindFramebufferInfo(this.gl, null);
            this._fbi.push(fbi);
        }

        this.src = this._fbi[0];
        this.dest = this._fbi[1];
        this._time = 0;
        this._ready = false;
    }

    swap() {
        var temp = this.dest;
        this.dest = this.src;
        this.src = temp;

    }

    draw(texture, numPasses, width, height) {

        if (!this.programInfo || !this._checkReady())
            return;

        numPasses = numPasses !== undefined ? numPasses : 5;

        this.gl.useProgram(this.programInfo.program);
        this.gl.enable(this.gl.BLEND);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        var time = Date.now() * 0.001;
        var anim = (Math.sin(time) * 0.5 + 0.5);

       for (var i = 0; i < numPasses; i++) {

            var radius = (numPasses - i - 1) * anim;
            var direction = i % 2;
            twgl.bindFramebufferInfo(this.gl, this.dest);

            if (i == 0) {
                this.pass(texture, direction, radius, true);
            } else {
                this.pass(this.src.attachments[0], direction, radius, true);
            }

            this.swap();
        }

        twgl.bindFramebufferInfo(this.gl, null);

        this.pass(this.src.attachments[0], 1, 3, false)

    }

    pass(texture, direction, radius, flip) {

        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.plane);
        twgl.setUniforms(this.programInfo, {
            "u_texture": texture,
            "u_matrix": this._getFBMatrix(),
            "u_direction": direction === 0 ? [radius, 0] : [0, radius],
            "u_flip": flip
        });
        twgl.drawBufferInfo(this.gl, this.plane);
    }

    //-------------------------

    _getFBMatrix() {
        var m = m4.ortho(0, this.gl.canvas.width, this.gl.canvas.height, 0, -1, 1);
        // m = m4.translate(m, [this.gl.canvas.width, this.gl.canvas.height, 0]);
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

    _resize() {

        this.gl.useProgram(this.programInfo.program);
        twgl.setUniforms(this.programInfo, {
            "u_resolution": [this.gl.canvas.width, this.gl.canvas.height]
        });

        twgl.resizeFramebufferInfo(this.gl, this.src);
        twgl.resizeFramebufferInfo(this.gl, this.dest);

    }
}