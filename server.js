/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
"use strict;"

/* global variables */
var multipart = require('./multipart');
var template = require('./template');
var staticFiles = require('./staticFiles');
var http = require('http');
var url = require('url');
var fs = require('fs');
var port = 2323;

/* load cached files */
var config = JSON.parse(fs.readFileSync('config.json'));
var stylesheet = fs.readFileSync('public/gallery.css');
var script = fs.readFileSync('public/gallery.js');

/* load public directory */
staticFiles.loadDir('public');

/* load tempaltes */
template.loadDir('templates');

/* load template for new uploads. */
var itemTemplate = JSON.parse(fs.readFileSync('./catalog/charzard.json'));

var collection = JSON.parse(fs.readFileSync('collection.json'));

/** @function getImageNames
 * Retrieves the filenames for all images in the
 * /images directory and supplies them to the callback.
 * @param {function} callback - function that takes an
 * error and array of filenames as parameters
 */
function getImageNames(callback) {
  fs.readdir('images/', function(err, fileNames){
    if(err) callback(err, undefined);
    else callback(false, fileNames);
  });
}

/** @function imageNamesToTags
 * Helper function that takes an array of image
 * filenames, and returns an array of HTML img
 * tags build using those names.
 * @param {string[]} filenames - the image filenames
 * @return {string[]} an array of HTML img tags
 */

// ORIGINAL imageNamesToTags
/*function imageNamesToTags(fileNames) {
  return fileNames.map(function(fileName) {
	if (fileName == "details.html"){
		return '';
	}
    return `<img class="thumbnail" src="${fileName}" alt="${fileName}">`;
  });
}*/


// NOTETOSELF:
// Could Improve if I could use individual json files that I make but
// couldn't implement the link to another page from each image in time.

// UPDATED imageNamesToTags
function imageNamesToTags(fileNames) {
  var tags = '';
  for(var i = 0; i < collection.length; i++) {
    tags += `<a href="#"><img class="thumbnail" src="` + collection[i].image +
            `" data-title="` + collection[i].title +
            `" data-desc="`  + collection[i].description +
            `" alt="`        + collection[i].title +
            `" onclick="showImage(` + i + `)"` +
            `  style="cursor:pointer"></a>`;
  }
  return tags;
}


/**
 * @function buildGallery
 * A helper function to build an HTML string
 * of a gallery webpage.
 * @param {string[]} imageTags - the HTML for the individual
 * gallery images.
 */
function buildGallery(imageTags) {
  return template.render('gallery.html', {
    title: config.title,
    imageTags: imageNamesToTags(imageTags) // imageNamesToTags(imageTags).join('') - original
  });
}

/** @function serveGallery
 * A function to serve a HTML page representing a
 * gallery of images.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function serveGallery(req, res) {
  getImageNames(function(err, imageNames){
    if(err) {
      console.error(err);
      res.statusCode = 500;
      res.statusMessage = 'Server error';
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(buildGallery(imageNames));
  });
}

/** @function serveImage
 * A function to serve an image file.
 * @param {string} filename - the filename of the image
 * to serve.
 * @param {http.incomingRequest} - the request object
 * @param {http.serverResponse} - the response object
 */
function serveImage(fileName, req, res) {
  fs.readFile('images/' + decodeURIComponent(fileName), function(err, data){
    if(err) {
      console.error(err);
      res.statusCode = 404;
      res.statusMessage = "Resource not found.";
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'image/*');
    res.end(data);
  });
}

/** @function uploadImage
 * A function to process an http POST request
 * containing an image to add to the gallery.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function uploadImage(req, res) {
  multipart(req, res, function(req, res) {
    // make sure an image was uploaded
    if(!req.body.image.filename) {
      console.error("No file in upload.");
      res.statusCode = 400;
      res.statusMessage = "No file specified.";
      res.end("No file specified.");
      return;
    }
    fs.writeFile('images/' + req.body.image.filename, req.body.image.data, function(err){
      if(err) {
        console.error(err);
        res.statusCode = 500;
        res.statusMessage = "Server Error";
        res.end("Server Error");
        return;
      }

    /* Creates individual json file for each entry. */
	  itemTemplate.title = req.body.title;
	  itemTemplate.image = req.body.image.filename;
	  itemTemplate.description = req.body.description;
	  var data = JSON.stringify(itemTemplate);
	  fs.writeFile('./catalog/' + itemTemplate.title + '.json', data);
      serveGallery(req, res);

      /* Adds each entry to a list (collection) of json objects. */
      collection.push({
          title: req.body.title,
          image: req.body.image.filename,
          description: req.body.description
      });
        fs.writeFile('collection.json', JSON.stringify(collection, null, "\t"));
    });
  });
}

/** @function handleRequest
 * A function to determine what to do with
 * incoming http requests.
 * @param {http.incomingRequest} req - the incoming request object
 * @param {http.serverResponse} res - the response object
 */
function handleRequest(req, res) {
  // at most, the url should have two parts -
  // a resource and a querystring separated by a ?
  var urlParts = url.parse(req.url);

  if(urlParts.query){
    var matches = /title=(.+)($|&)/.exec(urlParts.query);
    if(matches && matches[1]){
      config.title = decodeURIComponent(matches[1]);
      fs.writeFile('config.json', JSON.stringify(config));
    }
  }

  switch(urlParts.pathname) {
    case '/':
    case '/gallery':
      if(req.method == 'GET') {
        serveGallery(req, res);
      } else if(req.method == 'POST') {
        uploadImage(req, res);
      }
      break;
    // case '/gallery.css':
    //   res.setHeader('Content-Type', 'text/css');
    //   res.end(stylesheet);
    //   break;
    // case '/gallery.js':
    //   res.setHeader('Content-Type', 'text/javascript');
    //   res.end(script);
    //   break;
    default:
      if(staticFiles.isCached('public' + req.url)) {
        staticFiles.serveFile('public' + req.url, req, res);
      } else {
        serveImage(req.url, req, res);
      }
  }
}

/* Create and launch the webserver */
var server = http.createServer(handleRequest);
server.listen(port, function(){
  console.log("Server is listening on port ", port);
});
