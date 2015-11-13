// socket.js

/**
 * W3C WebSocket API client.
 */
export default class Socket {

    /**
     * Initializes client socket connection.
     * @param  {Function} onMessage Handler for messages received
     * @return {void}
     */
    static init(onMessage) {

        if ("WebSocket" in window) {

            // Open web socket
            var ws = new WebSocket('ws://localhost:8001/', 'echo-protocol');

            ws.onopen = () => {
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
