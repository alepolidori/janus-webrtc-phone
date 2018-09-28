$(function () {

  $(document).on('registered', function (ev) {
    $('#login-btn, #server-address, #name, #exten, #password').attr('disabled','disabled');
    $('#logout-btn,#call-to,#call-btn').removeAttr('disabled');
    $('#call-to').focus();
  });

  $(document).on('unregistered', function (ev) {
    $('#login-btn, #server-address, #name, #exten, #password').removeAttr('disabled');
    $('#logout-btn,#call-to,#call-btn').attr('disabled','disabled');
  });

  $(document).on('calling', function (ev) {
    $('#hangup-btn').removeAttr('disabled');
    $('#call-btn,#call-to').attr('disabled','disabled');
  });

  $(document).on('incomingcall', function (ev) {
    $('#hangup-btn,#answer-btn').removeAttr('disabled');
    $('#call-btn,#call-to').attr('disabled','disabled');
  });

  $(document).on('callaccepted', function (ev) {
    $('#hangup-btn').removeAttr('disabled');
    $('#call-btn,#call-to,#answer-btn').attr('disabled','disabled');
  });

  $(document).on('hangup', function (ev) {
    $('#hangup-btn,#answer-btn').attr('disabled','disabled');
    $('#call-btn,#call-to').removeAttr('disabled');
  });

  $('#login-btn').click(function () {
    webrtcPhone.initAndLogin({
      server: $('#server-address').val(),
      name: $('#name').val(),
      exten: $('#exten').val(),
      password: $('#password').val(),
      audioId: 'remote-stream-audio',
      localVideoId: 'local-stream-video',
      remoteVideoId: 'remote-stream-video'
    });
  });

  $('#logout-btn').click(function () {
    webrtcPhone.hangup();
    webrtcPhone.logout();
  });

  $('#hangup-btn').click(function () {
    webrtcPhone.hangup();
  });

  $('#answer-btn').click(function () {
    webrtcPhone.answer();
  });

  $('#call-audio-video-btn').click(function () {
    var to = $('#call-to').val();
    webrtcPhone.call(to);
  });
});