$('.tab a').on('click', function (e) {
  
  e.preventDefault();
  
  $(this).parent().addClass('active');
  $(this).parent().siblings().removeClass('active');
  
  target = $(this).attr('href');

  $('.tab-content > div').not(target).hide();
  
  $(target).fadeIn(600);
  
});

$('.start-btn').on('click', function (){
  $.ajax({
    url: '/start_train',
    type: 'POST',
    data: '',
    success: function(data){
        console.log('start training\n' + data);
        location.reload();
    }
  });
});

$('.stop-btn').on('click', function (){
  $.ajax({
    url: '/stop_train',
    type: 'POST',
    data: '',
    success: function(data){
        console.log('start training\n' + data);
        location.reload();
    }
  });
});
