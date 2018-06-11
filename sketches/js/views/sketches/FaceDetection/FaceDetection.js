import {BaseSketch} from "../../BaseSketch.js";
import clm from "../../../vendor/clmtracker/clmtrackr.module.js";
import {CanvasUtils} from "../../../utils/CanvasUtils.js";
import {LoadingUtils} from "../../../utils/LoadingUtils.js";


export default class FaceDetection extends BaseSketch {

    constructor() {
        super('FaceDetection');

        LoadingUtils.LoadImage("assets/pineapple.png").then(img => {

            this.pineapple = img;
            this.pBox = {
                x : 0,
                y : 0,
                w : this.pineapple.naturalWidth / 3,
                h : this.pineapple.naturalHeight / 3
            };

            this.video = document.createElement("video");
            this.video.setAttribute("width", 400);
            this.video.setAttribute("height", 300);
            this.video.width = 400;
            this.video.height = 300;

            this.lBox = {x: 0, y: 0, w: 0, h: 0};
            this.rBox = {x: 0, y: 0, w: 0, h: 0};
            this.mBox = {x: 0, y: 0, w: 0, h: 0};
            this.nBox = {x: 0, y: 0, w: 0, h: 0};

            this.faceBuffer = CanvasUtils.CreateBuffer();

            this.buffer = CanvasUtils.CreateBuffer();

            this.el.appendChild(this.buffer.canvas);

            this._initUserMedia(this.video).then(() => {
                this.video.onloadedmetadata = () => {
                    this.faceBuffer.resize(this.video.videoWidth, this.video.videoHeight);
                    this.video.play();
                    ctrack.start(this.video);
                }
            });

            var ctrack = this.tracker = new clm.tracker({useWebGL: true});
            ctrack.init();

            window.dispatchEvent(new Event("resize"));
        });
    }

    draw(time) {
        super.draw(time);

        if (this.tracker) {

            this.buffer.clear();

            this.faceBuffer.ctx.drawImage(this.video, 0, 0);
            // this.tracker.track(this.video);
            var positions = this.tracker.getCurrentPosition();

            if (positions) {
                var box = this._getBoundingBox(positions.slice(0, 10));
                //this.tracker.draw(this.buffer.canvas);

                this.buffer.ctx.strokeStyle = "red";

                var scale = this.video.videoWidth / 400;
                var scaleBuffer = this.buffer.width / this.faceBuffer.width;

                var box = this._getMouthBox(positions);
                this._scaleBox(box, scale);
                this.mBox = this._easeBox(this.mBox, box, 0.1);
                this.mBox = this._translateBox(this.mBox, {
                    x: Math.sin(time * 0.0005) * 1,
                    y: Math.cos(time * 0.0005) * 1
                });
                // this.buffer.ctx.rect(box.x, box.y, box.w, box.h);
                this.buffer.ctx.drawImage(this.faceBuffer.canvas, box.x, box.y, box.w, box.h, this.mBox.x * scaleBuffer, this.mBox.y * scaleBuffer, this.mBox.w * scaleBuffer, this.mBox.h * scaleBuffer);

                box = this._getNoseBox(positions);
                this._scaleBox(box, scale);
                this.nBox = this._easeBox(this.nBox, box, 0.1);
                this.nBox = this._translateBox(this.nBox, {
                    x: Math.sin(time * 0.0001) * 1,
                    y: Math.cos(time * 0.0005) * 1
                });
                // this.buffer.ctx.rect(box.x, box.y, box.w, box.h);
                this.buffer.ctx.drawImage(this.faceBuffer.canvas, box.x, box.y, box.w, box.h, this.nBox.x * scaleBuffer, this.nBox.y * scaleBuffer, this.nBox.w * scaleBuffer, this.nBox.h * scaleBuffer);

                box = this._getLeftEyeBox(positions);
                this._scaleBox(box, scale);
                this.lBox = this._easeBox(this.lBox, box, 0.1);
                this.lBox = this._translateBox(this.lBox, {
                    x: Math.sin(time * 0.001) * 1,
                    y: Math.cos(time * 0.001) * 1
                });
                // this.buffer.ctx.rect(box.x, box.y, box.w, box.h);
                this.buffer.ctx.drawImage(this.faceBuffer.canvas, box.x, box.y, box.w, box.h, this.lBox.x * scaleBuffer, this.lBox.y * scaleBuffer, this.lBox.w * scaleBuffer, this.lBox.h * scaleBuffer);

                box = this._getRightEyeBox(positions);
                this._scaleBox(box, scale);
                this.rBox = this._easeBox(this.rBox, box, 0.1);
                this.rBox = this._translateBox(this.rBox, {
                    x: Math.cos(time * 0.001) * 1,
                    y: Math.sin(time * 0.001) * 1
                });
                //this.buffer.ctx.rect(box.x, box.y, box.w, box.h);
                this.buffer.ctx.drawImage(this.faceBuffer.canvas, box.x, box.y, box.w, box.h, this.rBox.x * scaleBuffer, this.rBox.y * scaleBuffer, this.rBox.w * scaleBuffer, this.rBox.h * scaleBuffer);

                this.buffer.ctx.stroke();

                /*this.pBox.x = Math.sin(time * 0.01) * this.buffer.width / 4 + this.buffer.width / 2;
                this.pBox.y = Math.cos(time * 0.1) * this.buffer.height / 4 + this.buffer.height / 2;
                this.buffer.ctx.drawImage(this.pineapple, this.pBox.x, this.pBox.y, this.pBox.w, this.pBox.h);*/
            }
        }
    }

    onResize(w, h) {
        super.onResize(w, h);

        if(this.buffer)
            this.buffer.resize(w, h);
    }

    _initUserMedia(element) {
        return new Promise(resolve => {

            window.navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            }).then(function (stream) {
                element.srcObject = stream;
                resolve();
            }).catch(function (err) {
                throw Error('Cannot capture user camera.');
            });
        });
    }

    _getLeftEyeBox(positions) {
        return this._getBoundingBox(positions.slice(23, 26));
    }

    _getRightEyeBox(positions) {
        return this._getBoundingBox(positions.slice(29, 31));
    }

    _getMouthBox(positions) {
        return this._getBoundingBox([positions[44], positions[47], positions[50], positions[53]])
    }

    _getNoseBox(positions) {
        return this._getBoundingBox([positions[33], positions[41], positions[62]]);
    }

    _getBoundingBox(positions, padding) {

        padding = padding || 10;

        var x = Infinity, y = Infinity, w = 0, h = 0;

        for (var i = 0; i < positions.length; i++) {
            x = Math.min(positions[i][0], x);
            y = Math.min(positions[i][1], y);
        }

        for (var i = 0; i < positions.length; i++) {
            w = Math.max(positions[i][0] - x, w);
            h = Math.max(positions[i][1] - y, h);
        }

        return {
            x: x - padding,
            y: y - padding,
            w: w + padding * 2,
            h: h + padding * 2
        };
    }

    _easeBox(from, to, ratio) {
        var box = {};
        Object.keys(to).forEach(key => {
            var diff = to[key] - from[key];
            box[key] = from[key] + (diff) * ratio;
        });
        return box;
    }

    _scaleBox(box, scale) {
        Object.keys(box).forEach(key => {
            box[key] *= scale;
        });
    }

    _translateBox(inBox, pos) {
        return {
            x: inBox.x + pos.x,
            y: inBox.y + pos.y,
            w: inBox.w,
            h: inBox.h
        };

    }

}