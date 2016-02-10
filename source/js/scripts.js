$(document).ready(function() {

  $('.icon-wrapper').click(function() {
    var tab_id = $(this).attr('data-tab');

    $('.icon-wrapper').removeClass('current');
    $('.tab-content').removeClass('current');

    $(this).addClass('current');
    $("#" + tab_id).addClass('current');
  });

});
