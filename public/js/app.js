/* CLIENT-SIDE JS
 *
 * You may edit this file as you see fit.  Try to separate different components
 * into functions and objects as needed.
 *
 */

/* document ready */
//use ajax $.get to get /api/albums S1S2 TC 
// on success render each album for albums S1S1
$(document).ready(function() {
  console.log('app.js loaded!');
  $.get('/api/albums').success(function (albums) {
    albums.forEach(function(album) {
      renderAlbum(album);
    });
  });


  $('#album-form form').on('submit', function(e) {
    e.preventDefault();
    var formData = $(this).serialize();
    console.log('formData', formData);
    $.post('/api/albums', formData, function(album) {
      console.log('album after POST', album);
      renderAlbum(album);  //render the server's response
    });
    $(this).trigger("reset");
  });


  $('#albums').on('click', '.add-song', function(e) {
    var id= $(this).parents('.album').data('album-id');
    console.log('id',id);
    $('#songModal').data('album-id', id);
    $('#songModal').modal();
  });

  $('#saveSong').on('click', handleNewSongSubmit);

  $('#albums').on('click', '.delete-album', handleDeleteAlbumClick);

  $('#albums').on('click', '.edit-album', handleEditAlbumClick);

  $('#albums').on('click', '.put-album', handleSaveChangesClick);

  $('#albums').on('click', '.edit-songs', handleEditSongsClick);

  $('#editSongsModal').on('click', '.delete-song', handleDeleteSongClick);

  $('#editSongsModal').on('submit', 'form', handleUpdateSong);
});

/* End document ready */





function handleUpdateSong(e) {
  e.preventDefault();
  // get the values from the item on the modal
  var albumId = $(this).attr('id');
  var trackNumber = $(this).find('.song-trackNumber').val();
  var name = $(this).find('.song-name').val();
  var songId = $(this).find('.delete-song').attr('data-song-id');
  var url = '/api/albums/' + albumId + '/songs/' + songId;
  console.log('PUT ', url, name, trackNumber);
  $.ajax({
    method: 'PUT',
    url: url,
    data: { trackNumber: trackNumber, name: name },
    success: function (data) {
      updateSongsList(albumId);
    }
  });
}

function handleEditSongsClick(e) {
  e.preventDefault();
  var albumId = $(this).parents('.album').data('album-id');
  // let's get the songs for this album
  $.get('/api/albums/' + albumId + '/songs').success(function(songs) {
    var formHtml = generateEditSongsModalHtml(songs, albumId);
    $('#editSongsModalBody').html(formHtml);
    $('#editSongsModal').modal('show');
  });
}

// takes an array of songs and generates an EDIT form for them
// we want to have both the albumId and songId available
function generateEditSongsModalHtml(songs, albumId) {
  var html = '';
  songs.forEach(function(song) {
    html += '<form class="form-inline" id="' + albumId  + '"' +
            '  <div class="form-group">' +
            '    <input type="text" class="form-control song-trackNumber" value="' + song.trackNumber + '">' +
            '  </div>'+
            '  <div class="form-group">' +
            '    <input type="text" class="form-control song-name" value="' + song.name + '">' +
            '  </div>'+
            '  <div class="form-group">' +
            '    <button class="btn btn-danger delete-song" data-song-id="' + song._id + '">x</button>' +
            '  </div>'+
            '  <div class="form-group">' +
            '    <button type="submit" class="btn btn-success save-song" data-song-id="' + song._id + '">save</span></button>' +
            '  </div>'+
            '</form>';
  });

  return html;
}

function handleDeleteSongClick(e) {
  e.preventDefault();
  var songId = $(this).data('song-id');
  var albumId = $(this).closest('form').attr('id');
  var $thisSong = $(this);
  var requestUrl = ('/api/albums/' + albumId + '/songs/' + songId);
  console.log('DELETE ', requestUrl);
  $.ajax({
    method: 'DELETE',
    url: requestUrl,
    success: function(data) {
      $thisSong.closest('form').remove();
      updateSongsList(albumId);
    }
  });
}

// get the songs again (now that one is onge) and then we'll fix the <li> on the package
function updateSongsList(albumId) {
  $.get('/api/albums/' + albumId + '/songs').success(function(someAlbums) {
    console.log('replacement albums', someAlbums);
    // build a new li
    var replacementLi = buildSongsHtml(someAlbums);
    // now replace the <li> with the songs on it.
    var $originalLi = $('[data-album-id=' + albumId + '] .songs-list');
    $($originalLi).replaceWith(replacementLi);
  });
}

// accepts an album id (mongo id) and return the row in which that album exists
function getAlbumRowById(id) {
  return $('[data-album-id=' + id + ']');
}

function handleEditAlbumClick(e) {
  var albumId = $(this).parents('.album').data('album-id');
  var $albumRow = getAlbumRowById(albumId);

  console.log('attempt to edit id', albumId);

  // replace edit button with save button
  $(this).parent().find('.btn').hide();
  $(this).parent().find('.default-hidden').show();

  // replace current spans with inputs
  var albumName = $albumRow.find('span.album-name').text();
  $albumRow.find('span.album-name').html('<input class="edit-album-name" value="' + albumName + '"></input>');

  var artistName = $albumRow.find('span.artist-name').text();
  $albumRow.find('span.artist-name').html('<input class="edit-artist-name" value="' + artistName + '"></input>');

  var releaseDate = $albumRow.find('span.album-release-date').text();
  $albumRow.find('span.album-release-date').html('<input class="edit-album-release-date" value="' + releaseDate + '"></input>');
}

function handleSaveChangesClick(e) {
  var albumId = $(this).parents('.album').data('album-id');
  var $albumRow = getAlbumRowById(albumId);

  var data = {
    name: $albumRow.find('.edit-album-name').val(),
    artistName: $albumRow.find('.edit-artist-name').val(),
    releaseDate: $albumRow.find('.edit-album-release-date').val()
  };

  $.ajax({
    method: 'PUT',
    url: '/api/albums/' + albumId,
    data: data,
    success: function(data) {
      console.log(data);
      $albumRow.replaceWith(generateAlbumHtml(data));
    }
  });
}



function handleDeleteAlbumClick(e) {
  var albumId = $(this).parents('.album').data('album-id');
  console.log('someone wants to delete album id=' + albumId );
  $.ajax({
    method: 'DELETE',
    url: ('/api/albums/' + albumId),
    success: function() {
      console.log("He's dead Jim");
      $('[data-album-id='+ albumId + ']').remove();
    }
  });
}

// handles the modal fields and POSTing the form to the server
function handleNewSongSubmit(e) {
  var albumId = $('#songModal').data('album-id');
  var songName = $('#songName').val();
  var trackNumber = $('#trackNumber').val();

  var formData = {
    name: songName,
    trackNumber: trackNumber
  };

  var postUrl = '/api/albums/' + albumId + '/songs';
  console.log('posting to ', postUrl, ' with data ', formData);

  $.post(postUrl, formData)
    .success(function(song) {
      console.log('song', song);

      // re-get full album and render on page
      $.get('/api/albums/' + albumId).success(function(album) {
        //remove old entry
        $('[data-album-id='+ albumId + ']').remove();
        // render a replacement
        renderAlbum(album);
      });

      //clear form
      $('#songName').val('');
      $('#trackNumber').val('');
      $('#songModal').modal('hide');

    });
}



function buildSongsHtml(songs) {
  var songText = "    &ndash; ";
  songs.forEach(function(song) {
    songText = songText + "(" + song.trackNumber + ") " + song.name + " &ndash; ";
  });
  var songsHtml  =
   "                      <li class='list-group-item songs-list'>" +
   "                        <h4 class='inline-header'>Songs:</h4>" +
   "                         <span>" + songText + "</span>" +
   "                      </li>";
  return songsHtml;
}

// generate just the html for an Album row
function generateAlbumHtml(album) {
  var albumHtml =
  "        <!-- one album -->" +
  "        <div class='row album' data-album-id='" + album._id + "'>" +
  "          <div class='col-md-10 col-md-offset-1'>" +
  "            <div class='panel panel-default'>" +
  "              <div class='panel-body'>" +
  "              <!-- begin album internal row -->" +
  "                <div class='row'>" +
  "                  <div class='col-md-3 col-xs-12 thumbnail album-art'>" +
  "                     <img src='" + "http://placehold.it/400x400'" +  " alt='album image'>" +
  "                  </div>" +
  "                  <div class='col-md-9 col-xs-12'>" +
  "                    <ul class='list-group'>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Album Name:</h4>" +
  "                        <span class='album-name'>" + album.name + "</span>" +
  "                      </li>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Artist Name:</h4>" +
  "                        <span class='artist-name'>" + album.artistName + "</span>" +
  "                      </li>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Released date:</h4>" +
  "                        <span class='album-release-date'>" + album.releaseDate + "</span>" +
  "                      </li>" +

  buildSongsHtml(album.songs) +

  "                    </ul>" +
  "                  </div>" +
  "                </div>" +
  "                <!-- end of album internal row -->" +

  "              </div>" + // end of panel-body

  "              <div class='panel-footer'>" +
  "                <button class='btn btn-primary add-song'>Add Song</button>" +
  "                <button class='btn btn-info edit-album'>Edit Album</button>" +
  "                <button class='btn btn-info edit-songs'>Edit Songs</button>" +
  "                <button class='btn btn-danger delete-album'>Delete Album</button>" +
  "                <button class='btn btn-success put-album default-hidden'>Save Changes</button>" +
  "              </div>" +

  "            </div>" +
  "          </div>" +
  "          <!-- end one album -->";
  return albumHtml;
 }

// this function takes a single album and renders it to the page
function renderAlbum(album) {
  var html = generateAlbumHtml(album);
  console.log('rendering album:', album);

  $('#albums').prepend(html);
}