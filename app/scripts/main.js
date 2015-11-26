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
 * Set up mutation observers to listen for price updates at the DOM level.
 * @param  {DOMElement}  element  The DOM element affected.
 * @param  {Boolean}     isInitialized Load mutations if node not initialized.
 * @return {void}
 */
var setRunnerPriceObservers = (element, isInitialized) => {

    // Mithril will tell when a node first renders in to DOM
    if (!isInitialized) {

        // Configuration of the observer
        let config = { characterData: true, subtree: true };

        // Create an observer instance
        let observer = new MutationObserver(mutations => {

            // Loop occurred mutations
            mutations.map(mutation => {

                // Hold the element updated
                let element = mutation.target.parentElement;

                // Highlight dom node
                element.classList.add('events__body__row__cell__odds__back--update');

                // Remove highlight
                setTimeout(() => element.classList.remove("events__body__row__cell__odds__back--update"), 500);
            });
        });

        // Pass in the target node, as well as the observer options
        observer.observe(element, config);

    }
};

/**
 * Generate a DOM tree for event runners.
 * @param  {Array} runners  Runner names and pricing data
 * @return {Array[HTML]}    The DOM tree
 */
var renderFavouritePrices = (runners) => {

    // Hold final markup
    var prices = [];

    // Limit up to 3 favorites
    runners = runners.slice(0, 3);

    // Sort runners by lowest price
    runners.sort((runner1, runner2) => {
        let price1 = runner1.ex &&
                     runner1.ex.availableToBack.length &&
                     runner1.ex.availableToBack[0].price,
            price2 = runner2.ex &&
                     runner2.ex.availableToBack.length &&
                     runner2.ex.availableToBack[0].price;

        return price1 > price2 ? 1 : price1 < price2 ? -1 : 0;
    });

    // Push runner markup
    runners.map((runner) => {
        let price1 = runner.ex &&
                     runner.ex.availableToBack.length &&
                     runner.ex.availableToBack[0].price,
            price2 = runner.ex &&
                     runner.ex.availableToLay.length &&
                     runner.ex.availableToLay[0].price;

        if (runner) {
            prices.push(
                m('td', { class: 'events__body__row__cell events__body__row__cell__odds' },
                    m('div', { class: 'events__body__row__cell__odds__back' }, price1),
                    m('div', { class: 'events__body__row__cell__odds__lay' }, price2)
            ));
        }
    });

    return prices;
};

/**
 * Handle subsequent events and tell Mithril to re-render only events with updates.
 * @param  {Object} message A list of horse racing events and prices
 * @return {void}
 */
var onMessageReceive = (message) => {

    // assign latest events
    events.model = JSON.parse(message.data);

    m.redraw();
};

// Define the events view-model
events.model = [];

// Events view
events.view = function() {
    let columns = ['Start Time', 'Venue', 'Market', '1st Favourite', '2nd Favourite', '3rd Favourite'];

    return (
        m('table', { class: 'events' },

            // Heading columns
            m('thead',
                m('tr', { class: 'events__header__row' },
                    columns.map(column => m('th', { class: 'events__header__row__cell' }, column)))),

            // Content body
            m('tbody', {  config: setRunnerPriceObservers, class: 'events__body' },

                // Body rows
                events.model.map((data, index) => {
                    return (
                        m('tr', {  class: 'events__body__row' },
                            m('td', { class: `events__body__row__cell events__body__row__cell__flag--${data.event.countryCode}` }, data.marketStartTime.match(/\d{2}:\d{2}/)),
                            m('td', { class: 'events__body__row__cell events__body__row__cell__venue' }, data.event.venue),
                            m('td', { class: 'events__body__row__cell events__body__row__cell__market' }, data.marketName),

                            // Favourite back/lay odds
                            renderFavouritePrices(data.runners)
                        )
                    );
                })
            )
        )
    );
};

// Mount the events view into DOM
m.mount(document.body, {
    view: events.view
});

//m.redraw.strategy('diff');

// Create a socket connection to listen continuosly for updates.
socket.init(config.ws.host, config.ws.port, onMessageReceive);
