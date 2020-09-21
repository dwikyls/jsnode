let http = require('http');
let url = require('url');
let qs = require('querystring');
let routes = require('routes')();

routes.addRoute('/', function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end('okoc');
});

http.createServer(function (req, res) {
    let path = url.parse(req.url).pathname;
    let match = routes.match(path);

    if (match) {
        match.fn(req, res);
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end(`Page not Found!`);
    }
}).listen(8888);

console.log(`Server is running...`);
