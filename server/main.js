'use strict';

// Load modules
import _ from 'lodash';
import config from 'config';
import socket from './scripts/socket';
import connection from './scripts/betfair/connection';
import session from './scripts/betfair/session';
import horseracing from './scripts/betfair/horseracing';

// Holds the most recent event and pricing data
var events = [];

// Retrieves command line args
var args = process.argv.slice(2);

/**
 * Requests horse racing data every {INTERVAL} seconds.
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

        if (response.result) {

            response.result.map((event, index, events) => {

                // Build request handler
                let handler = handleEventMarketPrices.bind(this, events.length, event);

                // Request event market prices
                horseracing.getMarketPrices(event.marketId, handler);

            });
        }
    };

    // Kick off polling
    setInterval(() => horseracing.getDailyEvents(handleDailyEvents), config.pollInterval);
};

/**
 * Send active clients the most recent event and price data.
 *
 * @param  {Object} connection Socket connection instance
 * @return {void}
 */
var clientRequestHandler = (connection) => {

    (function send() {

        connection.send(JSON.stringify(events));

        setTimeout(send, config.pollInterval);

    })(); // send data immediately to client
};

// Initialize a socket to listen for incoming client requests and send the latest data
socket.init(config.origin, clientRequestHandler);

// Initialize Betfair connection handler and pass app key and session token
connection.init(args[0]);

// Initialize Betfair session
session.init(connection, args[1], args[2]);

// Initialize the Horse Racing API interface
horseracing.init(connection);

// Start polling Betfair horse racing events and prices
pollHorseRacingData();
