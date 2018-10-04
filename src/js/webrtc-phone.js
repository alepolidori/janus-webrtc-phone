var webrtcPhone = (function () {

  var server;
  var janusUrl;
  var name;
  var password;
  var exten;
  var audioId;
  var localVideoId;
  var remoteVideoId;
  var janus;
  var sipcall;
  var incoming;
  var currentJsep;
  var localStream;
  var remoteStreamAudio;
  var remoteStreamVideo;
  var counterpartNum;
  var started = false;
  var registered = false;
  var supportedDevices = {};
  var ringing = new Audio('sounds/ringing.mp3');
  var calling = new Audio('sounds/calling.mp3');
  ringing.loop = true;
  calling.loop = true;

  var getSupportedDevices = function (origCallback) {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      // Firefox 38+ seems having support of enumerateDevicesx
      navigator.enumerateDevices = function (callback) {
        navigator.mediaDevices.enumerateDevices().then(callback);
      };
    }

    var MediaDevices = [];
    var isHTTPs = location.protocol === 'https:';
    var canEnumerate = false;

    if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
      canEnumerate = true;
    } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
      canEnumerate = true;
    }

    var hasMicrophone = false;
    var hasSpeakers = false;
    var hasWebcam = false;

    var isMicrophoneAlreadyCaptured = false;
    var isWebcamAlreadyCaptured = false;

    function checkDeviceSupport(callback) {
      if (!canEnumerate) {
        return;
      }

      if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
        navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
      }

      if (!navigator.enumerateDevices && navigator.enumerateDevices) {
        navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
      }

      if (!navigator.enumerateDevices) {
        if (callback) {
          callback();
        }
        return;
      }

      MediaDevices = [];
      navigator.enumerateDevices(function (devices) {
        devices.forEach(function (_device) {
          var device = {};
          for (var d in _device) {
            device[d] = _device[d];
          }

          if (device.kind === 'audio') {
            device.kind = 'audioinput';
          }

          if (device.kind === 'video') {
            device.kind = 'videoinput';
          }

          var skip;
          MediaDevices.forEach(function (d) {
            if (d.id === device.id && d.kind === device.kind) {
              skip = true;
            }
          });

          if (skip) {
            return;
          }

          if (!device.deviceId) {
            device.deviceId = device.id;
          }

          if (!device.id) {
            device.id = device.deviceId;
          }

          if (!device.label) {
            device.label = 'Please invoke getUserMedia once.';
            if (!isHTTPs) {
              device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
            }
          } else {
            if (device.kind === 'videoinput' && !isWebcamAlreadyCaptured) {
              isWebcamAlreadyCaptured = true;
            }

            if (device.kind === 'audioinput' && !isMicrophoneAlreadyCaptured) {
              isMicrophoneAlreadyCaptured = true;
            }
          }

          if (device.kind === 'audioinput') {
            hasMicrophone = true;
          }

          if (device.kind === 'audiooutput') {
            hasSpeakers = true;
          }

          if (device.kind === 'videoinput') {
            hasWebcam = true;
          }

          // there is no 'videoouput' in the spec.
          MediaDevices.push(device);
        });

        if (callback) {
          callback();
        }
      });
    }

    // check for microphone/camera support!
    checkDeviceSupport(function () {
      supportedDevices = {
        audio: hasMicrophone,
        audioCap: isMicrophoneAlreadyCaptured,
        video: adapter.browserDetails.browser === 'chrome' ? hasWebcam : false,
        videoCap: adapter.browserDetails.browser === 'chrome' ? isWebcamAlreadyCaptured : false
      };
      Janus.log(supportedDevices);
      origCallback();
    });
  };

  function initAndLogin(data) {
    server = data.server;
    janusUrl = 'https://' + server + '/janus';
    name = data.name;
    exten = data.exten;
    password = data.password;
    audioId = data.audioId;
    localVideoId = data.localVideoId;
    remoteVideoId = data.remoteVideoId;
    localStream = $('#' + localVideoId).get(0);
    remoteStreamAudio = $('#' + audioId).get(0);
    remoteStreamVideo = $('#' + remoteVideoId).get(0);

    if (sipcall) {
      login();
      return;
    }
    Janus.init({
      debug: "all",
      callback: function () {
        if (started) {
          return;
        }
        started = true;
        if (!Janus.isWebrtcSupported()) {
          console.error("No WebRTC support... ");
          return;
        }
        // Create session
        janus = new Janus({
          server: janusUrl,
          success: function () {
            janus.attach({
              plugin: "janus.plugin.sip",
              success: function (pluginHandle) {
                sipcall = pluginHandle;
                Janus.log("Plugin attached! (" + sipcall.getPlugin() + ", id=" + sipcall.getId() + ")");
                getSupportedDevices(function () {
                  login();
                });
              },
              error: function (error) {
                Janus.error("  -- Error attaching plugin...", error);
              },
              onmessage: function (msg, jsep) {
                Janus.debug(" ::: Got a message :::");
                Janus.debug(JSON.stringify(msg));
                // Any error?
                var error = msg["error"];
                if (error != null && error != undefined) {
                  if (!registered) {
                    Janus.log("User is not registered");
                  } else {
                    // Reset status
                    sipcall.hangup();
                  }
                  return;
                }
                var result = msg["result"];
                if (result !== null && result !== undefined && result["event"] !== undefined && result["event"] !== null) {
                  // get event
                  var event = result["event"];

                  //switch event
                  switch (event) {
                    case 'registration_failed':
                      Janus.error("Registration failed: " + result["code"] + " " + result["reason"]);
                      return;
                      break;

                    case 'registered':
                      Janus.log("Successfully registered as " + result["username"] + "!");
                      if (!registered) {
                        registered = true;
                        $(document).trigger('registered');
                      }
                      break;

                    case 'unregistered':
                      Janus.log("Successfully unregistered as " + result["username"] + "!");
                      if (registered) {
                        registered = false;
                        $(document).trigger('unregistered');
                      }
                      break;

                    case 'calling':
                      Janus.log("Waiting for the peer to answer...");
                      $(document).trigger('calling');
                      break;

                    case 'incomingcall':
                      counterpartNum = msg.result.username.split('@')[0].split(':')[1];
                      incoming = true;
                      ringing.play();
                      Janus.log("Incoming call from " + result["username"] + "!");
                      currentJsep = jsep;
                      $(document).trigger('incomingcall', counterpartNum);
                      break;

                    case 'progress':
                      Janus.log("There's early media from " + result["username"] + ", wairing for the call!");
                      if (jsep !== null && jsep !== undefined) {
                        handleRemote(jsep);
                      }
                      break;

                    case 'accepted':
                      calling.pause();
                      ringing.pause();
                      Janus.log(result["username"] + " accepted the call!");
                      if (jsep !== null && jsep !== undefined) {
                        handleRemote(jsep);
                      }
                      $(document).trigger('callaccepted');
                      break;

                    case 'hangup':
                      incoming = null;
                      calling.pause();
                      ringing.pause();
                      Janus.log("Call hung up (" + result["code"] + " " + result["reason"] + ")!");
                      sipcall.hangup();
                      $(document).trigger('hangup');
                      break;

                    default:
                      break;
                  }
                }
              },
              onlocalstream: function (stream) {
                Janus.debug(" ::: Got a local stream :::");
                Janus.debug(JSON.stringify(stream));

                Janus.attachMediaStream(localStream, stream);

                /* IS VIDEO ENABLED ? */
                var videoTracks = stream.getVideoTracks();
                /* */
              },
              onremotestream: function (stream) {
                Janus.debug(" ::: Got a remote stream :::");
                Janus.debug(JSON.stringify(stream));

                // retrieve stream track
                var audioTracks = stream.getAudioTracks();
                var videoTracks = stream.getVideoTracks();

                Janus.attachMediaStream(remoteStreamAudio, new MediaStream(audioTracks));
                Janus.attachMediaStream(remoteStreamVideo, new MediaStream(videoTracks));
              },
              oncleanup: function () {
                Janus.log(" ::: Got a cleanup notification :::");
              }
            });
          },
          error: function (error) {
            started = false;
            registered = false;
            Janus.error(error);
            console.error("Janus error: " + error);
            reject();
          },
          destroyed: function () {
            started = false;
            registered = false;
            reject();
          }
        });
      }
    });
  }

  function login() {
    if (sipcall) {
      var register = {
        username: 'sip:' + exten + '@127.0.0.1',
        display_name: name,
        secret: password,
        proxy: 'sip:127.0.0.1:5060',
        sips: false,
        request: 'register'
      };
      sipcall.send({
        'message': register
      });
    }
  }

  function logout() {
    if (sipcall) {
      var unregister = {
        request: 'unregister'
      };
      sipcall.send({
        'message': unregister
      });
    }
  }

  function call(to, video) {
    calling.play();
    var sipUri = 'sip:' + to + '@127.0.0.1';
    getSupportedDevices(function () {
      Janus.log("This is a SIP call");
      sipcall.createOffer({
        media: {
          audioSend: true,
          audioRecv: true,
          videoSend: video,
          videoRecv: video
        },
        success: function (jsep) {
          Janus.debug("Got SDP!");
          Janus.debug(jsep);
          var body = {
            request: "call",
            uri: sipUri
          };
          sipcall.send({
            "message": body,
            "jsep": jsep
          });
          counterpartNum = to;
        },
        error: function (error) {
          Janus.error("WebRTC error...", error);
        }
      });
    });
  }

  function handleRemote(jsep) {
    sipcall.handleRemoteJsep({
      jsep: jsep,
      error: function () {
        var hangup = {
          "request": "hangup"
        };
        sipcall.send({
          "message": hangup
        });
        sipcall.hangup();
      }
    });
  };

  function answer() {
    incoming = null;
    getSupportedDevices(function () {
      sipcall.createAnswer({
        jsep: currentJsep,
        media: {
          audio: true,
          video: true
        },
        success: function (jsep) {
          Janus.debug("Got SDP! audio=" + true + ", video=" + true);
          Janus.debug(jsep);
          var body = {
            request: "accept"
          };
          sipcall.send({
            "message": body,
            "jsep": jsep
          });
        },
        error: function (error) {
          Janus.error("WebRTC error:", error);
          var body = {
            "request": "decline",
            "code": 480
          };
          sipcall.send({
            "message": body
          });
        }
      });
    });
  }

  function hangup(e) {
    if (incoming) {
      decline();
      return;
    }
    var hangup = {
      "request": "hangup"
    };
    sipcall.send({
      "message": hangup
    });
    sipcall.hangup();
  }

  function decline() {
    incoming = null;
    var body = {
      "request": "decline"
    };
    sipcall.send({
      "message": body
    });
  };

  function getCounterpartNum() {
    return counterpartNum;
  };

  return {
    call: call,
    login: login,
    logout: logout,
    answer: answer,
    hangup: hangup,
    initAndLogin: initAndLogin,
    getCounterpartNum: getCounterpartNum
  };

})();