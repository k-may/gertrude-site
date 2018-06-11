import {BaseSketch} from "../../BaseSketch.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";

export default class TwglMatrix extends BaseSketch {

    constructor() {
        super('TwglMatrix');

        var path = "js/views/sketches/TwglMatrix/";
        LoadingUtils.LoadShaders([path + "vert.glsl", path + "frag.glsl"]).then(src => {

            var m4 = twgl.m4;

            this.camera = m4.identity();
            this.view = m4.identity();
            this.viewProjection = m4.identity();

            this.canvas = document.createElement("canvas");
            var gl = this.gl = twgl.getContext(this.canvas);
            this.el.appendChild(this.canvas);

            this.programInfo = twgl.createProgramInfo(this.gl, src);

            this._plane = twgl.primitives.createPlaneBufferInfo(gl, 2, 2);
            twgl.setUniforms(this._plane, {
                texture: twgl.createTexture(this.gl, {src: "assets/WobblyMask/face.png"})
            });

            this.uniforms = {
                u_diffuseMult:  [1, 1, 1, 1], //chroma.hsv((baseHue + rand(0, 60)) % 360, 0.4, 0.8).gl(),
                u_diffuseOffset: [0, 0, 0, 0],
                u_diffuse: twgl.createTexture(this.gl, {src: "assets/WobblyMask/face.png"}),
                u_viewInverse: this.camera,
                u_world: m4.identity(),
                u_worldInverseTranspose: m4.identity(),
                u_worldViewProjection: m4.identity(),
            };

            this.object = {
                translation:[0,0,0],// [rand(-10, 10), rand(-10, 10), rand(-10, 10)],
                ySpeed: 0,//rand(0.1, 0.3),
                zSpeed: 0,//rand(0.1, 0.3),
                uniforms: this.uniforms,
            };

            window.dispatchEvent(new Event('resize'));
        });

    }

    draw(time) {

        if (!this.gl)
            return;

        var m4 = twgl.m4;
        var gl = this.gl;

        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const uni = this.object.uniforms;

        time *= 0.001;

        const radius = 20;
        const orbitSpeed = time * 0.1;
        const projection = m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 100);
        const eye = [Math.cos(orbitSpeed) * radius, 4, Math.sin(orbitSpeed) * radius];
        const target = [0, 0, 0];
        const up = [0, 1, 0];

        m4.lookAt(eye, target, up, this.camera);
        m4.inverse(this.camera, this.view);
        m4.multiply(projection,this.view,this.viewProjection);


        const world = uni.u_world;
        m4.identity(world);
        m4.rotateY(world, time * this.object.ySpeed, world);
        m4.rotateZ(world, time * this.object.zSpeed, world);
        m4.translate(world, this.object.translation, world);
        m4.rotateX(world, time, world);
        m4.transpose(m4.inverse(world, uni.u_worldInverseTranspose), uni.u_worldInverseTranspose);
        m4.multiply(this.viewProjection, uni.u_world, uni.u_worldViewProjection);

        twgl.drawObjectList(gl, [
            {
                programInfo: this.programInfo,
                bufferInfo: this._plane,
                uniforms: uni,
            }
        ]);

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