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

Since it is a client demo, it requires a VoIP PBX backend to interact with other extensions. You can easily install one of your own using [NethServer VoIP PBX](http://docs.nethserver.org/en/v7/freepbx.html). Simply run:

```console
$ git clone https://github.com/alepolidori/vagrant-files.git
$ cd vagrant-files/nethserver-freepbx-14.0.3.6
$ vagrant up
```

to have a VirtualBox machine installed with [Vagrant.](https://www.vagrantup.com/)
Once the machine is running you have 6 PJSIP extensions already configured and ready to use:

- 200
- 201
- 202
- 203
- 204
- 205

All the extensions have the same default secret: `Nethesis,1234.`

The IP address of the virtual machine is `192.168.11.22.`

If you want to install [NethServer VoIP PBX](http://docs.nethserver.org/en/v7/freepbx.html) yourself, you can also follow this 6-steps [guide](https://github.com/alepolidori/nethserver-voip-pbx-guide/).


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