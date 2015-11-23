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
 * @param  {Array} runners Runner names and pricing data
 * @return {Array[HTML]}          The DOM tree
 */
var renderFavourites = (runners) => {

    // Hold final markup
    var renderedFavourites = [];

    // Limit up to 3 favorites
    runners = runners.slice(0, 3);

    // Sort runners by lowest price
    runners.sort((runner1, runner2) => {
        var price1 = runner1.ex && runner1.ex.availableToBack.length && runner1.ex.availableToBack[0].price,
            price2 = runner2.ex && runner2.ex.availableToBack.length && runner2.ex.availableToBack[0].price;

        return price1 > price2 ? 1 : price1 < price2 ? -1 : 0;
    });

    // Push runner markup
    runners.map((runner) => {
        if (runner) {
            renderedFavourites.push(m('div', {
                class: 'events__table__row__cell events__table__row__cell__odds'
            }, [
                m('div', {
                    class: 'events__table__row__cell__odds__back'
                }, runner.ex && runner.ex.availableToBack.length && runner.ex.availableToBack[0].price),
                m('div', {
                    class: 'events__table__row__cell__odds__lay'
                }, runner.ex && runner.ex.availableToLay.length && runner.ex.availableToLay[0].price)
            ]));
        }
    });

    return renderedFavourites;
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
    return m('div', {
        class: 'events'
    }, [m('div', {
            class: 'events__status'
        }), m('div', {
            class: 'events__header'
        }, [
            m('div', 'Start Time'),
            m('div', 'Venue'),
            m('div', 'Market'),
            m('div', '1st Favourite'),
            m('div', '2nd Favourite'),
            m('div', '3rd Favourite')
        ]),
        m('div', {
            class: 'events__table'
        }, [
            events.model.map(function(data, index) {
                return m('div', {
                    class: 'events__table__row'
                }, [
                        m('div', {
                        class: 'events__table__row__cell'
                    }, data.marketStartTime.match(/\d{2}:\d{2}/)),
                        m('div', {
                        class: 'events__table__row__cell'
                    }, data.event.venue),
                        m('div', {
                        class: 'events__table__row__cell'
                    }, data.marketName),
                        renderFavourites(data.runners)
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
