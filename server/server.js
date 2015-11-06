'use strict';

// Imports handlers and BF interfaces
var Connection = require('./scripts/connection');
var HorseRacing = require('./scripts/horseracing');

// Retrieves command line args
var args = process.argv.slice(2);

// Creates API connection handler and pass app key and session token
var connection = new Connection(args[0], args[1]);

// Creates the Horse Racing API interface
var horseRacing = new HorseRacing(connection);

// Print daily events
var responseHandler = (response) => {
  for (let i = 0; i < response.result.length; i++) {
    console.log('#############', response.result[i].runners);
  }
};

// Request daily events
horseRacing.getDailyHorseRacingEvents(responseHandler);
