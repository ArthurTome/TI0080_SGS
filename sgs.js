var http = require('http');
var url = require('url');
var fs = require('fs');

http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var filename = "./html" + q.pathname;
  console.log(filename);

  // Se não ouver caminho, atribui a pagina inicial
  if (filename == "./html/"){
    filename = filename + "index.html";
  }
  console.log(filename);

  // Se o caminho não corresponder atribui erro
  fs.readFile(filename, function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    } 
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}).listen(8080);