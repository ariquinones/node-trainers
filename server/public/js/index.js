var editTrainerProfileBtn = $('#editTrainerProfileBtn');
editTrainerProfileBtn.on('click', function() {
  console.log('click')
  var updateFormInputs = $('.updateForm');
  Array.prototype.forEach.call(updateFormInputs, function(input) {
      input.style.display = 'block';
  });
  var nonFormElements = $('.nonUpdateForm');
  Array.prototype.forEach.call(nonFormElements, function(input) {
      input.style.display = 'none';
  });
});

$('#addTrainerPoints').on('click', function(e) {
  e.preventDefault();
  var pointsToAdd = parseInt($('#pointsToAdd').val());
  var points = parseInt($('input[name="points"]').val());
  $('input[name="points"]').val(points + pointsToAdd);
  var cashPoints = ((points + pointsToAdd)/100);
  $('input[name="cashPoints"]').val(cashPoints);
  $("#addTrainerPoints").unbind('click').click();
});

$('#redeemTrainerPoints').on('click', function(e) {
  e.preventDefault();
  var pointsToRedeem = parseInt($('#pointsToRedeem').val());
  var points = parseInt($('input[name="points"]').val());
  $('input[name="points"]').val(points - pointsToRedeem);
  var cashPoints = ((points - pointsToRedeem)/100);
  $('input[name="cashPoints"]').val(cashPoints);
  $("#redeemTrainerPoints").unbind('click').click();
});

$('#searchTrainersInput').on('keydown', function(e) {
  if(e.keyCode == 13) {
      console.log('search')
      var searchTerm = $('#searchTrainersInput').val();
      var root = $(location).attr('hostname');
      var protocol = $(location).attr('protocol');
      var url = protocol + "//"+root + ":3000/trainer/searchpromo/" + searchTerm;
      $(location).attr('href',url);
  }
});

var phoneNumbers = $('.phoneNumber');
Array.prototype.forEach.call(phoneNumbers, function(input) {
    $(input).text(function(i, text) {
        text = text.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
        return text;
    });
});

var admin = $('#adminRole').html();
if (admin == 'false') {
  $('.admin').css('display', 'none');
}