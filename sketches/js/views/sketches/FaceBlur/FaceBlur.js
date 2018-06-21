import {BaseSketch} from "../../BaseSketch.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";
import BlurBuffer from "./BlurBuffer.js";
import SimpleBuffer from "./SimpleBuffer.js";

export default class FaceBlur extends BaseSketch {

    constructor() {
        super('FaceBlur');

        this.numPasses = 1;

        LoadingUtils.LoadImage("assets/pineapple.png").then(img => {
            var path = "js/views/sketches/FaceBlur/";
            LoadingUtils.LoadShaders([path + "vert-blur.glsl", path + "frag-blur.glsl", path + "frag.glsl"]).then(src => {

                this.canvas = document.createElement("canvas");
                this.gl = twgl.getContext(this.canvas);
                this.el.appendChild(this.canvas);

                this.texture = twgl.createTexture(this.gl, {src: img});
                this.blurBuffer = new BlurBuffer(this.gl, [src[0], src[1]]);
                this.simpleBuffer = new SimpleBuffer(this.gl, [src[0], src[2]]);

                window.dispatchEvent(new Event("resize"));
            });
        });
    }

    draw(time) {
        super.draw(time);

        if (!this.gl)
            return;

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 1, 0, 1);

        this.blurBuffer.draw(this.texture, Math.ceil(this.numPasses));
        //   this.simpleBuffer.draw(this.texture);
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

        this.blurBuffer._resize();
    }
}