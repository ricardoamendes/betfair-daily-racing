// socket.js

var WebSocketServer = require('websocket').server;
var http = require('http');

/**
 * Web Socket node server implementation.
 */
export default class Socket {

    /**
     * Initializes server socket.
     *
     * @param  {String}   origin    Origin name for security purposes
     * @param  {Function} onRequest Handle the first client request
     * @return {void}
     */
    static init(origin, onRequest) {

        this.origin = origin;

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

        if (origin.includes(this.origin)) {
            return true;
        }
    }
}
