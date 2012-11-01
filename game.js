"use strict";

/*
todo:
x & y pos should specify pos at obj center defined in variable (not corner of img)
debug tree generation
z index
*/

// constants (all lengths in pixels, all times in milliseconds)
var UpdateRate = 50;
var PlSpeed = 10;
var TileSize = 500;
var TileMinTrees = 1;
var TileMaxTrees = 1;
var NTreeType = 2;

// game state variables
var mouseX, mouseY;
var viewX, viewY;

// drawn objects
var player;
var tiles = [];

function load() {
  player = objNew("p0.png", "player", 0, 0);
  player.targetX = 0;
  player.targetY = 0;
  update();
  setInterval("update()", UpdateRate);
}

function mouseDown(e) {
  getMousePos(e);
  player.targetX = mouseX + viewX - player.img.width / 2;
  player.targetY = mouseY + viewY - player.img.height / 2;
}

function update() {
  generate();
  simulate();
  draw();
}

function generate() {
  var tileX, tileY;
  var nObjs;
  var i, j, k;
  for (i = Math.floor(viewX / TileSize); i <= Math.ceil((viewX + getWindowWidth()) / TileSize); i++) {
    if (tiles[i] == undefined) {
      tiles[i] = [];
    }
    for (j = Math.floor(viewY / TileSize); j <= Math.ceil((viewY + getWindowHeight()) / TileSize); j++) {
      if (tiles[i][j] == undefined) {
        tileX = i * TileSize;
        tileY = j * TileSize;
        tiles[i][j] = {};
        tiles[i][j].trees = [];
        nObjs = Math.floor(TileMinTrees + Math.random() * (TileMaxTrees - TileMinTrees));
        for (k = 0; k < nObjs; k++) {
          tiles[i][j].trees[k] = objNew("tree" + Math.floor(Math.random() * NTreeType) + ".png", "tree", tileX + Math.random() * TileSize, tileY + Math.random() * TileSize);
        }
      }
    }
  }
}

function simulate() {
  var dist = Math.sqrt(Math.pow(player.targetX - player.x, 2) + Math.pow(player.targetY - player.y, 2));
  if (dist >= PlSpeed) {
    player.x += (player.targetX - player.x) / dist * PlSpeed;
    player.y += (player.targetY - player.y) / dist * PlSpeed;
  }
}

function draw() {
  var i, j, k;
  getDrawDiv().style.width = getWindowWidth() + "px";
  getDrawDiv().style.height = getWindowHeight() + "px";
  viewX = player.x + (player.img.width - getWindowWidth()) / 2;
  viewY = player.y + (player.img.height - getWindowHeight()) / 2;
  document.body.style.backgroundPosition = -viewX + "px " + -viewY + "px";
  objDraw(player);
  for (i in tiles) {
    for (j in tiles[i]) {
      for (k in tiles[i][j].trees) {
        objDraw(tiles[i][j].trees[k]);
      }
    }
  }
}
