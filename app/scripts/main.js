// main.js

import ko from 'knockout';
import komapping from 'knockout.mapping';
import socket from './socket';

// Hold the main model
var eventsModel;

/**
 * Handle received events and bind these with the view model.
 * @param  {Object} message A list of horse racing events and prices
 * @return {void}
 */
var onMessageReceive = (message) => {
    var response = JSON.parse(message.data);

    // refresh the view model
    komapping.fromJS({ events: response }, eventsModel);
};

// Create a Socket connection
socket.init(onMessageReceive);

// Create the view model
eventsModel = komapping.fromJS({ events: [] });

// Create bindings
ko.applyBindings(eventsModel);
