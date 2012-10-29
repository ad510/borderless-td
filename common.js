// Note that this is a file my brother and I made last summer specifically for use in games. It is not a file newly made for this project.

function getMousePos(e) // thanks to quirksmode.org/js/events_properties.html
{
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) {
		xMouse = e.pageX;
		yMouse = e.pageY;
	}
	else if (e.clientX || e.clientY) {
		xMouse = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		yMouse = (e.clientY + document.body.scrollTop + document.documentElement.scrollTop);
	}
}

function getWindowWidth() // based on http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
{
	if (typeof(window.innerWidth) == 'number')
	{
		// Non-IE
		return window.innerWidth;
	}
	else if (document.documentElement && document.documentElement.clientWidth)
	{
		// IE 6+ in 'standards compliant mode'
		return document.documentElement.clientWidth;
	}
}

function getWindowHeight() // based on http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
{
	if (typeof(window.innerHeight) == 'number')
	{
		// Non-IE
		return window.innerHeight;
	}
	else if (document.documentElement && document.documentElement.clientHeight)
	{
		// IE 6+ in 'standards compliant mode'
		return document.documentElement.clientHeight;
	}
}

// based on http://quirksmode.org/js/events_properties.html
function findKey(e)
{
	var code;
	if (!e) var e = window.event;
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	return String.fromCharCode(code);
}
