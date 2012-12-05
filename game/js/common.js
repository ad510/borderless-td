"use strict";

// Portions copyright (c) 2012 Andrew Downing, Matthew Downing
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Note that this is based on a file my brother and I made last summer specifically for use in games. It is not a file newly made for this project.

// thanks to quirksmode.org/js/events_properties.html
function getMousePos(e) {
  if (!e) var e = window.event;
  if (e.pageX || e.pageY) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
  else if (e.clientX || e.clientY) {
    mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
}

// based on http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
function getWindowWidth() {
  if (typeof(window.innerWidth) == 'number') {
    // Non-IE
    return window.innerWidth;
  }
  else if (document.documentElement && document.documentElement.clientWidth) {
    // IE 6+ in 'standards compliant mode'
    return document.documentElement.clientWidth;
  }
}

// based on http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
function getWindowHeight() {
  if (typeof(window.innerHeight) == 'number') {
    // Non-IE
    return window.innerHeight;
  }
  else if (document.documentElement && document.documentElement.clientHeight) {
    // IE 6+ in 'standards compliant mode'
    return document.documentElement.clientHeight;
  }
}

// based on http://quirksmode.org/js/events_properties.html
function findKey(e) {
  var code;
  if (!e) var e = window.event;
  if (e.keyCode) code = e.keyCode;
  else if (e.which) code = e.which;
  return String.fromCharCode(code);
}
