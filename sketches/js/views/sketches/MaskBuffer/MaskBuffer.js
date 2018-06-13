import {BaseSketch} from "../../BaseSketch.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";
import Item from "./Item.js";

export default class MaskBuffer extends BaseSketch {

    constructor() {
        super('MaskBuffer');

        this.canvas = document.createElement("canvas");
        this.gl = twgl.getContext(this.canvas);
        this.el.appendChild(this.canvas);

        this.items = [];
        for (var i = 0; i < 500; i++) {
            var item = new Item(this.gl);
            item.position.x = Math.random() * window.innerWidth;
            item.position.y = Math.random() * window.innerHeight;
            this.items.push(item);
        }

        window.dispatchEvent(new Event("resize"));
    }

    draw(time) {
        super.draw(time);

        if (!this.gl)
            return;

        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 1, 0, 1);

        twgl.bindFramebufferInfo(this.gl, Item.FBI);
        this.gl.clearColor(0, 0, 1, 1);   // clear to blue
        this.gl.clearStencil(0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

        this.batchStencil();
        this.batchFBO();
    }

    batchStencil() {
        //start stencil
        // Replacing the values at the stencil buffer to 1 on every pixel we draw
        this.gl.stencilFunc(this.gl.ALWAYS, 1, 1);
        this.gl.stencilOp(this.gl.REPLACE, this.gl.REPLACE, this.gl.REPLACE);
        this.gl.depthMask(false);
        // disable color (u can also disable here the depth buffers)
        this.gl.colorMask(false, false, false, false);
        this.gl.enable(this.gl.STENCIL_TEST);

        //draw FBO
        this.items.forEach(item => item.drawStencil(time));

        this.gl.disable(this.gl.STENCIL_TEST);
    }

    batchFBO() {
        this.items.forEach(item => item.draw(time));
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

}