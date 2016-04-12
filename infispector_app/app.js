var express = require('express'),
    app = module.exports = express(),
    routes = require('./config/routes'),
    passport = require('passport'),
    env = process.env.NODE_ENV || 'development';
    //mongoose = require('mongoose'); //use druid

// Configuration
app.configure(function() {
    app.config = require('./config/config')[env];
    app.set('port', process.env.PORT || 3000);
    app.engine('html', require('ejs').renderFile);
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'html');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());    
    app.use(express.session({ secret: 'ultrazone' }));
    app.use(express.static(__dirname + '/app'));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);

    app.server = require('http').createServer(app);
  });

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

app.configure('production', function(){
    app.use(express.errorHandler());
  });

// Mongoose connection
// mongoose.connect(app.config.db); //use druid

//setup the routes
require('./config/configure-routes')();

// Start server
app.server.listen(app.get('port'), function(){
    console.log("Server is listening on port " + app.get('port'));
});