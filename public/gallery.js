// Javascript for the gallery page

var title = document.getElementById('gallery-title');
title.onclick = function(e) {
  e.preventDefault();
  var form = document.getElementById('gallery-title-edit');
  form.style.display = 'block';
}

var images = document.getElementsByClassName('thumbnail');
function showImage(i) {
    document.getElementById('largeImg').src = images[i].getAttribute("src");
    document.getElementById('imgTitle').innerHTML = "<h2>" + images[i].getAttribute("data-title") + "</h2>";
    document.getElementById('imgDesc').innerHTML = "<p>" + images[i].getAttribute("data-desc") + "</p>";
    showLargeImagePanel();
    unselectAll();
}
function showLargeImagePanel() {
    document.getElementById('display').style.visibility = 'visible';
}
function unselectAll() {
    if(document.selection) document.selection.empty();
    if(window.getSelection) window.getSelection().removeAllRanges();
}
function hideMe(obj) {
    obj.style.visibility = 'hidden';
}
