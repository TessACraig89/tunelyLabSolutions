var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/tunely");

//require Album S1S3 TC
var Album = require('./album');
var Song = require('./song');

//export Album S1S3 TC
module.exports.Album = Album;
module.exports.Song = Song;