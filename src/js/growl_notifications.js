function displayGrowl(message) {
  $('.growl-notice').fadeIn().html(message);
    setTimeout(function(){ 
      $('.growl-notice').fadeOut();
    }, 4000);
  }