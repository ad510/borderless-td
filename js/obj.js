"use strict";

// returns new object with specified properties
function objNew(imgPath, x, y) {
  var ret = {};
  ret.x = x;
  ret.y = y;
  ret.imgPath = imgPath;
  // use div tag instead of img tag so image is not selectable
  // side effect is can no longer set alt attribute, but Ami recommends doing this anyway
  ret.div = document.createElement("div");
  ret.div.style.backgroundImage = "url('" + imgPath + "')";
  ret.div.style.width = imgProp[imgPath].width + "px";
  ret.div.style.height = imgProp[imgPath].height + "px";
  ret.div.style.position = "fixed";
  ret.div.style.display = "none";
  getDrawDiv().appendChild(ret.div);
  return ret;
}

// draw specified object
function objDraw(obj) {
  if (obj.x - imgProp[obj.imgPath].baseX + imgProp[obj.imgPath].width > viewX && obj.x - imgProp[obj.imgPath].baseX < viewX + getWindowWidth()
      && obj.y - imgProp[obj.imgPath].baseY + imgProp[obj.imgPath].height > viewY && obj.y - imgProp[obj.imgPath].baseY < viewY + getWindowHeight()) {
    obj.div.style.left = (obj.x - imgProp[obj.imgPath].baseX - viewX) + "px";
    obj.div.style.top = (obj.y - imgProp[obj.imgPath].baseY - viewY) + "px";
    obj.div.style.zIndex = Math.floor(obj.y);
    obj.div.style.display = "";
  }
  else {
    obj.div.style.display = "none";
  }
}

// stop drawing specified object
function objRemove(obj) {
  getDrawDiv().removeChild(obj.div);
}

// returns distance between 2 objects
function objDist(obj1, obj2) {
  return Math.sqrt(objDistSq(obj1, obj2));
}

// returns square of distance between 2 objects
function objDistSq(obj1, obj2) {
  return Math.pow(obj2.x - obj1.x, 2) + Math.pow(obj2.y - obj1.y, 2);
}

// move array1[index1] from array1 to array2
function arrayMove(array1, index1, array2) {
  array2[array2.length] = array1[index1];
  arrayRemove(array1, index1);
}

// remove array[index] and move later elements forward by 1
// decrement index and continue (in loop) after calling this
function arrayRemove(array, index) {
  for (var i = Number(index); i < array.length - 1; i++) {
    array[i] = array[i + 1];
  }
  array.splice(array.length - 1, 1);
}

// returns div tag that objects are drawn in
function getDrawDiv() {
  return document.getElementById("draw");
}
