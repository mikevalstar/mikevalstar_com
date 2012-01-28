/**
 * Module dependencies.
 */
var   express = require('express')
	, mongoServer = require('mongodb').Server
	, mongoStore = require('connect-mongodb');
	
var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  
  server_config = new mongoServer('localhost', 27017, {auto_reconnect: true, native_parser: true})
  app.use(express.session({ store: new mongoStore(server_config), secret: "mv secret" }));
  app.use(app.router);
  app.use(express.static(__dirname + '/htdocs'));
});

// Error Handling
var error = require('./lib/ErrorHandler');

app.configure('development', function(){
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	app.use(error({ showMessage: true, dumpExceptions: true, showStack: true, logErrors: __dirname + '/log/error_log' }));
});

app.configure('production', function(){
  //app.use(express.errorHandler()); 
	app.use(error());
});

// Database
var Database = require('./lib/Database');
var db = new Database();
db.connect('mongodb://localhost/mv');

// Internal Page Handlers
var static_pages = require('./lib/StaticPages');
var sp = new static_pages();
sp.initPages(app);

var admin_pages = require('./lib/AdminPages');
var ap = new admin_pages();
ap.initPages(app, db);

// 404 Page
app.use(function(req, res, next){
	res.render('404.jade', {title: "404 - Page Not Found", showFullNav: false, status: 404, url: req.url });
});

// Example error pages
app.get('/ErrorExample', function(req, res, next){
	next(new Error('keyboard cat!')); // trigger an error
});

app.get('/ErrorExample2', function(req, res){
	res.render('404.jade'); // force an error.. we did not set the title
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
