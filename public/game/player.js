function Player(map, name, x, y) {
    this.map = map;
    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.width = map.tsize;
    this.height = map.tsize;
    this.name = name;
    this.moved = false;
    this.alive = true;
    this.respawned = false;
    this.score = 0;

    this.image = Loader.getImage('player');
    this.newColor();
}

Player.SPEED = 20; // pixels per second

Player.prototype.newColor = function() {
    this.color = Math.floor(Math.random() * 3);
}

Player.prototype.move = function (delta, dirx, diry) {
    if (!this.alive) {
        return;
    }
    // move my player
    let oldX = this.x;
    let oldY = this.y;

    this.x += dirx * Player.SPEED;
    this.y += diry * Player.SPEED;

    // clamp values
    let maxX = (this.map.cols - 1) * this.map.tsize;
    let maxY = (this.map.rows - 1) * this.map.tsize;
    this.x = Math.max(map.tsize, Math.min(this.x, maxX - map.tsize));
    this.y = Math.max(map.tsize, Math.min(this.y, maxY - map.tsize));

    if (this.x != oldX || this.y != oldY) {
        this.moved = true;
    }
}

Player.prototype.respawn = function () {
    this.alive = true;
    this.respawned = true;

    this.x = randomInt(64, 64 * (width - 1));
    this.y = randomInt(64, 64 * (height - 1));
}
