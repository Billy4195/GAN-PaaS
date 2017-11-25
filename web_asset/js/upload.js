$('.upload-btn').on('click', function (){
  $('#upload-input').click();
  $('.progress-bar').text('0%');
  $('.progress-bar').width('0%');
});

$('#upload-input').on('change', function(){

var files = $(this).get(0).files;

if (files.length > 0){
  // create a FormData object which will be sent as the data payload in the
  // AJAX request
  var formData = new FormData();

  // loop through all the selected files and add them to the formData object
  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    // add the files to formData object for the data payload
    formData.append('uploads[]', file, file.name);
  }
  formData.append('path', name)
  $.ajax({
    url: '/upload',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    success: function(data){
        console.log('upload successful!\n' + data);
        location.reload();
    },
    xhr: function() {
      // create an XMLHttpRequest
      var xhr = new XMLHttpRequest();

      // listen to the 'progress' event
      xhr.upload.addEventListener('progress', function(evt) {

        if (evt.lengthComputable) {
          // calculate the percentage of upload completed
          var percentComplete = evt.loaded / evt.total;
          percentComplete = parseInt(percentComplete * 100);

          // update the Bootstrap progress bar with the new percentage
          $('.progress-bar').text(percentComplete + '%');
          $('.progress-bar').width(percentComplete + '%');

          // once the upload reaches 100%, set the progress bar text to done
          if (percentComplete === 100) {
            $('.progress-bar').html('Done');
          }

        }

      }, false);
      return xhr;
    }
  });

}
});



$(function() {
      name = $('#selector').val();
      // Destroy the old gallery.
  
      if(name != 'select a project')
      {
        $.ajax({
          url: '/get_image',
          type: 'POST',
          data: ({name: name}),
          success: function(data){
            // Switch to the correct images.
            for(var i = 0 ; i < data.length-1 ; i++){
              
              var path = 'images/' + data[data.length-1] + '/' + name + '/train/' + data[i];
              //$('#gallery').append('<a href="route/ + Brian' + name + '/1.jpeg"><img src="route/' + name + '/1.jpeg" alt="Photo 1" /></a>');
              $('#gallery').append('<a href="' + path + '"><img src="' + path + '" alt=' + data[i] + '"/></a>');
            } 
            // Re-initialize jGallery.
            $('#gallery').jGallery( {backgroundColor: 'white', textColor: 'red'} );
          }
        });
      }
    })

