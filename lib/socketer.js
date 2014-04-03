'use strict';

var ioc = require('socket.io-client'),
    request = require('request');

// jar to store your auth cookies
var jar = request.jar();
// Patch the xmlhttprequest library that socket.io-client uses to simulate browser
var originalRequest = require('xmlhttprequest').XMLHttpRequest;
var socket

/** Takes your express app as an argument, and a callback function
 * that returns a live socket to your express application
 */
var getAnonSocket = function (app, callback){
    var addr = app.server.address();
    if (!addr) addr = app.server.listen().address();
    request.get({jar: jar, url: 'http://' + addr.address + '/logout'}, function(err, res) {
        var url = 'ws://' + addr.address + ':' + addr.port;
        var socket = ioc.connect(url);
        socket.socket.reconnect(); // Reconnect every time this function is called
        callback(socket);
    });
};
module.exports.anonSocket = getAnonSocket;

/** Takes your express app as an argument, the url to your login page ex '/login'
 * a dictionary with your post credentials and a callback function
 * that returns a live authenticated socket to your express application.
 */
var getAuthSocket = function(app, credentials, loginUrl, next) {
    var server = app.server;
    var addr = server.address();
    if (!addr) addr = server.listen().address();
    var url = 'http://' + addr.address + ':' + addr.port;

    require(app.get('rootDir') + '/node_modules/socket.io-client/node_modules/xmlhttprequest').XMLHttpRequest = function(){
        originalRequest.apply(this, arguments);
        this.setDisableHeaderCheck(true);
        var stdOpen = this.open;
        /*
         * I will patch now open in order to set my cookie from the jar request.
         */
        this.open = function() {
            stdOpen.apply(this, arguments);
            var header = jar.getCookieString(url);
            this.setRequestHeader('cookie', header);
        };
    };
    request.post({
        jar: jar,
        url: url + loginUrl,
        form: credentials
    }, function (err, res){
        next(ioc.connect(url));
    });
};
module.exports.authSocket = getAuthSocket;
