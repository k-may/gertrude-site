import {BaseSketch} from "../../BaseSketch.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

export default class TwglCube extends BaseSketch {

    constructor() {
        super('TwglCube');

        var path = "js/views/sketches/TwglCube/";
        LoadingUtils.LoadShaders([path + "vert.glsl", path + "frag.glsl"]).then(src => {


            const m4 = twgl.m4;
            this.canvas = document.createElement("canvas");
            this.gl = twgl.getContext(this.canvas);
            this.el.appendChild(this.canvas);

            this.programInfo = twgl.createProgramInfo(this.gl, src);

            const arrays = {
                position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
                normal: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
                texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
                indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
            };
            this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);

            this.tex = twgl.createTexture(this.gl, {
                min: this.gl.NEAREST,
                mag: this.gl.NEAREST,
                src: [
                    255, 255, 255, 255,
                    192, 192, 192, 255,
                    192, 192, 192, 255,
                    255, 255, 255, 255,
                ],
            });

            this.uniforms = {
                u_lightWorldPos: [1, 8, -10],
                u_lightColor: [1, 0.8, 0.8, 1],
                u_ambient: [0, 0, 0, 1],
                u_specular: [1, 1, 1, 1],
                u_shininess: 50,
                u_specularFactor: 1,
                u_diffuse: twgl.createTexture(this.gl, {src: "assets/WobblyMask/face.png"}),
            };

            window.dispatchEvent(new Event('resize'));
        });
    }


    draw(time) {

        if (!this.gl)
            return;

        time *= 0.001;

        var gl = this.gl;
        var m4 = twgl.m4;

        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fov = 30 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.5;
        const zFar = 10;
        const projection = m4.perspective(fov, aspect, zNear, zFar);
        const eye = [1, 4, -6];
        const target = [0, 0, 0];
        const up = [0, 1, 0];

        const camera = m4.lookAt(eye, target, up);
        const view = m4.inverse(camera);
        const viewProjection = m4.multiply(projection, view);
        const world = m4.rotationY(time);

        var uniforms = this.uniforms;
        uniforms.u_viewInverse = camera;
        uniforms.u_world = world;
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
        uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

        gl.useProgram(this.programInfo.program);
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
        twgl.setUniforms(this.programInfo, uniforms);
        gl.drawElements(gl.TRIANGLES, this.bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    }


    onResize(w, h) {

        if (!this.gl)
            return;

        if (w !== this.width || h !== this.height) {
            this.canvas.width = this.width = w;
            this.canvas.height = this.height = h;
        }
    }
}