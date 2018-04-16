$(function () {

  $('#init-btn').click(function () {
    webrtcPhone.init({
      server: $('#server-address').val(),
      name: $('#name').val(),
      exten: $('#exten').val(),
      password: $('#password').val(),
      audioId: 'remote-stream-audio',
      localVideoId: 'local-stream-video',
      remoteVideoId: 'remote-stream-video'
    });
  });

  $('#login-btn').click(function () {
    webrtcPhone.login();
  });

  $('#call-btn').click(function () {
    var to = $('#call-to').val();
    webrtcPhone.call(to);
  });

  $('#answer-btn').click(function () {
    webrtcPhone.answer();
  });

  $('#hangup-btn').click(function () {
    webrtcPhone.hangup();
  });
});