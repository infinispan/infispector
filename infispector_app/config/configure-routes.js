/**
 * Routing passing point. This section is separated from the routes' implementation.
 */

'use strict';
var app = require('../app'),
    routes = require('./routes');

function configureRoutes() {
    app.post('/connectDruid', routes.queryDruid);
    app.post('/putEntry', routes.putEntry);
    app.post('/getEntry', routes.getEntry);
    app.get('/', routes.index);
    app.get('/index.html', routes.index);
    app.get('/operations.html', routes.operations);
}

module.exports = configureRoutes;