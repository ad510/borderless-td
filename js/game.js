"use strict";

/*
todo:
replace temp images
resource text & background styling
make new offset monsters when adding new tile
comments
*/

// constants (all lengths in pixels, all times in milliseconds)
var UpdateRate = 50;
var PlSpeed = 5;
var MoSpeed = 5;
var TileSize = 500;
var TileMinTrees = 2;
var TileMaxTrees = 6;
var TileMinMonsters = 0;
var TileMaxMonsters = 2;
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
  /*if (key == "D") {
    drops[drops.length] = objNew("img/drop.png", "drop", player.x, player.y);
  }*/
}

function buildCutter() {
  var tree, dist;
  var col = Math.floor(player.x / TileSize);
  var row = Math.floor(player.y / TileSize);
  var i, j, k;
  // find tree on nearby tile closest to player
  var bestDist = TileSize * TileSize;
  for (i = col - 1; i <= col + 1; i++) {
    for (j = row - 1; j <= row + 1; j++) {
      tileGen(col, row);
      for (k in tiles[i][j].trees) {
        dist = objDistSq(player, tiles[i][j].trees[k]);
        if (dist < bestDist) {
          tree = tiles[i][j].trees[k];
          bestDist = dist;
        }
      }
    }
  }
  // if nearby tree exists and does not have cutter, create a cutter on the tree
  if (tree != undefined && tree.cutter == undefined) tree.cutter = objNew("img/cutter.png", "cutter", tree.x, tree.y);
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
  var nObjs, dir;
  var i, j, k;
  // check if should make new tiles
  for (i = Math.floor(viewX / TileSize); i <= Math.ceil((viewX + getWindowWidth()) / TileSize); i++) {
    for (j = Math.floor(viewY / TileSize); j <= Math.ceil((viewY + getWindowHeight()) / TileSize); j++) {
      tileGen(i, j);
    }
  }
  // check if should generate new monsters
  if (MoSpeed * (time - timeMonster) >= TileSize) {
    timeMonster += MoSpeed * (time - timeMonster);
    // generate horizontal-moving monsters
    for (i = tileRng.minY; i <= tileRng.maxY; i++) {
      nObjs = randInt(TileMinMonsters, TileMaxMonsters);
      for (j = 0; j < nObjs; j++) {
        var monster;
        if (Math.random() < 0.5) {
          tileX = tileRng.row[i].minX - 1;
          dir = MoSpeed;
        }
        else {
          tileX = tileRng.row[i].maxX;
          dir = -MoSpeed;
        }
        monster = objNew("img/monster.png", "monster", (tileX + Math.random()) * TileSize, (i + Math.random()) * TileSize);
        monster.velX = dir;
        monster.velY = 0;
        tileInit(tileX, i);
        tiles[tileX][i].monsters[tiles[tileX][i].monsters.length] = monster;
      }
    }
    // generate vertical-moving monsters
    for (i = tileRng.minX; i <= tileRng.maxX; i++) {
      nObjs = randInt(TileMinMonsters, TileMaxMonsters);
      for (j = 0; j < nObjs; j++) {
        var monster;
        if (Math.random() < 0.5) {
          tileY = tileRng.col[i].minY - 1;
          dir = MoSpeed;
        }
        else {
          tileY = tileRng.col[i].maxY;
          dir = -MoSpeed;
        }
        monster = objNew("img/monster.png", "monster", (i + Math.random()) * TileSize, (tileY + Math.random()) * TileSize);
        monster.velX = 0;
        monster.velY = dir;
        tileInit(i, tileY);
        tiles[i][tileY].monsters[tiles[i][tileY].monsters.length] = monster;
      }
    }
  }
}

// move game objects
function simulate() {
  var row, col;
  var i, j, k;
  // player
  var dist = objDist(player, {x: player.targetX, y: player.targetY});
  if (dist >= PlSpeed) {
    player.x += (player.targetX - player.x) / dist * PlSpeed;
    player.y += (player.targetY - player.y) / dist * PlSpeed;
  }
  // monsters
  for (i in tiles) {
    for (j in tiles[i]) {
      for (k = 0; k < tiles[i][j].monsters.length; k++) {
        // move monster
        tiles[i][j].monsters[k].x += tiles[i][j].monsters[k].velX;
        tiles[i][j].monsters[k].y += tiles[i][j].monsters[k].velY;
        col = Math.floor(tiles[i][j].monsters[k].x / TileSize);
        row = Math.floor(tiles[i][j].monsters[k].y / TileSize);
        // delete monster if off map
        if ((Math.abs(tiles[i][j].monsters[k].velX) > Math.abs(tiles[i][j].monsters[k].velY))
            ? (col < tileRng.row[j].minX - 1 || col > tileRng.row[j].maxX)
            : (row < tileRng.col[i].minY - 1 || row > tileRng.col[i].maxY)) {
          getDrawDiv().removeChild(tiles[i][j].monsters[k].img);
          arrayRemove(tiles[i][j].monsters, k);
          k--;
          continue;
        }
        // check if monster moved to a different tile
        if (col != i || row != j) {
          tileInit(col, row);
          arrayMove(tiles[i][j].monsters, k, tiles[col][row].monsters);
        }
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
  // draw player
  objDraw(player);
  // draw objects on tiles
  for (i in tiles) {
    for (j in tiles[i]) {
      for (k in tiles[i][j].trees) {
        objDraw(tiles[i][j].trees[k]);
        if (tiles[i][j].trees[k].cutter != undefined) {
          objDraw(tiles[i][j].trees[k].cutter);
        }
      }
      for (k in tiles[i][j].monsters) {
        objDraw(tiles[i][j].monsters[k]);
      }
    }
  }
}

// create new empty tile at specified indices if it has not already been created
function tileInit(i, j) {
  if (tiles[i] == undefined) tiles[i] = [];
  if (tiles[i][j] == undefined) {
    tiles[i][j] = {};
    // add empty object arrays
    // (don't add trees and update tile range until player actually moves there)
    tiles[i][j].trees = [];
    tiles[i][j].monsters = [];
  }
}

// add trees to specified tile and update tile range if this hasn't been done already
function tileGen(i, j) {
  var tileX = i * TileSize;
  var tileY = j * TileSize;
  var nObjs;
  var k;
  tileInit(i, j);
  if (tiles[i][j].trees.length == 0) {
    // add trees to new tile
    nObjs = randInt(TileMinTrees, TileMaxTrees);
    for (k = 0; k < nObjs; k++) {
      tiles[i][j].trees[k] = objNew("img/tree" + Math.floor(Math.random() * NTreeType) + ".png", "tree", tileX + Math.random() * TileSize, tileY + Math.random() * TileSize);
    }
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

// returns random integer in specified range
function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
