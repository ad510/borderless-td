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
  if (obj.x + obj.img.width > viewX && obj.x < viewX + getWindowWidth()
      && obj.y + obj.img.height > viewY && obj.y < viewY + getWindowHeight()) {
    obj.img.style.left = (obj.x - viewX) + "px";
    obj.img.style.top = (obj.y - viewY) + "px";
    obj.img.style.zIndex = Math.floor(obj.y);
    obj.img.style.display = "";
  }
  else {
    obj.img.style.display = "none";
  }
}

function getDrawDiv() {
  return document.getElementById("draw");
}
