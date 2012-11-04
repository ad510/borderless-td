"use strict";

// try to use div instead:
/*
function objNew(x, y, imgPath, imgAlt) {
  var ret = {};
  var tempImg = document.createElement("img");
  tempImg.src = imgPath;
  tempImg.onLoad = function() {
    // set width & height here
  }
  ret.x = x;
  ret.y = y;
  ret.width = tempImg.width;
  ret.height = tempImg.height;
  alert(ret.width + " " + ret.height);
  ret.div = document.createElement("div"); // use div tag instead of img so image is not selectable
  ret.div.style.backgroundImage = "url('" + imgPath + "')";
  ret.div.style.position = "fixed";
  if (ret.width > 0 && ret.height > 0) {
    ret.div.style.width = ret.width + "px"; // get width & height from temporary image object
    ret.div.style.height = ret.height + "px";
  }
  else {
    ret.div.appendChild(document.createTextNode(imgAlt)); // set alternate text if image not loaded
  }
  document.getElementById("draw").appendChild(ret.div);
  return ret;
}
*/

function objNew(imgPath, imgAlt, x, y) {
  var ret = {};
  ret.x = x;
  ret.y = y;
  ret.img = document.createElement("img");
  ret.img.src = imgPath;
  ret.img.alt = imgAlt;
  ret.img.style.position = "fixed";
  getDrawDiv().appendChild(ret.img);
  return ret;
}

function objDraw(obj) {
  var imgPath = obj.img.src.substring(obj.img.src.lastIndexOf("/") + 1);
  if (obj.x - imgProp[imgPath].baseX + obj.img.width > viewX && obj.x - imgProp[imgPath].baseX < viewX + getWindowWidth()
      && obj.y - imgProp[imgPath].baseY + obj.img.height > viewY && obj.y - imgProp[imgPath].baseY < viewY + getWindowHeight()) {
    obj.img.style.left = (obj.x - imgProp[imgPath].baseX - viewX) + "px";
    obj.img.style.top = (obj.y - imgProp[imgPath].baseY - viewY) + "px";
    obj.img.style.zIndex = Math.floor(obj.y);
    obj.img.style.display = "";
  }
  else {
    obj.img.style.display = "none";
  }
}

function objDrawFixed(obj) {
  obj.img.style.left = obj.x + "px";
  obj.img.style.top = obj.y + "px";
  obj.img.style.zIndex = Math.floor(viewY + getWindowHeight() * 2);
}

function getDrawDiv() {
  return document.getElementById("draw");
}