socketer
========

Socket.io utility for testing socket.io/node applications. 

## Usage

This lib provides two methods:
1. anonSocket
1. authSocket

## anonSocket

anonSocket takes your express app as an argument and a callback that returns an anonymous socket that you can
use to poll your server.

```
var socketer = request('socketer');

socketer.anonSocket(app, function(socket) {
  socket.on('connect', function() {
    console.log('I am connected!');
  });
  socket.on('my-event', function() {
    console.log('My event is happening');
  });
};
```

## authSocket

```
var socketer = request('socketer');

socketer.authSocket(app, {'username': 'Ramsey', 'password': 'Ramseypass'}, '/login', function(socket) {
  socket.on('connect', function() {
    console.log('I am connected as Ramsey!');
  });
});

## Requirements

It's key to note what versions of express, socket.io, socket.io-client you use so you can
effectively use this library. During the time of writing this app, the versions where the following:
1. express: ~3.5.1
1. socket.io: ~0.9.16
1. socket.io-client: ^0.9.16

## Issues

If you notice any issues with the lib, or any compatibilty issues with the versions you are using, let us
know. If you want to extend this library with more helper functions also do let us know here:
https://github.com/ramseydsilva/socketer/issues

## Credits

This library was inspired by the following gist:
https://gist.github.com/jfromaniello/4087861
