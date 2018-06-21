import {BaseSketch} from "../../BaseSketch.js";
import "../../../node_modules/twgl.js/dist/4.x/twgl-full.js";
import Item from "./Item.js";

export default class MaskBufferInverted extends BaseSketch {

    constructor() {
        super('MaskBufferInverted');

        this.canvas = document.createElement("canvas");
        this.gl = twgl.getContext(this.canvas, {stencil: true});
        this.el.appendChild(this.canvas);

        this.items = [];

        var funcs = [
            this.gl.NEVER,
            this.gl.LESS,
            this.gl.EQUAL,
            this.gl.LEQUAL,
            this.gl.GREATER,
            this.gl.NOTEQUAL,
            this.gl.GEQUAL,
            this.gl.ALWAYS
        ];


        var w = 422 * 0.2;
        var h = w;//760 * 0.2;

        for (var i = 0; i < funcs.length; i++) {
            for (var ii = 0; ii < funcs.length; ii++) {
                var item = new Item(this.gl, funcs[i], funcs[ii]);
                item.position.x = i * (w + 10);
                item.position.y = ii * (h + 10);
                item.position.w = w;
                item.position.h = h;
                this.items.push(item);
            }
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

        //   twgl.bindFramebufferInfo(this.gl, Item.FBI);

        this.gl.clearColor(0, 0, 1, 1);   // clear to blue
        this.gl.clearStencil(0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

        this.gl.enable(this.gl.STENCIL_TEST);
        //draw FBO
        this.items.forEach(item => item.drawStencil(time));

        this.gl.disable(this.gl.STENCIL_TEST);

        /*this.gl.disable(this.gl.STENCIL_TEST);

        this.items.forEach(item => item.draw(time))*/
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