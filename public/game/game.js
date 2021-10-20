const sqrt2 = Math.sqrt(1/2);

let Game = {};

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
        this.ctx.clearRect(0, 0, 512, 512);

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

    this.myPlayer = new Player(map, name, randomInt(64, 64 * (width - 1)), randomInt(64, 64 * (height - 1)));
    this.ablyHandler = new AblyHandler(this.myPlayer);
    this.camera = new Camera(map, 512, 512);
    this.camera.follow(this.myPlayer);
    this.waitingForDeath = new Set();

    setInterval(() => { this.ablyHandler.shouldChangeColor = true}, 5000);
};

let frame = 0;

Game.update = function (delta) {
    if (this.myPlayer.respawned) {
        this.myPlayer.respawned = false;
        this.ablyHandler.updateState(this.myPlayer);
    }

    frame++;
    // handle my player's movement with arrow keys
    let dirx = 0;
    let diry = 0;
    if (Keyboard.isDown(Keyboard.LEFT)) { dirx = -1; }
    else if (Keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; }
    if (Keyboard.isDown(Keyboard.UP)) { diry = -1; }
    else if (Keyboard.isDown(Keyboard.DOWN)) { diry = 1; }

    let sum = Math.abs(dirx) + Math.abs(diry);
    if (sum == 2) {
        dirx *= sqrt2;
        diry *= sqrt2;
    }

    if (gameCanvas.getBoundingClientRect()) {
        let cursorPos = getCursorPosition(this.myPlayer, this.camera);
        if (mouseDown && cursorPos != null) {
            let absX = Math.abs(cursorPos.x);
            let absY = Math.abs(cursorPos.y);
            let abss = absX + absY;
            let xRatio = cursorPos.x / abss;
            let yRatio = cursorPos.y / abss;

            dirx = xRatio * -1;
            diry = yRatio * -1;
        }
    }

    this.myPlayer.move(delta, dirx, diry);

    if (this.myPlayer.moved) {
        this.myPlayer.moved = false;
        this.ablyHandler.updateState(this.myPlayer);
    }

    if (this.ablyHandler.shouldChangeColor) {
        this.ablyHandler.shouldChangeColor = false;
        this.myPlayer.newColor();
        this.ablyHandler.updateState(this.myPlayer);
    }

    this.checkIfPlayerDied();

    this.camera.update();
};

var mouseDown = 0;

let gameCanvas = document.getElementById("game");
gameCanvas.onmousedown = function(e) { 
  e.preventDefault();
  mouseDown = true;
}
document.body.onmouseup = function() {
  mouseDown = false;
}

// $("#game").mousedown(function(event){
//     event.preventDefault();
// });
var pointerX = 0;
var pointerY = 0;

document.onmousemove = function(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
}

const canvas = document.querySelector('canvas')
canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

function getCursorPosition(myPlayer, camera) {
    let canvasRect = gameCanvas.getBoundingClientRect();
    let a = canvasRect.right < pointerX;
    let b = canvasRect.left > pointerX;
    let c = canvasRect.bottom < pointerY;
    let d = canvasRect.top > pointerY;
    if (canvasRect.right < pointerX
        || canvasRect.left > pointerX
        || canvasRect.bottom < pointerY
        || canvasRect.top > pointerY
        ) {
        return null;
    }

    console.log(canvasRect.left + " BOOP")
        console.log(canvasRect.right + " BAAP")
    console.log(myPlayer.x + " PLAYX")
    console.log(pointerX + " OOOO");

    let playerMiddleX = myPlayer.x + (myPlayer.width / 2);
    let playerMiddleY = myPlayer.y + (myPlayer.height / 2);

    let mousePos = {
        "x" : (playerMiddleX + canvasRect.left) - pointerX - camera.x, 
        "y" : (playerMiddleY + canvasRect.top) - pointerY - camera.y
    };
    return mousePos;
}

// Set up touch events for mobile, etc
canvas.addEventListener("touchstart", function (e) {
  mousePos = getTouchPos(canvas, e);
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
  e.preventDefault();
}, false);
canvas.addEventListener("touchend", function (e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}

Game.checkIfPlayerDied = async function() {
    let players = await this.ablyHandler.playerPositions();

    for (const player of players) {
        if (player.data == undefined || !player.data.alive) {
            continue;
        }

        if (this.myPlayer.id != player.data.id && this.myPlayer.alive && this.myPlayerWins(this.myPlayer, player.data) && 
            this.playersAreTouching(this.myPlayer, player.data)) {

            this.waitingForDeath.add(player.data.id);
            this.ablyHandler.sendMessage(player.data.id, 'kill');
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

    if (!this.myPlayer.alive) {
        this.ctx.font = '20px serif';
        this.ctx.fillText("You died! You'll respawn soon...", 100, 100);
    }
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
            this.myPlayer.score++;
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
        this.myPlayer.image, // image
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
