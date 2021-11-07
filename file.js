var Request;

(function() {
	if (window.XMLHttpRequest) {
		Request = new XMLHttpRequest();
	}
	else if (window.ActiveXObject) {
		try {
			Request = new ActiveXObject("Microsoft.XMLHTTP");
		}	
		catch (CatchException) {
			Request = new ActiveXObject("Msxml2.XMLHTTP");
		}
	}
 
	if (!Request)  {
		alert("Невозможно создать XMLHttpRequest");
	}
})()

function SendRequest(method, args, path, handler) {
	if (!Request) {
		return;
	}
	
	Request.onreadystatechange = function() {
		if (Request.readyState == 4)  {
			handler(Request);
		}
	}
	
	if (method.toLowerCase() == "get" && args.length > 0)
		path += "?" + args;
	
	Request.open(method, path, false);
	
	if (method.toLowerCase() == "post") {
		Request.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
		Request.send(args);
	}
	else {
		Request.send(null);
	}
}

function SaveFile(filename, text) {
	console.save(filename, text);
}

function _ReadFile(filename, container, text) {
	var Handler = function(Request) {
		container.innerHtml = Request.response;
	}
	
	SendRequest("GET",text ? "text=true" : "",filename,Handler);
}

const readFile = function(filename, text=true) {
	const data = new Text();

	_ReadFile(filename, data, text);

	while (!data.innerHtml) {};

	return data.innerHtml;
}