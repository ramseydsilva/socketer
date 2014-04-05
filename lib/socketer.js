'use strict';

/**
 * Exports socketer module
 *
 * @module socketer
 */
module.exports = (function () {

    // Patch the xmlhttprequest library that socket.io-client uses to simulate browser
    var originalRequest = require('xmlhttprequest').XMLHttpRequest,
        ioc = require('socket.io-client'),
        request = require('request'),
        jar = request.jar(),
        socketer = {},
        getUrl;

    /**
     * This method constructs the absolute url to your express app,
     * including the protocol, domain, port and the supplied relative
     * root url.
     *
     * @method getUrl
     * @param {Object} app Your express app. If it is not listening, the listen method is called
     * @optional {String} url The relative root url to concatenate
     * @optional {String} protocol The protocol to use. Default is http
     * @return {String} fully constructed url
     */
    socketer.getUrl = getUrl = function(app, url, protocol) {
        var addr = app.server.address();
        if (!addr) addr = app.server.listen().address();
        return (protocol || 'http') + '://' + addr.address + ':' + addr.port + ( url || '');
    };

    /**
     * Takes your express app as an argument, and a callback function
     * that returns a live socket to your express application
     *
     * @method anonSocket
     * @async
     * @param {Object} app Your express app. If it is not listening, the listen method is called
     * @optional {String} logoutUrl Optional logout url. Default is '/logout'
     * @param {Function} callback A callback to run on completion. Supplies anonymous socket
     */
    socketer.anonSocket = function (app, logoutUrl, callback){
        if (!callback) {
            callback = logoutUrl;
            logoutUrl = '/logout';
        }
        var jar = request.jar();
        request.get({jar: jar, url: getUrl(app, logoutUrl)}, function(err, res) {
            var socket = ioc.connect(getUrl(app));
            socket.socket.reconnect(); // Reconnect every time this function is called
            callback(socket);
        });
    };

    /**
     * Takes your express app as an argument, the url to your login page ex '/login'
     * a dictionary with your post credentials and a callback function
     * that returns a live authenticated socket to your express application.
     *
     * @method authSocket
     * @async
     * @param {Object} app Your express app. If it is not listening, the listen method is called
     * @param {Object} credentials Login credentials in the form of a dictionary
     * @optional {String} loginUrl Login url. Default is '/login'
     * @param {Function} callback A callback to run on completion. Supplies authenticated socket
     */
    socketer.authSocket = function(app, credentials, loginUrl, callback) {
        if (!callback) {
            callback = loginUrl;
            loginUrl = '/login';
        }
        require('socket.io-client/node_modules/xmlhttprequest').XMLHttpRequest = function(){
            originalRequest.apply(this, arguments);
            this.setDisableHeaderCheck(true);
            var stdOpen = this.open;
            /*
             * I will patch now open in order to set my cookie from the jar request.
             */
            this.open = function() {
                stdOpen.apply(this, arguments);
                var header = jar.getCookieString(getUrl(app));
                this.setRequestHeader('cookie', header);
            };
        };
        request.post({
            jar: jar,
            url: getUrl(app, loginUrl),
            form: credentials
        }, function (err, res){
            var socket = ioc.connect(getUrl(app));
            socket.socket.reconnect(); // Reconnect every time this function is called
            callback(socket);
        });
    };

    /**
     * Takes in your express app, url, optional logout url  and a callback that returns an anonymous users response.
     *
     * @method anonRequest
     * @async
     * @param {Object} app Your express app. If it is not listening, the listen method is called
     * @param {String} url Relative root path url for the request
     * @optional {String} logoutUrl Logout url. Default is '/logout'
     * @param {Function} callback Supplies callback response form the anonymous get request
     */
    socketer.anonRequest = function(app, url, logoutUrl, callback) {
        if (!callback) {
            callback = logoutUrl;
            logoutUrl = '/logout';
        }
        request.get(getUrl(app, logoutUrl), function(err, res) {
            if (err) callback(err, res);
            request.get(getUrl(app, url), function(err, res) {
                callback(err, res);
            });
        });
    };

    /**
     * Takes in your express app, url, credentials, optional login url and returns an anonymous users response
     *
     * @method authRequest
     * @async
     * @param {Object} app Your express app. If it is not listening, the listen method is called
     * @param {String} url Relative root path url for the request
     * @param {Object} credentials Login credentials in the form of a dictionary
     * @optional {String} loginUrl Logout url. Default is '/login'
     * @param {Function} callback Supplies callback response form the anonymous get request
     */
    socketer.authRequest = function(app, url, credentials, loginUrl, callback) {
        if (!callback) {
            callback = loginUrl;
            loginUrl = '/login';
        }
        request.post({ jar: jar, url: getUrl(app, loginUrl), form: credentials }, function (err, res){
            if (err) callback(err, res);
            request.get({jar: jar, url: getUrl(app, url)}, function(err, res) {
                callback(err, res);
            });
        });
    };

    return socketer;

}());
