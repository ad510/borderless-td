"use strict";

/*
todo:
replace temp images
delete monsters when they leave
resource text & background styling
make new offset monsters when adding new tile
comments
*/

// constants (all lengths in pixels, all times in milliseconds)
var UpdateRate = 50;
var PlSpeed = 5;
var MoSpeed = 10;
var TileSize = 500;
var TileMinTrees = 2;
var TileMaxTrees = 6;
var TileMinMonsters = 1;
var TileMaxMonsters = 1;
var NTreeType = 2;

// game state variables
var mouseX, mouseY;
var viewX, viewY;
var time = 0;
var timeMonster = 0;
var tileRng = {
  minX: 100, maxX: -100, minY: 100, maxY: -100,
  row: [], col: []
};

// drawn objects
var player;
var tiles = [];
var drops = [];

function closeInfo() {
  var infoTag = document.getElementById("info");
  infoTag.parentNode.removeChild(infoTag);
}

// initialize game and start timer (called when page loaded)
function load() {
  player = objNew("img/player.png", "player", 0, 0);
  player.targetX = 0;
  player.targetY = 0;
  update();
  setInterval("update()", UpdateRate);
}

// move player when map clicked
function mouseDown(e) {
  getMousePos(e);
  player.targetX = mouseX + viewX;
  player.targetY = mouseY + viewY;
}

function keyDown(e) {
  var key = findKey(e);
  if (key == "D") {
    drops[drops.length] = objNew("img/drop.png", "drop", player.x, player.y);
  }
}

function build(type) {
  drops[drops.length] = objNew("img/drop.png", "drop", player.x, player.y);
}

// update game at fixed time intervals
function update() {
  time += UpdateRate;
  generate();
  simulate();
  draw();
}

// generate new game objects
function generate() {
  var tileX, tileY;
  var nObjs;
  var i, j, k;
  // check if should make new tiles
  for (i = Math.floor(viewX / TileSize); i <= Math.ceil((viewX + getWindowWidth()) / TileSize); i++) {
    if (tiles[i] == undefined) {
      tiles[i] = [];
    }
    for (j = Math.floor(viewY / TileSize); j <= Math.ceil((viewY + getWindowHeight()) / TileSize); j++) {
      if (tiles[i][j] == undefined) {
        // make new tile here
        tileX = i * TileSize;
        tileY = j * TileSize;
        tiles[i][j] = {};
        // add trees to tile
        tiles[i][j].trees = [];
        nObjs = randInt(TileMinTrees, TileMaxTrees);
        for (k = 0; k < nObjs; k++) {
          tiles[i][j].trees[k] = objNew("img/tree" + Math.floor(Math.random() * NTreeType) + ".png", "tree", tileX + Math.random() * TileSize, tileY + Math.random() * TileSize);
        }
        // add empty monsters array
        tiles[i][j].monsters = [];
        // update tile range
        if (i < tileRng.minX) tileRng.minX = i;
        if (i > tileRng.maxX) tileRng.maxX = i;
        if (j < tileRng.minY) tileRng.minY = j;
        if (j > tileRng.maxY) tileRng.maxY = j;
        if (tileRng.row[j] == undefined) {
          tileRng.row[j] = {};
          tileRng.row[j].minX = i;
          tileRng.row[j].maxX = i;
        }
        if (i < tileRng.row[j].minX) tileRng.row[j].minX = i;
        if (i > tileRng.row[j].maxX) tileRng.row[j].maxX = i;
        if (tileRng.col[i] == undefined) {
          tileRng.col[i] = {};
          tileRng.col[i].minY = j;
          tileRng.col[i].maxY = j;
        }
        if (j < tileRng.col[i].minY) tileRng.col[i].minY = j;
        if (j > tileRng.col[i].maxY) tileRng.col[i].maxY = j;
      }
    }
  }
  // generate monsters
  if (MoSpeed * (time - timeMonster) >= TileSize) {
    timeMonster += MoSpeed * (time - timeMonster);
    for (i = tileRng.minY; i <= tileRng.maxY; i++) {
      nObjs = randInt(TileMinMonsters, TileMaxMonsters);
      for (j = 0; j < nObjs; j++) {
        var monster;
        tileX = tileRng.row[i].minX;
        monster = objNew("img/drop.png", "monster", (tileX + Math.random()) * TileSize, (i + Math.random()) * TileSize);
        monster.velX = MoSpeed;
        monster.velY = 0;
        tiles[tileX][i].monsters[tiles[tileX][i].monsters.length] = monster;
      }
    }
  }
}

// move game objects
function simulate() {
  var i, j, k;
  // player
  var dist = Math.sqrt(Math.pow(player.targetX - player.x, 2) + Math.pow(player.targetY - player.y, 2));
  if (dist >= PlSpeed) {
    player.x += (player.targetX - player.x) / dist * PlSpeed;
    player.y += (player.targetY - player.y) / dist * PlSpeed;
  }
  // monsters
  for (i in tiles) {
    for (j in tiles[i]) {
      for (k in tiles[i][j].monsters) {
        tiles[i][j].monsters[k].x += tiles[i][j].monsters[k].velX;
        tiles[i][j].monsters[k].y += tiles[i][j].monsters[k].velY;
      }
    }
  }
}

// draw everything by moving image tags
function draw() {
  var i, j, k;
  // resize draw div to window size
  getDrawDiv().style.width = getWindowWidth() + "px";
  getDrawDiv().style.height = getWindowHeight() + "px";
  // center view on player
  viewX = player.x - getWindowWidth() / 2;
  viewY = player.y - getWindowHeight() / 2;
  // move ground background image
  document.body.style.backgroundPosition = -viewX + "px " + -viewY + "px";
  objDraw(player);
  for (i in tiles) {
    for (j in tiles[i]) {
      for (k = 0; k < tiles[i][j].trees.length; k++) {
        objDraw(tiles[i][j].trees[k]);
      }
      for (k in tiles[i][j].monsters) {
        objDraw(tiles[i][j].monsters[k]);
      }
    }
  }
  for (i = 0; i < drops.length; i++) {
    objDraw(drops[i]);
  }
}

// returns random integer in specified range
function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
