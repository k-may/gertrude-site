import {LoadingUtils} from "../../../utils/LoadingUtils.js";

import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

var m4 = twgl.m4;
var fbi;

export default class SimpleBuffer {

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
    }

    draw(texture) {

        if (!this.programInfo)
            return;

        this.gl.useProgram(this.programInfo.program);
        twgl.setUniforms(this.programInfo, {
            "u_texture": texture,
            "u_matrix": this._getFBMatrix()
        });
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.plane);
        twgl.drawBufferInfo(this.gl, this.plane);

    }

    //-------------------------------
    _getFBMatrix() {
        var m = m4.ortho(0, this.gl.canvas.width, this.gl.canvas.height, 0, -1, 1);
        m = m4.translate(m, [this.position.x, this.position.y, 0]);
        return m4.scale(m, [this.position.w, this.position.h, 0]);
    }


}
