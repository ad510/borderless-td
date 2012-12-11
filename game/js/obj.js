"use strict";

// Copyright (c) 2012 Andrew Downing
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// returns new object with specified properties
function objNew(imgPath, x, y) {
  var ret = {};
  ret.x = x;
  ret.y = y;
  ret.div = document.createElement("div");
  ret.div.style.position = "fixed";
  ret.div.style.display = "none";
  objSetImage(ret, imgPath);
  getDrawDiv().appendChild(ret.div);
  return ret;
}

// set background image of object's div tag
// use div tag instead of img tag so image is not selectable
// side effect is can no longer set alt attribute, but Ami recommends doing this anyway
function objSetImage(obj, imgPath) {
  if (imgPath != obj.imgPath) {
    obj.imgPath = imgPath;
    obj.div.style.backgroundImage = "url('" + imgPath + "')";
    obj.div.style.width = imgProp[imgPath].width + "px";
    obj.div.style.height = imgProp[imgPath].height + "px";
  }
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

// returns object to play either specified ogg or mp3 sound (depending on browser support)
// html5 audio described at http://html5doctor.com/html5-audio-the-state-of-play
function sndNew(path, nCopies) {
  var ret = {};
  ret.next = 0;
  ret.snds = [];
  if (window.Audio) {
    for (var i = 0; i < nCopies; i++) {
      ret.snds[i] = new Audio();
      if (ret.snds[i].canPlayType && ret.snds[i].canPlayType("audio/ogg") != "") {
        ret.snds[i].src = path + ".ogg";
      }
      else if (ret.snds[i].canPlayType && ret.snds[i].canPlayType("audio/mpeg") != "") {
        ret.snds[i].src = path + ".mp3";
      }
    }
  }
  return ret;
}

// play specified sound array object
function sndPlay(snd) {
  if (snd.snds[snd.next] && snd.snds[snd.next].currentSrc) {
    snd.snds[snd.next].play();
    snd.next = (snd.next + 1) % snd.snds.length;
  }
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
