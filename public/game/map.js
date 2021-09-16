const height = 50;
const width = 50;

let map = {
    cols: width,
    rows: height,
    tsize: 64,
    tiles: new Array(height * width).fill(1),
    getTile: function (col, row) {
        return this.tiles[row * map.cols + col];
    }
};

// Add tree border
for (let z = 0; z < width * height; z++) {
    if (Math.floor(z / width) === 0 ||
        z % width === 0 ||
        z % height == height - 1 ||
        Math.floor(z / width) == height - 1) {

        map.tiles[z] = 3;
    }
}
