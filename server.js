const http = require('http');
const fs = require('fs');

function get(name, url){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(url))
		return decodeURIComponent(name[1]);
}

const requestListener = function (req, res) {
	let filename = '';

	let url = req.url.split('?')[0];

	if (url == "/" || url == "") filename = './index.html';
	else filename = '.' + url;

	fs.readFile(filename, 'utf8', function(err, data) {
		if (err) {
			res.writeHead(400, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(err));
			res.end();
		} else {
			res.writeHead(200, { 'Content-Type': get('text', '?' + req.url.split('?')[1]) ? 'text/plain' : '' });
			res.write(data);
			res.end();
		}
	});
}

const server = http.createServer(requestListener);
server.listen(8080);
