$('.training-btn').on('click', function (){
  $.ajax({
    url: '/train',
    type: 'POST',
    data: '',
    success: function(data){
        location.reload();
    },
    
  });
});


