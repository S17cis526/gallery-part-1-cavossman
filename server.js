"use strict";

// node server.js - to run server
// localhost:2300/   - In browser to go to website.


/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */

var http = require("http");
var url = require('url');
var fs = require("fs");
var port = 1758; // 80 is usual
var defaultConfig = {
  title: "Gallery"
};

var config = JSON.parse(fs.readFileSync('config.json') || defaultConfig);
var stylesheet = fs.readFileSync("gallery.css");

var imageNames = ['ace.jpg', 'bubble.jpg', 'chess.jpg', 'fern.jpg', 'mobile.jpg'];

function getImageNames(callback) {
  fs.readdir("images/", function(err, fileNames){
  	if(err)
  	{
  	    callback(err, undefined);
  	}
  	else
  	{
  	    callback(undefined, fileNames);
  	}
  });
}

function getImageTags(files) {
  return files.map(function(filename) {
	return "<img src='"+filename+"' alt='"+filename+"'>";
  });
}

function buildGallery(imageNames) {
  var html = "<!doctype html>";
  html += "<head>";
  html += "<title>" + config.title + "</title>";
  html += "<link href='gallery.css' rel='stylesheet' type='text/css'>";
  html += "</head>";
  html += "<body>";
  html += "<h1>" + config.title + "</h1>";
	html += '<form action = "">';
	html += '	<input type="text" name ="title">';
	html += '	<input type ="submit" value ="Change Gallery Title">';
	html += '</form>';
  html += imageNamesToTags(imageNames).join('');
  html += '<form action="" method="POST" enctype="multipart/form-data">'
  html += ' <input type="file" name="image">'
  html += ' <input type="submit" value="Upload Image">'
  html += '</form>'
  html += "<h1>Hello.</h1>Time is: " + Date.now();
  html += "</body>";
  return html;
}

function serveGallery(req, res) {
  getImageNames(function(err, imageNames) {
	if(err) {
    console.error(err);
    res.statusCode=500;
    res.statusMessage= "RIP";
    res.end("RIP");
    return;
	}
	res.setHeader("Content-Type", "text/html");
	res.end(buildGallery(imageNames));
    });
}

function serveImage(filename, req, res) {
  fs.readFile("images"+filename, function(err, body){
  	if(err) {
      console.error(err);
      res.statusCode = 404;
      res.statusMessage = "Resource Not Found";
      res.end("404");
      return;
  	}
  	console.log("User opened " + filename + " at "+ Date.now());
  	res.setHeader("Content-Type", "image/jpeg");
  	res.end(body);
  });
}

function uploadImage(req, res) {
  var body = '';
  req.on('error', function(){
    res.statusCode = 500;
    res.end();
  });
  req.on('data', function(data){
    body += data;
  });
  red.on('end', function() {
    fs.writeFile('filename', body, function(err){
      if(err){
        console.log(err);
        res.statusCode = 500;
        res.end();
        return;
      }
      serverGallery(req, res);
    })
  });
}



var server = http.createServer((req, res) => {
	// at most, the url should have two parts -
	// a resource and a querystring seperated by a ?

	/* REGEX */

  var urlParts = url.parse(req.url);

  // Test REGEX for JS at scriptular.com
	if(urlParts.query){
		var matches = /title=(.+)($|&)/.exec(urlParts.query);
    if(matches && matches[1]) {
      config.title = decodeURIComponent(matches[1]);
      fs.writeFile('config.json', JSON.stringify(config));  //save the title in a file so when we restart the server it stays put.
    }
  }

	/* END REGEX */
    switch(urlParts.pathname) {
      case "/gallery.css":
	      res.setHeader("Content-Type", "text/css");
	      res.end(stylesheet);
    	break;
      case "/":
      case "/gallery":
      if (){
        serveGallery(req, res);
      }
      else {
        uploadImage(req, res); //unifinished
      }
	    break;
      default:
	      serveImage(req.url, req, res);
    }
});

server.listen(port, () => {
    console.log("Listening on Port "+port);
});
