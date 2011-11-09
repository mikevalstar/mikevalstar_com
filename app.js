/**
 * Module dependencies.
 */
 
require.paths.unshift(__dirname + '/lib');

var express = require('express');
var app = module.exports = express.createServer();
var sqlite = require('sqlite');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/htdocs'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Internal Page Handlers
var static_pages = require('StaticPages');
var sp = new static_pages();
sp.initPages(app);


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
