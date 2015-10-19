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
    }
    win.io = function(url, callback) {
        return win.io.connect(url, callback);
    };
    var w = win.io;
    w.socket = null;
    w.eventListeners = [];
    w.on = function(eventName, callback) {
        w.eventListeners.push(
            {
                'evtName': eventName,
                'callback': callback
            }
        );
    };
    w.eventReceiver = function(evt) {
        for (var i = 0; i < w.eventListeners.length; i++) {
            if (evt && evt.data && typeof evt.data.shift != 'undefined') {
                if (w.eventListeners[i].evtName == evt.data[0]) {
                    w.eventListeners[i].callback(evt.data[1]);
                }
            }
        }
    };
    w.eventDispatcher = function(evt) {
        w.eventReceiver(decodeString(evt.data));
    };
    w.emit = function(eventName, data) {
        var packet = {
            type: 2,
            data: [
                eventName,
                data
            ]
        };
        var msg = '4' + data[0];
        if (w.socket.readyState == w.socket.OPEN) {
            w.socket.send(encodeAsString(packet));
        }
    };
    w.connect = function(url, callback) {
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
                w.socket = new WebSocket('ws://' + URLParser.host + '/socket.io/?EIO=3&transport=websocket&sid=' + chat.sid);
                w.socket.onopen = function() {
                    // Send some magic upgrade command
                    w.socket.send('5');
                    w.socket.onmessage = w.eventDispatcher;
                    if (typeof callback === 'function') {
                        setTimeout(callback, 0);
                    }
                };
            }
        };
        xhr.send();
        return w;
    };
})(window);
