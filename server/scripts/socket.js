// socket.js

var WebSocketServer = require('websocket').server;
var http = require('http');

/**
 * Web Socket node server implementation.
 */
export default class Socket {

    static init(onRequest) {

        // Initializes server and web socket connection
        this.ws = new WebSocketServer({
            httpServer: http.createServer().listen(8001),
            autoAcceptConnections: false
        });

        // Listens when a client connects for the first time
        this.ws.on('request', (request) => {

            // Make sure to accept requests from an allowed origin
            if (!this.originIsAllowed(request.origin)) {
                request.reject();
                return;
            }

            // Initiate a connection request
            let connection = request.accept('echo-protocol', request.origin);

            // Execute callback
            onRequest(connection);
        });
    }

    /**
     * Verify the connection's origin and decide whether or not to accept it.
     * @param  {String} origin The origin with host and port
     * @return {Boolean} True if valid connection
     */
    static originIsAllowed(origin) {
        console.log('Origin ' + origin);
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }
}
