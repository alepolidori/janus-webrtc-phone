# SIP Phone WebRTC

This is a [WebRTC](https://webrtc.org) SIP Phone that can be easily integrated into your web application to make audio and video calls.

It uses [Janus-Gateway](https://janus.conf.meetecho.com/) produced by [Meetecho.](https://twitter.com/meetecho)

## How to use

1. clone the repository `"git clone https://github.com/alepolidori/janus-webrtc-phone.git"`
1. run `"npm install"`
1. open `"index.html"` into your web browser

## Functions

1. Initialize Janus stack
1. Register an extension
1. Make an audio/video call
1. Answer a call
1. Hangup a call

## Requirements

Since it is a client demo, it requires a VoIP PBX backend to interact with other extensions. You can easily install one of your own using [NethServer VoIP PBX](http://docs.nethserver.org/en/v7/freepbx.html): follow this [guide.](https://github.com/alepolidori/howto-nethserver-voip-pbx/blob/master/README.md)



## Links

- WebRTC: https://webrtc.org
- Janus-Gateway: https://janus.conf.meetecho.com/
- NethServer VoIP PBX: http://docs.nethserver.org/en/v7/freepbx.html
- NethServer community: https://community.nethserver.org/
- NethServer repo:
  - https://github.com/NethServer/nethserver-freepbx
  - https://github.com/NethServer/freepbx
  - https://github.com/NethServer/janus-gateway
  - https://github.com/NethServer/nethserver-janus
- NethVoice (Enterprise NethServer VoIP PBX): https://nethvoice.it
