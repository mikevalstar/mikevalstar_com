/**
 * Module dependencies.
 */
process.env.TZ = 'GMT';
var   express = require('express')
    , http = require('http')
    , path = require('path')
    , mongoStore = require('session-mongoose');
    
var app = express();

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(require('less-middleware')({ src: __dirname + '/htdocs' }));
    
    var mongooseSessionStore = new mongoStore({
        url: "mongodb://localhost/mv",
        interval: 1200000
    });
    
    app.use(express.session( {cookie: {maxAge: 1200000}, store: mongooseSessionStore, secret: "mv secret" }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'htdocs')));
});

// Error Handling
var error = require('./lib/ErrorHandler');

app.configure('development', function(){
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(error({ showMessage: true, dumpExceptions: true, showStack: true, logErrors: __dirname + '/log/error_log' }));
});

app.configure('production', function(){
  //app.use(express.errorHandler()); 
  app.set('port', process.env.PORT || 80);
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

var public_pages = require('./lib/PublicPages');
var pp = new public_pages();
pp.initPages(app, db);

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


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode.\n", app.get('port'), app.settings.env);
});
