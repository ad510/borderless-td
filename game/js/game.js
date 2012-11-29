"use strict";

/*
todo:
change projectile image
resource text & background styling
make new offset monsters when adding new tile
quadratic arrows: y = x - x^2 has y > 0 for 0 < x < 1 and vertex (0.5, 0.25)
sound
game balance (e.g. increase spawn rate over time)
menu (update instructions, submit score, view high scores)
only allow wood cutters to turn into player?
img title tags
pay attention to navigation & color balance
check project requirements
*/

// constants (all lengths in pixels, all times in milliseconds)
var UpdateRate = 50;
var PlayerSpd = 0.09 * UpdateRate; // in pixels per frame
var MonsterSpd = 0.1 * UpdateRate; // in pixels per frame
var ArrowSpd = 0.5; // in pixels per millisecond
var PlayerMaxHealth = 20000;
var CutterMaxHealth = 20000;
var TowerMaxHealth = 20000;
var TileSize = 500;
var TileMinTrees = 2;
var TileMaxTrees = 6;
var TileMinMonsters = 0;
var TileMaxMonsters = 1.1;
var TreeCutTime = 10000;
var TreeWoodRate = 0.001 * UpdateRate;
var CutterCost = 10;
var CutterJump = TileSize;
var TowerCost = 10;
var TowerReload = 2000;
var TowerRange = 500;
var ArrowSplash = MonsterSpd / ArrowSpd / UpdateRate * TowerRange;
var MonsterFollowRate = 5; // in frames (must be integer # of frames)
var MonsterFollowDist = 500;
var MonsterRad = 70;
var NTreeType = 2;

// game state variables
var mouseX, mouseY;
var viewX, viewY;
var time = 0;
var pause = false;
var timeMonster = 0;
var wood = 20;
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
  player = objNew("img/player.png", 0, 0);
  player.health = PlayerMaxHealth;
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
    drops[drops.length] = objNew("img/drop.png", player.x, player.y);
  }*/
}

// update game at fixed time intervals
function update() {
  if (!pause) {
    time += UpdateRate;
    generate();
    simulate();
  }
  draw();
}

// generate new game objects
function generate() {
  var tileX, tileY;
  var nObjs, dir;
  var i, j;
  // check if should make new tiles
  for (i = Math.floor(viewX / TileSize - 0.5); i <= Math.floor((viewX + getWindowWidth()) / TileSize + 0.5); i++) {
    for (j = Math.floor(viewY / TileSize - 0.5); j <= Math.floor((viewY + getWindowHeight()) / TileSize + 0.5); j++) {
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
          tileX = tileRng.row[i].maxX + 1;
          dir = -MonsterSpd;
        }
        monster = objNew((dir > 0) ? "img/monster_r.png" : "img/monster_l.png", (tileX + Math.random()) * TileSize, (i + Math.random()) * TileSize);
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
          tileY = tileRng.col[i].maxY + 1;
          dir = -MonsterSpd;
        }
        monster = objNew((Math.random() < 0.5) ? "img/monster_r.png" : "img/monster_l.png", (i + Math.random()) * TileSize, (tileY + Math.random()) * TileSize);
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
  for (i = tileRng.minX - 1; i <= tileRng.maxX + 1; i++) {
    if (tiles[i] == undefined) continue;
    for (j = tileRng.minY - 1; j <= tileRng.maxY + 1; j++) {
      if (tiles[i][j] == undefined) continue;
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
        if ((time / UpdateRate) % MonsterFollowRate == Math.abs(i + j + k) % MonsterFollowRate) {
          // go towards closest player-owned object if it is close enough
          var cutter = objClosest(tiles[i][j].monsters[k].x, tiles[i][j].monsters[k].y, MonsterFollowDist, "trees", false, function(tree) {return tree.cutter != undefined});
          var tower = objClosest(tiles[i][j].monsters[k].x, tiles[i][j].monsters[k].y, MonsterFollowDist, "towers");
          var followObj = {obj: player, distSq: objDistSq(player, tiles[i][j].monsters[k]), type: "p"};
          if (cutter != undefined && cutter.distSq < followObj.distSq) {
            followObj = cutter;
            followObj.type = "c";
          }
          if (tower != undefined && tower.distSq < followObj.distSq) {
            followObj = tower;
            followObj.type = "t";
          }
          if (followObj.distSq <= MonsterFollowDist * MonsterFollowDist) {
            if (followObj.distSq > MonsterRad * MonsterRad) {
              tiles[i][j].monsters[k].velX = (followObj.obj.x - tiles[i][j].monsters[k].x) / Math.sqrt(followObj.distSq) * MonsterSpd;
              tiles[i][j].monsters[k].velY = (followObj.obj.y - tiles[i][j].monsters[k].y) / Math.sqrt(followObj.distSq) * MonsterSpd;
              objSetImage(tiles[i][j].monsters[k], (tiles[i][j].monsters[k].velX > 0) ? "img/monster_r.png" : "img/monster_l.png");
            }
            else {
              // arrived at object, so attack it
              tiles[i][j].monsters[k].velX = 0;
              tiles[i][j].monsters[k].velY = 0;
              followObj.obj.health -= UpdateRate * MonsterFollowRate;
              if (followObj.obj.health <= 0) {
                // object lost all health, so remove object
                if (followObj.type == "c") {
                  objRemove(followObj.obj.cutter);
                  followObj.obj.cutter = undefined;
                }
                else if (followObj.type == "t") {
                  objRemove(followObj.obj);
                  arrayRemove(tiles[followObj.col][followObj.row].towers, followObj.index);
                }
                else if (followObj.type == "p") {
                  // turn closest wood cutter or arrow tower into the player
                  var cutter2 = objClosest(player.x, player.y, 10000 * TileSize, "trees", false, function(tree) {return tree.cutter != undefined});
                  var tower2 = objClosest(player.x, player.y, 10000 * TileSize, "towers");
                  if (cutter2 != undefined && (tower2 == undefined || cutter2.distSq < tower2.distSq)) {
                    player.x = cutter2.obj.x;
                    player.y = cutter2.obj.y;
                    objRemove(cutter2.obj.cutter);
                    cutter2.obj.cutter = undefined;
                  }
                  else if (tower2 != undefined) {
                    player.x = tower2.obj.x;
                    player.y = tower2.obj.y;
                    objRemove(tower2.obj);
                    arrayRemove(tiles[tower2.col][tower2.row].towers, tower2.index);
                  }
                  else {
                    pause = true;
                    document.getElementById("score").firstChild.nodeValue = Math.floor(time / 1000);
                    document.getElementById("f_score").value = Math.floor(time / 1000);
                    document.getElementById("highscore").style.display = "";
                  }
                  player.health = PlayerMaxHealth;
                  player.targetX = player.x;
                  player.targetY = player.y;
                }
              }
            }
          }
          else if (tiles[i][j].monsters[k].velX == 0 && tiles[i][j].monsters[k].velY == 0) {
            // no target and currently not moving, so move in random direction
            var theta = Math.random() * 2 * Math.PI;
            tiles[i][j].monsters[k].velX = MonsterSpd * Math.cos(theta);
            tiles[i][j].monsters[k].velY = MonsterSpd * Math.sin(theta);
            objSetImage(tiles[i][j].monsters[k], (tiles[i][j].monsters[k].velX > 0) ? "img/monster_r.png" : "img/monster_l.png");
          }
        }
        // move monster
        tiles[i][j].monsters[k].x += tiles[i][j].monsters[k].velX;
        tiles[i][j].monsters[k].y += tiles[i][j].monsters[k].velY;
        col = Math.floor(tiles[i][j].monsters[k].x / TileSize);
        row = Math.floor(tiles[i][j].monsters[k].y / TileSize);
        // delete monster if off map
        if ((Math.abs(tiles[i][j].monsters[k].velX) > Math.abs(tiles[i][j].monsters[k].velY))
            ? (tileRng.row[j] == undefined || col < tileRng.row[j].minX - 1 || col > tileRng.row[j].maxX + 1)
            : (tileRng.col[i] == undefined || row < tileRng.col[i].minY - 1 || row > tileRng.col[i].maxY + 1)) {
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
          var monster = objClosest(arrow.targetX, arrow.targetY, ArrowSplash, "monsters");
          if (monster != undefined) {
            objRemove(monster.obj);
            arrayRemove(tiles[monster.col][monster.row].monsters, monster.index);
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
      tiles[i][j].trees[k] = objNew("img/tree" + Math.floor(Math.random() * NTreeType) + ".png", tileX + Math.random() * TileSize, tileY + Math.random() * TileSize);
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
  if (!pause && wood >= CutterCost && cutterNew(player.x, player.y)) {
    wood -= CutterCost;
  }
}

// make new cutter on tree near specified point
// returns whether cutter was created (it isn't created if no nearby tree)
function cutterNew(x, y) {
  var tree = objClosest(x, y, CutterJump, "trees", true, function(tree) {return tree.cutter == undefined});
  if (tree == undefined) return false;
  tree.obj.cutter = objNew("img/cutter.png", tree.obj.x, tree.obj.y);
  tree.obj.health = CutterMaxHealth; // refers to cutter health, not tree health (tree health stored in cutTime)
  return true;
}

// build tower at player position, if player has enough wood
function towerBuild() {
  if (!pause && wood >= TowerCost) {
    var tile = tiles[Math.floor(player.x / TileSize)][Math.floor(player.y / TileSize)];
    var tower = objNew("img/tower.png", player.x, player.y);
    tower.health = TowerMaxHealth;
    tower.time = time;
    tile.towers[tile.towers.length] = tower;
    wood -= TowerCost;
  }
}

// shoot arrow originating at specified position and aiming at nearby monster
// returns whether arrow was shot (it isn't shot if no monster in range)
function arrowNew(x, y) {
  var monster = objClosest(x, y, TowerRange, "monsters");
  if (monster == undefined) return false;
  var arrow = objNew("img/arrow.png", x, y);
  arrow.startTime = time;
  arrow.startX = x;
  arrow.startY = y;
  arrow.targetX = monster.obj.x;
  arrow.targetY = monster.obj.y;
  var tile = tiles[monster.col][monster.row];
  tile.arrows[tile.arrows.length] = arrow;
  return true;
}(dir > 0) ? "img/monster_r.png" : "img/monster_l.png"

// returns properties of object closest to given position that is within given distance, of given type, and meeting given conditions
// type is string, gen says whether to generate search tile if not generated yet, condition is function
function objClosest(x, y, range, type, gen, condition) {
  var ret, distSq;
  var i, j, k;
  var bestDistSq = range * range;
  for (i = Math.floor((x - range) / TileSize); i <= Math.floor((x + range) / TileSize); i++) {
    if (!gen && tiles[i] == undefined) continue;
    for (j = Math.floor((y - range) / TileSize); j <= Math.floor((y + range) / TileSize); j++) {
      if (!gen && tiles[i][j] == undefined) continue;
      if (gen) tileGen(i, j);
      for (k in tiles[i][j][type]) {
        if (condition == undefined || condition(tiles[i][j][type][k])) {
          distSq = objDistSq(tiles[i][j][type][k], {x: x, y: y});
          if (distSq < bestDistSq) {
            ret = {obj: tiles[i][j][type][k], col: i, row: j, index: Number(k), distSq: distSq};
            bestDistSq = distSq;
          }
        }
      }
    }
  }
  return ret;
}

// returns random integer in specified range
function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
