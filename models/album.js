var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//require song model
var Song = require('./song');

//create new schema, AlbumSchema S1S3 TC
  //keys used to define properties and their schema types
  // songs key's value is Song model's schema 
var AlbumSchema = new Schema({
  artistName: String,
  name: String,
  releaseDate: String,
  genres: [ String ],
  songs: [Song.schema]
});

//compile Album schema into Album model S1S3 TC
//each document will be a 'Album' with properties declared in schema
var Album = mongoose.model('Album', AlbumSchema);

//export Album S1S3 TC
module.exports = Album;