var StaticPages = module.exports = function StaticPages(){};

StaticPages.prototype = {

	initPages: function(app){
	
		// Routes
		app.get('/', function(req, res){
		  res.render('index', {
		    title: 'Home',
		    showFullNav: true
		  });
		});
		
		app.get('/Blog', function(req, res){
		  res.render('index', {
		    title: 'Blog',
		    showFullNav: false
		  });
		});
		
		app.get('/Blog/:id/:title', function(req, res){
		  res.render('post/bp_' + req.params.id , {
		    title: req.params.title.replace(/_/g,' '),
		    showFullNav: false
		  });
		});
		
		app.get('/Projects', function(req, res){
		  res.render('projects', {
		    title: 'Home',
		    showFullNav: false
		  });
		});
		
		app.get('/About', function(req, res){
		  res.render('about', {
		    title: 'Home',
		    showFullNav: false
		  });
		});
	
	}
	
	
};