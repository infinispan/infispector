/**
 * Routing passing point. This section is separated from the routes' implementation.
 */

'use strict';
var app = require('../app'),
    routes = require('./routes');

function configureRoutes() {
    app.post('/connectDruid', routes.queryDruid);
    app.get('/', routes.root);
    app.get('*', routes.root);
}

module.exports = configureRoutes;