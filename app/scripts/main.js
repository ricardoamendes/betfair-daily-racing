// main.js
import m from 'mithril';
import config from 'config';
import socket from './socket';

// Hold events model and view
var events = {
    model: null,
    view: null
};

/**
 * Generate a DOM tree for event runners.
 * @param  {Object} runner Runner name and pricing data
 * @return {HTML}          The DOM tree
 */
var getRunners = (runner) => {
    if (runner){
        return m("td", [
            m("div", runner.runnerName),
            m("div", runner.ex && runner.ex.availableToBack.length && runner.ex.availableToBack[0].price),
            m("div", runner.ex && runner.ex.availableToLay.length && runner.ex.availableToLay[0].price)
        ]);
    }
};

/**
 * Handle subsequent events and tell Mithril to re-render only events with updates.
 * @param  {Object} message A list of horse racing events and prices
 * @return {void}
 */
var onMessageReceive = (message) => {
    // init diff
    m.startComputation();

    // assign latest events
    events.model = JSON.parse(message.data);

    // end diff
    m.endComputation();
};

// Define the events view-model
events.model = [];

// Events view
events.view = function() {
    return m("div", [
            m("table", [
                events.model.map(function(data, index) {
                    return m("tr", [
                        m("td", data.marketStartTime),
                        m("td", data.event.venue),
                        m("td", data.event.name),
                        m("td", data.event.marketName),
                        getRunners(data.runners[0])
                    ]);
                })
            ])
    ]);
};

// Mount the events view into DOM
m.mount(document.body, {
    view: events.view
});

// Create a socket connection to listen continuosly for updates.
socket.init(config.ws.host, config.ws.port, onMessageReceive);
