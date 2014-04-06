socketer
========

Socket.io utility for testing socket.io/express applications. 

## Installation

`npm install --save-dev socketer`

## Usage

This lib provides 5 methods:

1. [anonSocket](anonSocket)
2. [authSocket](authSocket)
3. [anonRequest](anonRequest)
4. [authRequest](authRequest)
5. [getUrl](getUrl)

Comprehensive documentation exists here: http://socketer.ramseydsilva.com/global.html#anonRequest

### [anonSocket](anonSocket)

anonSocket takes your express app as an argument and a callback that returns an anonymous socket that you can
use to poll your server as an anonymous user.

```
var socketer = request('socketer');

socketer.anonSocket(app, function(socket) {

  socket.once('connect', function() {
    console.log('I am connected!');
  });
  
  socket.once('my-event', function() {
  
    console.log('My event is happening');
    socket.disconnect(); // Call this to disconnect after your function to uninterupt further connect events
  });
  
};
```

### [authSocket](authSocket)

authSocket takes your express app as an argument, login credentials in the form of a dict, login url,  and a 
callback that returns a socket that has been authenticated via the login url.

```
var socketer = request('socketer');

socketer.authSocket(app, {'username': 'Ramsey', 'password': 'Ramseypass'}, '/login', function(socket) {

  socket.once('connect', function() {
    console.log('I am connected as Ramsey!');
  });
  
});
```

The login url accepts a post method, and csrf has to be turned off for testing. In your app.js file, you can have something like:

```
if (process.env.NODE_ENV == 'production') {
    app.use(express.csrf());
    app.use(function(req, res, next) {
        res.locals.token = req.csrfToken();
    });
};

// or

if (process.env.NODE_ENV != 'mochaTesting') {
    app.use(express.csrf());
    app.use(function(req, res, next) {
        res.locals.token = req.csrfToken();
    });
};
```

## [anonRequest](anonRequest)

This method attempts a logout before fetching your request, just in case your request module has previously been
configured to save cookies (like we do in ours). You can optionally specify a logout url. The default is '/logout'.
```
socketer.anonRequest(app, album.editUrl, '/alt-logout', function(err, res) {
    res.statusCode.should.be.exactly(403);
});
```

## [authRequest](authRequest)

This method logs a user in. It takes a dict containing the post params to the login page. The default login url is '/login', but you can optionally specify your own.
```
socketer.authRequest(app, album.editUrl, {email: user.email, password: user.profile.passwordString}, function(err, res) { 
    res.statusCode.should.be.exactly(200);
});
```

## [getUrl](getUrl)

This helper method takes in your express app and a root relative path and constructs an absolute url. It also takes an optional protocol such as 'http' or 'ws' etc. The default is 'http'.
```
console.log(socketer.getUrl(app, post.editUrl, 'ws');
// prints ws://127.0.0.1:4000/posts/1234/edit
```

## Tips

1. After every test and before you call the done method, you can choose to disconnect the socket by calling 
`socket.disconnect();`. This ensures uninterupted successive socket reconnects.
2. Instead of using `socket.on(event)`, consider using `socket.once(event)` in your tests. This ensures the event 
listener stops listening if the event occurs in successive tests.


## Dependencies

This library simulates the client socket using [socket.io-client](https://github.com/LearnBoost/socket.io-client) package. Different versions of this package might
differ in its implementation. During the time time of writing this lib, the versions I was using was:

1. express: ~3.5.1
2. socket.io: ~0.9.16
3. socket.io-client: ^0.9.16

## Issues

If you notice any issues with the lib, or any compatibilty issues with the versions you are using, let us
know. If you want to extend this library with more helper functions also do let us know here:
https://github.com/ramseydsilva/socketer/issues

## Credits

This library was inspired by the following gist:
https://gist.github.com/jfromaniello/4087861

[anonSocket]: http://socketer.ramseydsilva.com/global.html#anonSocket
[authSocket]: http://socketer.ramseydsilva.com/global.html#authSocket
[anonRequest]: http://socketer.ramseydsilva.com/global.html#anonRequest
[authRequest]: http://socketer.ramseydsilva.com/global.html#authRequest
[getUrl]: http://socketer.ramseydsilva.com/global.html#getUrl
