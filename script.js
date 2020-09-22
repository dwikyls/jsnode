let http = require('http');
let url = require('url');
let qs = require('querystring');
let routes = require('routes')();
let view = require('swig');
let mysql = require('mysql');
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    database: "db_mhs",
    user: "root",
    password: ""
});

routes.addRoute('/', function (req, res) {
    connection.query("SELECT * FROM mhs", function (err, rows, fields) {
        if (err) throw err;

        let html = view.compileFile('./template/index.html')({
            title: "Index Page",
            data: rows
        });

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    });

});

routes.addRoute('/insert', function (req, res) {
    if (req.method.toUpperCase() == "POST") {
        let dataPost = "";

        req.on('data', function (chuncks) {
            dataPost += chuncks;
        })

        req.on('end', function () {
            dataPost = qs.parse(dataPost);
            connection.query(`insert into mhs set ? `, {
                nama: dataPost.nama,
                alamat: dataPost.alamat
            }, function (err, fields) {
                if (err) throw err;

                res.writeHead(302, { "location": "/" });
                res.end();
            });
        })
    } else {
        let html = view.compileFile('./template/form.html')();
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    }
});

routes.addRoute('/update/:id', function (req, res) {
    connection.query('select * from mhs where ?', {
        id: this.params.id
    }, function (err, rows, fields) {
        if (rows.length) {
            let data = rows[0];
            if (req.method.toUpperCase() == "POST") {
                let dataPost = "";

                req.on('data', function (chuncks) {
                    dataPost += chuncks;
                });

                req.on('end', function () {
                    dataPost = qs.parse(dataPost);

                    connection.query("update mhs set ? where ?", [dataPost, { id: data.id }],
                        function (error, result, fields) {
                            if (error) throw error;

                            res.writeHead(302, { "location": "/" });
                            res.end();
                        });
                });
            } else {
                let html = view.compileFile('./template/update.html')({
                    data: data
                });
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(html);
            }
        } else {
            let html = view.compileFile('./template/404.html')();
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(html);
        }
    })
});

routes.addRoute('/delete/:id', function (req, res) {
    connection.query('delete from mhs where ?',
        { id: this.params.id },

        function (err, fields) {
            if (err) throw err;

            res.writeHead(302, { "location": "/" });
            res.end();
        });
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
