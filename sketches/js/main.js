import {MainView} from "./views/MainView.js";

var mainView = new MainView(document.getElementsByClassName('js-region-main')[0]);

function draw() {
    window.requestAnimationFrame(draw);
    var time = window.performance.now();
    mainView.draw(time);
}

window.addEventListener('gliready', () => {
    mainView.initialize();
    document.body.appendChild(mainView.el);
    draw();
});
