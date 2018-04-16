# SIP Phone WebRTC with Janus Gateway

This is a simple demo of a WebRTC SIP Phone that can be easy integrate into the browser.

It uses [Janus-Gateway](https://janus.conf.meetecho.com/) produced by Meetecho.

## How to use

1. Clone the repository
1. Launch ```yarn install```
1. It is ready to be integrated into your WebApp

## Functions

This demo shows how to:

1. initialize Janus stack
1. register an extension
1. make a call
1. answer a call
1. hangup a call

## Dependency

Since it is a client demo, it requires a VoIP PBX backend to interact with other extensions. To make it simple to test the technology into your browser, you can install and configure your private NethServer VoIP PBX easily following this [guide](https://github.com/alepolidori/nethserver-voip-pbx-guide/) (only 6 steps).

Otherwise you can use any private or cloud PBX opportunely configured.
