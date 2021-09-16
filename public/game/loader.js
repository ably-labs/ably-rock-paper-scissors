let Loader = {
    images: {}
};

let frameCount = 0;
const fps = 10;
let fpsInterval, startTime, now, then, elapsed;

Loader.loadImage = function (key, src) {
    let img = new Image();

    let d = new Promise(function (resolve, reject) {
        img.onload = function () {
            this.images[key] = img;
            resolve(img);
        }.bind(this);

        img.onerror = function () {
            reject('Could not load image: ' + src);
        };
    }.bind(this));

    img.src = src;
    return d;
};

Loader.getImage = function (key) {
    return (key in this.images) ? this.images[key] : null;
};
