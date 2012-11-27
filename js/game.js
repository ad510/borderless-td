"use strict";

/*
todo:
replace temp images
resource text & background styling
make new offset monsters when adding new tile
quadratic arrows: y = x - x^2 has y > 0 for 0 < x < 1 and vertex (0.5, 0.25)
sound
*/

// constants (all lengths in pixels, all times in milliseconds)
var UpdateRate = 50;
var PlayerSpd = 0.1 * UpdateRate; // in pixels per frame
var MonsterSpd = 0.1 * UpdateRate; // in pixels per frame
var ArrowSpd = 0.5; // in pixels per millisecond
var TileSize = 500;
var TileMinTrees = 2;
var TileMaxTrees = 6;
var TileMinMonsters = 0;
var TileMaxMonsters = 1.1;
var TreeCutTime = 10000;
var TreeWoodRate = 0.001 * UpdateRate;
var CutterCost = 10;
var TowerCost = 10;
var TowerReload = 2000;
var TowerRange = 500;
var ArrowSplash = MonsterSpd / ArrowSpd / UpdateRate * TowerRange;
var NTreeType = 2;

// game state variables
var mouseX, mouseY;
var viewX, viewY;
var time = 0;
var timeMonster = 0;
var wood = 10;
var tileRng = {
  minX: 100, maxX: -100, minY: 100, maxY: -100,
  row: [], col: []
};

// drawn objects
var player;
var tiles = [];

// close information box
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
  var i, j;
  // check if should make new tiles
  for (i = Math.floor(viewX / TileSize); i <= Math.ceil((viewX + getWindowWidth()) / TileSize); i++) {
    for (j = Math.floor(viewY / TileSize); j <= Math.ceil((viewY + getWindowHeight()) / TileSize); j++) {
      tileGen(i, j);
    }
  }
  // check if should generate new monsters
  if (MonsterSpd * (time - timeMonster) >= TileSize) {
    timeMonster += MonsterSpd * (time - timeMonster);
    // generate horizontal-moving monsters
    for (i = tileRng.minY; i <= tileRng.maxY; i++) {
      nObjs = randInt(TileMinMonsters, TileMaxMonsters);
      for (j = 0; j < nObjs; j++) {
        var monster;
        if (Math.random() < 0.5) {
          tileX = tileRng.row[i].minX - 1;
          dir = MonsterSpd;
        }
        else {
          tileX = tileRng.row[i].maxX;
          dir = -MonsterSpd;
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
          dir = MonsterSpd;
        }
        else {
          tileY = tileRng.col[i].maxY;
          dir = -MonsterSpd;
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
  if (dist >= PlayerSpd) {
    player.x += (player.targetX - player.x) / dist * PlayerSpd;
    player.y += (player.targetY - player.y) / dist * PlayerSpd;
  }
  // don't use for each here because for each always returns index as string, so adding index does concatenation instead
  for (i = tileRng.minX; i <= tileRng.maxX; i++) {
    for (j = tileRng.col[i].minY; j <= tileRng.col[i].maxY; j++) {
      // cutters
      for (k = 0; k < tiles[i][j].trees.length; k++) {
        if (tiles[i][j].trees[k].cutter != undefined) {
          tiles[i][j].trees[k].cutTime += UpdateRate;
          wood += TreeWoodRate;
          if (tiles[i][j].trees[k].cutTime >= TreeCutTime) {
            // finished cutting down tree, jump to next tree
            cutterNew(tiles[i][j].trees[k].x, tiles[i][j].trees[k].y);
            objRemove(tiles[i][j].trees[k].cutter);
            objRemove(tiles[i][j].trees[k]);
            arrayRemove(tiles[i][j].trees, k);
            k--;
            continue;
          }
        }
      }
      // towers
      for (k = 0; k < tiles[i][j].towers.length; k++) {
        if (time >= tiles[i][j].towers[k].time + TowerReload && arrowNew(tiles[i][j].towers[k].x, tiles[i][j].towers[k].y)) {
          tiles[i][j].towers[k].time = time;
        }
      }
      // monsters
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
          objRemove(tiles[i][j].monsters[k]);
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
      // arrows
      for (k = 0; k < tiles[i][j].arrows.length; k++) {
        var arrow = tiles[i][j].arrows[k];
        var progress = (time - arrow.startTime) / objDist({x: arrow.startX, y: arrow.startY}, {x: arrow.targetX, y: arrow.targetY}) * ArrowSpd;
        arrow.x = arrow.startX + (arrow.targetX - arrow.startX) * progress;
        arrow.y = arrow.startY + (arrow.targetY - arrow.startY) * progress;
        if (progress >= 1) {
          // arrow reached ground, find monster hit
          var i2, j2, k2;
          for (i2 = i - 1; i2 <= i + 1; i2++) {
            if (tiles[i2] == undefined) continue;
            for (j2 = j - 1; j2 <= j + 1; j2++) {
              if (tiles[i2][j2] == undefined) continue;
              for (k2 in tiles[i2][j2].monsters) {
                if (objDistSq(arrow, tiles[i2][j2].monsters[k2]) <= ArrowSplash * ArrowSplash) {
                  objRemove(tiles[i2][j2].monsters[k2]);
                  arrayRemove(tiles[i2][j2].monsters, k2);
                  k2 = null;
                  break;
                }
              }
              if (k2 === null) break;
            }
            if (k2 === null) break;
          }
          // delete arrow
          objRemove(arrow);
          arrayRemove(tiles[i][j].arrows, k);
          k--;
          continue;
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
      for (k in tiles[i][j].towers) {
        objDraw(tiles[i][j].towers[k]);
      }
      for (k in tiles[i][j].arrows) {
        objDraw(tiles[i][j].arrows[k]);
      }
      for (k in tiles[i][j].monsters) {
        objDraw(tiles[i][j].monsters[k]);
      }
    }
  }
  // update text
  document.getElementById("wood").firstChild.nodeValue = Math.floor(wood);
}

// create new empty tile at specified indices if it has not already been created
function tileInit(i, j) {
  if (tiles[i] == undefined) tiles[i] = [];
  if (tiles[i][j] == undefined) {
    tiles[i][j] = {};
    tiles[i][j].gen = false;
    // add empty object arrays
    // (don't add trees and update tile range until player actually moves there)
    tiles[i][j].trees = [];
    tiles[i][j].towers = [];
    tiles[i][j].arrows = [];
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
  if (!tiles[i][j].gen) {
    tiles[i][j].gen = true;
    // add trees to new tile
    nObjs = randInt(TileMinTrees, TileMaxTrees);
    for (k = 0; k < nObjs; k++) {
      tiles[i][j].trees[k] = objNew("img/tree" + Math.floor(Math.random() * NTreeType) + ".png", "tree", tileX + Math.random() * TileSize, tileY + Math.random() * TileSize);
      tiles[i][j].trees[k].cutTime = 0;
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

// build cutter near player, if player has enough wood
function cutterBuild() {
  if (wood >= CutterCost && cutterNew(player.x, player.y)) {
    wood -= CutterCost;
  }
}

// make new cutter on tree near specified point
// returns whether cutter was created (it isn't created if no nearby tree)
function cutterNew(x, y) {
  var tree, distSq;
  var col = Math.floor(x / TileSize);
  var row = Math.floor(y / TileSize);
  var i, j, k;
  // find closest tree within TileSize pixels of requested position
  var bestDistSq = TileSize * TileSize;
  for (i = col - 1; i <= col + 1; i++) {
    for (j = row - 1; j <= row + 1; j++) {
      tileGen(i, j);
      for (k in tiles[i][j].trees) {
        if (tiles[i][j].trees[k].cutter == undefined) {
          distSq = objDistSq(tiles[i][j].trees[k], {x: x, y: y});
          if (distSq < bestDistSq) {
            tree = tiles[i][j].trees[k];
            bestDistSq = distSq;
          }
        }
      }
    }
  }
  // if found nearby tree, create a cutter on the tree
  if (tree == undefined) return false;
  tree.cutter = objNew("img/cutter.png", "cutter", tree.x, tree.y);
  return true;
}

// build tower at player position, if player has enough wood
function towerBuild() {
  if (wood >= TowerCost) {
    var tile = tiles[Math.floor(player.x / TileSize)][Math.floor(player.y / TileSize)];
    var tower = objNew("img/tower.png", "tower", player.x, player.y);
    tower.time = time;
    tile.towers[tile.towers.length] = tower;
    wood -= TowerCost;
  }
}

// shoot arrow originating at specified position and aiming at nearby monster
// returns whether arrow was shot (it isn't shot if no monster in range)
function arrowNew(x, y) {
  var col = Math.floor(x / TileSize);
  var row = Math.floor(y / TileSize);
  var distSq, targetX, targetY;
  var bestDistSq = TowerRange * TowerRange;
  var i, j, k;
  var arrow, tile;
  // find closest monster in range to aim at
  for (i = col - 1; i <= col + 1; i++) {
    if (tiles[i] == undefined) continue;
    for (j = row - 1; j <= row + 1; j++) {
      if (tiles[i][j] == undefined) continue;
      for (k in tiles[i][j].monsters) {
        distSq = objDistSq(tiles[i][j].monsters[k], {x: x, y: y});
        if (distSq < bestDistSq) {
          targetX = tiles[i][j].monsters[k].x;
          targetY = tiles[i][j].monsters[k].y;
          bestDistSq = distSq;
        }
      }
    }
  }
  // if found monster in range, shoot arrow at monster
  if (targetX == undefined) return false;
  arrow = objNew("img/arrow.png", "arrow", x, y);
  arrow.startTime = time;
  arrow.startX = x;
  arrow.startY = y;
  arrow.targetX = targetX;
  arrow.targetY = targetY;
  tile = tiles[Math.floor(targetX / TileSize)][Math.floor(targetY / TileSize)];
  tile.arrows[tile.arrows.length] = arrow;
  return true;
}

// returns random integer in specified range
function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}