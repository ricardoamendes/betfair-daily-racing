// socket.js

/**
 * W3C WebSocket API client.
 */
export default class Socket {

    /**
     * Initializes client socket connection.
     * @param  {String} host The host name
     * @param  {String} port The port number
     * @param  {Function} onMessage Handler for messages received
     * @return {void}
     */
    static init(host, port, onMessage) {

        if ("WebSocket" in window) {

            // Open web socket
            var ws = new WebSocket(`ws://${host}:${port}/`, 'echo-protocol');

            ws.onopen = () => {
                // websocket is opened.
                console.debug("Connection is opened...");
            };

            ws.onclose = () => {
                // websocket is closed.
                console.debug("Connection is closed...");
            };

            ws.onmessage = onMessage;
        } else {
            // The browser doesn't support WebSocket
            alert("WebSocket NOT supported by your Browser!");
        }
    }
}
