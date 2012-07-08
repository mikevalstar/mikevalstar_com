// Includes
var crypto = require('crypto');

function hashString(value) {
  hash = crypto.createHash('sha1');
  hash.update(value);
  return hash.digest('hex');
}

var AdminPages = module.exports = function AdminPages(){};

AdminPages.prototype = {

	  db: null

	, initPages: function(app, db){
	
		this.db = db;
		var self = this;
		
		// login related
		app.get ('/Admin/Login', function(req, res) { self.pageLogin(req, res); } );
		app.post('/Admin/Login', function(req, res) { self.pageLoginPost(req, res); }  );
		app.get ('/Admin/Logout', function(req, res) { self.pageLogout(req, res); }  );
		
		// post related
		app.get ('/Admin/PostList', function(req, res) { self.pagePostList(req, res); }  );
		app.get ('/Admin/NewPost', function(req, res) { self.pagePost(req, res); }  );
		app.post('/Admin/Post', function(req, res) { self.pagePostPost(req, res); }  );
		app.get ('/Admin/Post/:id', function(req, res) { self.pagePost(req, res); }  );
		
		// misc.
		app.get ('/Admin', function(req, res) { self.pageIndex(req, res); } );
	}
	
	, _checkLogin: function(req, res){
		if(req.session && req.session.loggedIn === true)
			return true;

		res.redirect('/Admin/Login');
		return false;
	}
	
	, pageLogin: function(req, res){
		res.render('admin/login', {
			title: 'Login',
			showFullNav: false
		});
	} 
	
	, pageLogout: function(req, res){
		delete req.session.loggedIn;
		res.redirect('/Admin/Login');
	}
	
	, pageLoginPost: function(req, res){
		if(req.body && req.body.password && req.body.email){
			var adminuser = this.db.model('adminUser');
			adminuser.findOne(
				  {	  login: 		req.body.email 
					, password: 	hashString(req.body.password) }
				, function(err, row){
				
				if(err){
					res.render('admin/login', {
						title: 'Login',
						showFullNav: false,
						error_text: err
					});			
				}else{
					if(row){
						req.session.loggedIn = true; // register user is logged in
						res.redirect('/Admin');
					}else{
						res.render('admin/login', {
							title: 'Login',
							showFullNav: false,
							error_text: 'User not found, Please try again',
							email: req.body.email
						});	
					}
				}
			});
		}else{
			res.render('admin/login', {
				title: 'Login',
				showFullNav: false,
				error_text: 'Error processing login.'
			});	
		}
	}
	
	, pageIndex: function(req, res){
		if( !this._checkLogin(req, res) ) return;
		
		res.render('admin/index', {
			title: 'Admin Index',
			showFullNav: false
		});
	}
	
	/* Blog post related */
	, pagePostList: function(req, res){ // List of blog posts
		if( !this._checkLogin(req, res) ) return;
		
		var blogpost = this.db.model('blogPost');
		
		var query = blogpost.find().sort("posted", -1).limit(1000).exec(function(err, docs){
			res.render('admin/postlist', {
				title: 'Post Listing',
				posts: docs,
				showFullNav: false
			});
		});
	}
	
	, pagePost: function(req, res){ // Edit/New Page
		if( !this._checkLogin(req, res) ) return;
		
		if(req.params.id){ // Old Post
		
			var blogpost = this.db.model('blogPost');
			blogpost.findOne({sid: req.params.id}, function(err, row){
				if(!row){
					res.redirect('/Admin/NewPost');
					return;
				}
				
				res.render('admin/post', {
					title: req.params.id + ' - ' + row.title,
					post: row,
					showFullNav: false
				});
			});
		
		}else{ // New Post
			var newid = 1;
			var blogpost = this.db.model('blogPost');
			blogpost.find().sort("sid", -1).limit(1).exec(function(err, doc){
				if(err)
					console.info(err);
					
				if(!doc || doc.length == 0){
					newid = 1;
				}else{
					newid = doc[0].sid + 1;
				}
		
				res.render('admin/post', {
					title: 'New Blog Post',
					post: {	id		: "",
							sid		: newid,
							author	: "mikevalstar@gmail.com",
							title	: "",
							img_lg	: "",
							img_sm	: "",
							content	: "",
							short	: "",
							group	: "",
							ext_link: "",
							posted	: "",
							edited	: "",
						},
					showFullNav: false
				});
			});
		}
	}
	
	, pagePostPost: function(req, res){
		if( !this._checkLogin(req, res) ) return;
		
		if(req.body.id && req.body.id != ""){
			// old page
			var blogpost = this.db.model('blogPost');
			
			blogpost.update(
				{_id: req.body.id},
				{
					sid		: req.body.sid,
					title	: req.body.title,
					img_lg	: req.body.img_lg,
					img_sm	: req.body.img_sm,
					content	: req.body.content,
					short	: req.body.short,
					group	: req.body.group,
					ext_link: req.body.ext_link,
				},
				{ multi: false },
				function(err, numrows){
					if(err){
						console.log(err);
					}else{
						console.log("Updated ("+numrows+") blog post(s) at internal id: " + req.body.id);
					}
					
					res.redirect('/Admin/Post/' + req.body.sid);
				});
			
		}else{
			// new page
			var blogpost = this.db.model('blogPost');
			
			// max id + 1
			var newid = 1;
			blogpost.find().sort("sid", -1).limit(1).exec(function(err, doc){
				if(err)
					console.info(err);
					
				if(!doc || doc.length == 0){
					newid = 1;
				}else{
					newid = doc[0].sid + 1;
				}
				
				// new blog post
				var post = new blogpost({
					sid		: req.body.sid == "" ? parseInt(newid) : req.body.sid,
					author	: "mikevalstar@gmail.com",
					title	: req.body.title,
					img_lg	: req.body.img_lg,
					img_sm	: req.body.img_sm,
					content	: req.body.content,
					short	: req.body.short,
					group	: req.body.group,
					ext_link: req.body.ext_link,
				});
				
				post.save(function(err){
					if(err){
						console.log(err);
					}else{
						console.log("Inserted new blog post at sid: " + post.sid + " at internal id: " + post.id);
					}
					
					res.redirect('/Admin/Post/' + post.sid);
				});
				
			});
			
		}
	}
	
};