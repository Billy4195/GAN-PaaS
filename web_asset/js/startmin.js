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

$('.btn-primary').on('click', function (){
    window.location = 'addProject';
});

$(function() {
    $('#sources').change(function() {
      name = $('#sources').val();
      console.log(name);
      console.log('hello');
      // Destroy the old gallery.
      
      $('#gallery').jGallery().destroy();
  
      $('#gallery').html('');
  
      if(name != 'Select a project')
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

  $(".custom-select").each(function() {
    var classes = $(this).attr("class"),
        id      = $(this).attr("id"),
        name    = $(this).attr("name");
    var template =  '<div class="' + classes + '">';
        template += '<span class="custom-select-trigger">' + $(this).attr("placeholder") + '</span>';
        template += '<div class="custom-options">';
        $(this).find("option").each(function() {
          template += '<span class="custom-option ' + $(this).attr("class") + '" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</span>';
        });
    template += '</div></div>';
    
    $(this).wrap('<div class="custom-select-wrapper"></div>');
    $(this).hide();
    $(this).after(template);
  });
  $(".custom-option:first-of-type").hover(function() {
    $(this).parents(".custom-options").addClass("option-hover");
  }, function() {
    $(this).parents(".custom-options").removeClass("option-hover");
  });
  $(".custom-select-trigger").on("click", function() {
    $('html').one('click',function() {
      $(".custom-select").removeClass("opened");
    });
    $(this).parents(".custom-select").toggleClass("opened");
    event.stopPropagation();
  });
  $(".custom-option").on("click", function() {
    
    $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
    $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
    $(this).addClass("selection");
    $(this).parents(".custom-select").removeClass("opened");
    $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());

    name = $('#sources').val();
    console.log(name);
    console.log('hello');

    $('#gallery').html('');

    if(name != 'Select a project')
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
          window.location = 'upload';
        }
      });
    }
    
  });