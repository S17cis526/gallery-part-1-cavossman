"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */

var http = require('http');
var fs = require('fs');
var port = 2300;  // 80 is standard port for http

function serveImage(filename, req, res) {
  var body = fs.readFile('images/' + filename, function(err, body) {
    if(err) {
      console.error(err); // adds error to error log
      res.statusCode = 500;
      res.statusMessage = "Server error";
      res.end("Silly me!"); // can add a special html page with res.body();
      return;
    }
    res.setHeader("Content-Type", "image/jpg");
    res.end(body);
    return;
  });
}

var server = http.createServer(function(req, res) {
  // req - request
  // res - response
  switch(req.url) {
    case "/chess":
    case "/chess/":
    case "/chess.jpg":
    case "/chess.jpg/":
      serveImage('chess.jpg', req, res);
      break;
    case "/fern":
    case "/fern/":
    case "/fern.jpg":
    case "/fern.jpg/":
      serveImage('fern.jpg', req, res);
      break;
    case "/bubble":
    case "/bubble/":
    case "/bubble.jpg":
    case "/bubble.jpg/":
      serveImage('bubble.jpg', req, res);
      break;
    case "/ace":
      break;
    case "mobile":
      break;
    default:
      res.statusCode = 404;
      res.statusMessage = "Not found";
      res.end();
  }
});

server.listen(port, function(){
  console.log("Listening on port: " + port)
});
