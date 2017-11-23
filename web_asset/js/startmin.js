//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    var element = $('ul.nav a').filter(function() {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }
});

$(function() {
    $('#selector').change(function() {
      name = $('#selector').val();
  
      // Destroy the old gallery.
      
      $('#gallery').jGallery().destroy();
  
      $('#gallery').html('');
  
      if(name != 'select a project')
      {
        $.ajax({
          url: '/get_image',
          type: 'POST',
          data: ({name: name}),
          success: function(data){
            
            // Switch to the correct images.
            for(var i = 0 ; i < data.length-1 ; i++){
              if(data[i] != '.DS_Store')
              {
                var path = 'images/' + data[data.length-1] + '/' + name + '/' + data[i];
                //$('#gallery').append('<a href="route/ + Brian' + name + '/1.jpeg"><img src="route/' + name + '/1.jpeg" alt="Photo 1" /></a>');
                $('#gallery').append('<a href="' + path + '"><img src="' + path + '" alt=' + data[i] + '"/></a>');
              }
            } 
            // Re-initialize jGallery.
            $('#gallery').jGallery( {backgroundColor: 'white', textColor: 'red'} );
            window.location = 'upload';
          }
        });
      }
    })
  });

