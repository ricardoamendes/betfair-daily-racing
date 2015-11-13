'use strict';

// Load modules
import _ from 'lodash';
import socket from './scripts/socket';
import connection from './scripts/betfair/connection';
import horseracing from './scripts/betfair/horseracing';

// Polling interval for sending data to clients
const INTERVAL = 30000;

// Holds in memory the most recent event and pricing data
var events = [];

// Retrieves command line args
var args = process.argv.slice(2);

/**
 * Requests horse racing data every 5 seconds.
 *
 * @return {void}
 */
var pollHorseRacingData = () => {

    // Holds events consumed until gathering all pricing data
    var handledEvents = [];

    // Counts successfull BF API pricing requests
    var responsesReceived = 0;

    /**
     * Adds market prices to the original event object. Once all events were consumed
     * send data to active clients.
     *
     * @param  {Number} eventCount Event count
     * @param  {Object} event      Event data
     * @param  {Object} response   BF API response containing event pricing data
     * @return {void}
     */
    var handleEventMarketPrices = (eventCount, event, response) => {

        // Merge event runners and prices objects
        let pricedEvent = _.merge(event, response);

        // Increment counter
        responsesReceived += 1;

        // Add to final list
        handledEvents.push(pricedEvent);

        // If it's last message received, cache most recent event data
        if (responsesReceived === eventCount) {

            // Cache events
            events = _.sortBy(handledEvents, 'marketStartTime');

            // Reset
            handledEvents = [];
            responsesReceived = 0;
        }
    };


    /**
     * Retrieve a list of events and for each request price data.
     *
     * @param  {Object} response    BF API response containing events.
     * @return {void}
     */
    var handleDailyEvents = (response) => {

        for (let i = 0, len = response.result.length, event, handler; i < len; i++) {

            // Cache current event
            event = response.result[i];

            // Build request handler
            handler = handleEventMarketPrices.bind(this, len, event);

            // Request event market prices
            horseracing.getMarketPrices(event.marketId, handler);
        }

    };

    // Kick off horse racing events and prices polling
    setInterval(() => horseracing.getDailyEvents(handleDailyEvents), INTERVAL);
};

/**
 * Every 5 seconds, sends to active clients the most recent events and prices.
 *
 * @param  {Object} connection Socket connection instance
 * @return {void}
 */
var clientRequestHandler = (connection) => {

    (function send() {

        connection.send(JSON.stringify(events));

        setTimeout(send, INTERVAL);

    })(); // send data immediately to client
};

// Creates a socket to listen for incoming client requests and send the latest data
socket.init(clientRequestHandler);

// Creates API connection handler and pass app key and session token
connection.init(args[0], args[1]);

// Creates the Horse Racing API interface
horseracing.init(connection);

// Start polling Betfair horse racing events and prices
pollHorseRacingData();
