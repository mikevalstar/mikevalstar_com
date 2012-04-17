var jade = require('jade');
var Util = require("./Util");


var PublicPages = module.exports = function PublicPages(){};

PublicPages.prototype = {

	db: null

	, initPages: function(app, db){
		this.db = db;
		var self = this;
		
		app.get('/', function(req, res) { self.pageIndex(req, res, true); });
		app.get('/Blog', function(req, res) { self.pageIndex(req, res, false); });
		app.get('/Blog/:id/:title', function(req, res) { self.pageBlogPost(req, res); });
	}
	
	, pageIndex: function(req, res, nav){
		var blogpost = this.db.model('blogPost');
		var query = blogpost.find().sort("posted", -1).limit(1000).exec(function(err, docs){
			for ( var k in docs ){
				docs[k].link_title = Util.link_title(docs[k].title);
				var new_short = jade.compile(docs[k].short);
				docs[k].short = new_short();
				docs[k].posted_human = Util.human_date(docs[k].posted);
			}
		
			res.render('index', {
				title: 'Blog',
				posts: docs,
				showFullNav: nav
			});
		});
	} 
	
	, pageBlogPost: function(req, res){
		var blogpost = this.db.model('blogPost');
		blogpost.findOne({sid: req.params.id}, function(err, row){
			if(!row){
				res.redirect('/404');
				return;
			}
			
			row.link_title = Util.link_title(row.title);
			var new_content = jade.compile(row.content);
			row.content = new_content();
			row.posted_human = Util.human_date(row.posted);
			row.edited_human = Util.human_date(row.edited);
			
			res.render('post', {
				title: row.title,
				post: row,
				showFullNav: false
			});
		});
	} 
};