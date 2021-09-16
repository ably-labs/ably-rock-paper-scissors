const sqrt2 = Math.sqrt(1/2);

let scale = 4096;

let Game = {};

let numPlayers = 395;

let frameCount = 0;
const fps = 5;
let fpsInterval, startTime, now, then, elapsed;

let playerz = [];

image = Loader.getImage('player');

Game.run = function (context) {
    this.ctx = context;
    this._previousElapsed = 0;

    fpsInterval = 1000 / fps;
    then = Date.now();

    let p = this.load();
    Promise.all(p).then(function (loaded) {
        this.init(name);
        window.requestAnimationFrame(this.tick);
    }.bind(this));
};

Game.tick = function (elapsed) {
    window.requestAnimationFrame(this.tick);

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        // clear previous frame
        this.ctx.clearRect(0, 0, scale, scale);

        var delta = (elapsed - this._previousElapsed) / 1000.0;
        delta = Math.min(delta, 0.25); // maximum delta of 250 ms
        this._previousElapsed = elapsed;

        this.update(delta);
        this.render();
    }
}.bind(Game);

Game.load = function () {
    return [
        Loader.loadImage('tiles', '../assets/tiles.png'),
        Loader.loadImage('player', '../assets/character.gif')
    ];
};

Game.init = function (name) {
    Keyboard.listenForEvents(
        [Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);
    this.tileAtlas = Loader.getImage('tiles');

    // this.myPlayer = new Player(map, name, randomInt(64, 64 * (width - 1)), randomInt(64, 64 * (height - 1)));

    for (let v=0; v < numPlayers; v++) {
        let idz = uuidv4();
        playerz[idz] = new Player(map, uuidv4(), randomInt(64, 64 * (width - 1)), randomInt(64, 64 * (height - 1)));
    }

    image = Loader.getImage('player');

    this.ablyHandler = new AblyHandler(playerz);
    this.camera = new Camera(map, scale, scale);
    this.camera.follow(this.myPlayer);
    this.waitingForDeath = new Set();

    setInterval(() => { this.ablyHandler.shouldChangeColor = true}, 5000);
};

let frame = 0;

Game.update = function (delta) {
    for (const [idz, player] of Object.entries(playerz)) {
        if (player.respawned) {
            player.respawned = false;
            this.ablyHandler.updateState(player);
        }

        frame++;
        // handle my player's movement with arrow keys
        let dirx = randomInt(-1, 1);
        let diry = randomInt(-1, 1);

        let sum = Math.abs(dirx) + Math.abs(diry);
        if (sum == 2) {
            dirx *= sqrt2;
            diry *= sqrt2;
        }

        player.move(delta, dirx, diry);

        if (player.moved) {
            player.moved = false;
            this.ablyHandler.updateState(player);
        }

        if (this.ablyHandler.shouldChangeColor) {
            this.ablyHandler.shouldChangeColor = false;
            player.newColor();
            this.ablyHandler.updateState(player);
        }

        this.checkIfPlayerDied();
    }

    this.camera.update();
};

Game.checkIfPlayerDied = async function() {
    let players = await this.ablyHandler.playerPositions();

    for (const player of players) {
        for (const player2 of playerz) {
            if (player.data == undefined || !player.data.alive) {
                continue;
            }

            if (player2.id != player.data.id && player2.alive && this.myPlayerWins(player2, player.data) && 
                this.playersAreTouching(player2, player.data)) {

                this.waitingForDeath.add(player.data.id);
                this.ablyHandler.sendMessage(player.data.id, 'kill');
            }
        }
    }
}

Game.myPlayerLoses = function(player1, player2) {
    return ((player1.color + 1) % 3) == player2.color;
}

Game.myPlayerWins = function(player1, player2) {
    return ((player1.color + 1) % 3) == player2.color && !this.waitingForDeath.has(player2.id);
}

Game.playersAreTouching = function(player1, player2) {
    if (player1.x >= (player2.x + player2.width) || player2.x >= (player1.x + player1.width)) return false;

    // no vertical overlap
    if (player1.y >= (player2.y + player2.height) || player2.y >= (player1.y + player1.height)) return false;

    return true;
}

Game._drawLayer = function (layer) {
    let startCol = Math.floor(this.camera.x / map.tsize);
    let endCol = startCol + (this.camera.width / map.tsize);
    let startRow = Math.floor(this.camera.y / map.tsize);
    let endRow = startRow + (this.camera.height / map.tsize);
    let offsetX = -this.camera.x + startCol * map.tsize;
    let offsetY = -this.camera.y + startRow * map.tsize;

    for (let c = startCol; c <= endCol; c++) {
        for (let r = startRow; r <= endRow; r++) {
            let tile = map.getTile(c, r);
            let x = (c - startCol) * map.tsize + offsetX;
            let y = (r - startRow) * map.tsize + offsetY;
            if (tile !== 0) { // 0 => empty tile
                this.ctx.drawImage(
                    this.tileAtlas, // image
                    (tile - 1) * map.tsize, // source x
                    0, // source y
                    map.tsize, // source width
                    map.tsize, // source height
                    Math.round(x),  // target x
                    Math.round(y), // target y
                    map.tsize, // target width
                    map.tsize // target height
                );
            }
        }
    }
};

Game._drawGrid = function () {
    let width = map.cols * map.tsize;
    let height = map.rows * map.tsize;
    let x, y;
    for (let r = 0; r < map.rows; r++) {
        x = - this.camera.x;
        y = r * map.tsize - this.camera.y;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(width, y);
        this.ctx.stroke();
    }
    for (let c = 0; c < map.cols; c++) {
        x = c * map.tsize - this.camera.x;
        y = - this.camera.y;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();
    }
};

Game.render = function () {
    // draw map background layer
    this._drawLayer(0);

    if (this.ablyHandler.connection.connection.state == "connected") this.renderPlayers();

    this._drawGrid();

    // if (!this.myPlayer.alive) {
    //     this.ctx.font = '20px serif';
    //     this.ctx.fillText("You died! You'll respawn soon...", 100, 100);
    // }
};

Game.renderPlayers = async function() {
    // draw all enemies
    let players = await this.ablyHandler.playerPositions();

    let scores = [];

    for (const player of players) {
        if (player.data == undefined) {
            continue;
        }
        scores.push({ 'name': player.data.name, 'score': player.data.score});

        if (!player.data.alive && this.waitingForDeath.has(player.data.id)) {
            this.waitingForDeath.delete(player.data.id);
            // this.myPlayer.score++;
        }
        this.drawPlayer(player.data);
    }
    clearScoreboard();
    scores.sort(compare);
    updateList(scores);
}

function compare(a, b) {
  if (a.score < b.score){
    return -1;
  }
  if (a.score > b.score){
    return 1;
  }
  return 0;
}

Game.drawPlayer = function (player) {
    if (!player.alive) {
        return;
    }

    let x = player.x - this.camera.x;
    let y = player.y - this.camera.y;

    this.ctx.drawImage(
        image, // image
        player.color * player.width, // source x
        Math.floor(frame / 2 % 2) * map.tsize,  // source y
        player.width, // source width
        player.height, // source height
        x,
        y,
        player.width,
        player.height
    );
    this.ctx.font = '12px serif';
    this.ctx.fillText(player.name, x, y - 15);
}

// 
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
