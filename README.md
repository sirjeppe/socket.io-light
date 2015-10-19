# socket.io-light
Minimal version of socket.io-client suitable for sending text only (binary
compat stripped out).

I wanted a very lightweight client-side library compatible with
socket.io-server/client that easily could be "upgraded" to the full thing if
needed.

Tested with socket.io (server) 1.3.7 on Node.js 4.1.1.

## Features
* on
* emit
* connect

## How to use
Usage should hopefully be the same as with socket.io-client. If you find any
bugs, please report them.

To connect to the same host that the site is currently running on:
```javascript
var sock = io();
// or
var sock = io.connect();
```

To connect to a custom host:
```javascript
var sock = io('http://custom.host:7000');
// or
var sock = io.connect('http://custom.host:7000');
```

To register an event listener:
```javascript
sock.on('message', function(msg) {
    console.log(msg);
});
```

To send a message:
```javascript
sock.emit('message', 'Hello World!');
```

I also added a callback to the connect:
```javascript
// Passing null as URL argument to connect to current host
var sock = io(null, function() {
    // We're connected
});
