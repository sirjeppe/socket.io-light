'use strict';
(function(win) {
    if (typeof win.WebSocket === 'undefined') {
        throw 'The browser does not seem to support web sockets';
    }
    if (typeof win.io !== 'undefined') {
        throw 'window.io already defined';
    }
    function encodeAsString(obj) {
        var str = '';
        str += obj.type;
        if (null != obj.data) {
            str += JSON.stringify(obj.data);
        }
        return str;
    }
    function decodeString(str) {
        var p = {};
        try {
            p = JSON.parse(str);
        } catch (err) {
            console.log(err);
        }
        return p;
    }
    win.io = function(url, callback) {
        return win.io.connect(url, callback);
    };
    var io = win.io;
    io.socket = null;
    io.eventListeners = [];
    io.on = function(eventName, callback) {
        io.eventListeners.push({
            'evtName': eventName,
            'callback': callback
        });
    };
    io.eventReceiver = function(evt) {
        for (var i = 0; i < io.eventListeners.length; i++) {
            if (evt && evt.data && typeof evt.data.shift != 'undefined') {
                if (io.eventListeners[i].evtName == evt.data[0]) {
                    io.eventListeners[i].callback(evt.data[1]);
                }
            }
        }
    };
    io.eventDispatcher = function(evt) {
        io.eventReceiver(decodeString(evt.data));
    };
    io.emit = function(eventName, data) {
        var packet = {
            type: 2,
            data: [
                eventName,
                data
            ]
        };
        var msg = '4' + data[0];
        if (io.socket.readyState == io.socket.OPEN) {
            io.socket.send(encodeAsString(packet));
        }
    };
    io.connect = function(url, callback) {
        url = typeof url === 'string' ? url : location.protocol + '//' + location.host + '/socket.io';
        var URLParser = document.createElement('a');
        URLParser.href = url;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', URLParser.protocol + '//' + URLParser.host + URLParser.pathname + '/?EIO=3&transport=polling&t=' + (new Date()).getTime() + '-0', true);
        xhr.responseType = 'arraybuffer';
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var ba = new Uint8Array(xhr.response);
                var oString = '';
                var o = {};
                // Skip some bytes until we have a '{'
                var i = 0;
                while (String.fromCharCode(ba[i]) != '{' && i < ba.length) {
                    i++
                }
                while (i < ba.length) {
                    oString += String.fromCharCode(ba[i]);
                    i++;
                }
                o = JSON.parse(oString);
                chat.sid = o.sid;
                io.socket = new WebSocket('ws://' + URLParser.host + URLParser.pathname + '/?EIO=3&transport=websocket&sid=' + chat.sid);
                io.socket.onopen = function() {
                    // Send some magic upgrade command
                    io.socket.send('5');
                    io.socket.onmessage = io.eventDispatcher;
                    if (typeof callback === 'function') {
                        setTimeout(callback, 0);
                    }
                };
            }
        };
        xhr.send();
        return io;
    };
})(window);
