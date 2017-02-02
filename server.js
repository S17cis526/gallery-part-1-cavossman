"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
 
var http = require("http");
var fs = require("fs");
var port = 2300; // 80 is usual

var chess = fs.readFileSync("images/chess.jpg");
var fern = fs.readFileSync("images/fern.jpg");
var stylesheet = fs.readFileSync("gallery.css");

function getImageNames(callback) {
    fs.readdir("images/",(err, files) => {
	if(err)
	{
	    callback(err, undefined);
	}
	else
	{
	    callback(undefined, files);
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
    html += "<title>Gallery</title>";
    html += "<link href='gallery.css' rel='stylesheet' type='text/css'>";
    html += "</head>";
    html += "<body>";
    html += "<h1>Gallery</h1>";
    html += getImageTags(imageNames).join("");
    html += "<h1>Hello.</h1>Time is "+Date.now();
    html += "</body>";
    return html;
}

function serveGallery(req, res) {
    getImageNames(function(err, imageNames) {
	if(err) {
	    console.error(err);
	    res.statusCode=500;
	    res.statusMessage= "Server broke :(";
	    res.end("Server broke :(");
	    return;
	}
	res.setHeader("Content-Type", "text/html");
	res.end(buildGallery(imageNames));
    });
}

function serveImage(filename, req, res) {
    fs.readFile("images"+filename, (err, body) => {
	if(err) {
	    console.error(err);
	    res.statusCode = 404;
	    res.statusMessage = "Resource Not Found";
	    res.end("Yall 404'd - ain't nothin' here");
	    return;
	}
	console.log("User opened "+filename+" at "+Date.now());
	res.setHeader("Content-Type", "image/jpeg");
	res.end(body);
    });
}

var server = http.createServer((req, res) => {
    switch(req.url) {
    case "/gallery.css":
	res.setHeader("Content-Type", "text/css");
	res.end(stylesheet);
	break;
    case "/":
    case "/gallery":
	serveGallery(req, res);
	break;
    default:
	serveImage(req.url, req, res);
    }
});

server.listen(port, () => {
    console.log("Listening on Port "+port);
});
