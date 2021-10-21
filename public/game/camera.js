function Camera(map, width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.maxX = map.cols * map.tsize - width;
    this.maxY = map.rows * map.tsize - height;
}

Camera.prototype.follow = function (sprite) {
    this.following = sprite;
}

Camera.prototype.update = function () {
    // make the camera follow the sprite
    this.x = this.x + ((this.following.x - this.width / 2) - this.x) / 2;
    this.y = this.y + ((this.following.y - this.height / 2) - this.y) / 2;

    // clamp values
    this.x = Math.max(0, Math.min(this.x, this.maxX));
    this.y = Math.max(0, Math.min(this.y, this.maxY));
}
