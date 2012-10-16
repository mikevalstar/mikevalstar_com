// Includes
var crypto = require('crypto'),
    as3 = require('./AS3'),
    fs = require('fs'),
    path = require('path'),
    im = require('imagemagick'),
    flow = require('flow');

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
        
        // image related
        app.get ('/Admin/Images', function(req, res) { self.images(req, res); }  );
        app.get ('/Admin/AJAX/Images', function(req, res) { self.ajaxImageList(req, res); }  );
        app.post ('/Admin/AJAX/Image', function(req, res) { self.imageAdd(req, res); }  );
        
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
                  {      login:         req.body.email 
                    , password:     hashString(req.body.password) }
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
            showAdminJS: true
        });
    }
    
    /* Blog post related */
    , pagePostList: function(req, res){ // List of blog posts
        if( !this._checkLogin(req, res) ) return;
        
        var blogpost = this.db.model('blogPost');
        
        var query = blogpost.find().sort("-posted").limit(1000).exec(function(err, docs){
            res.render('admin/postlist', {
                title: 'Post Listing',
                posts: docs,
                showAdminJS: true
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
                    showAdminJS: true
                });
            });
        
        }else{ // New Post
            var newid = 1;
            var blogpost = this.db.model('blogPost');
            blogpost.find().sort("-sid").limit(1).exec(function(err, doc){
                if(err)
                    console.info(err);
                    
                if(!doc || doc.length == 0){
                    newid = 1;
                }else{
                    newid = doc[0].sid + 1;
                }
        
                res.render('admin/post', {
                    title: 'New Blog Post',
                    post: {    id        : "",
                            sid        : newid,
                            author    : "mikevalstar@gmail.com",
                            title    : "",
                            img_s3    : "",
                            img_retina : false,
                            content    : "",
                            short    : "",
                            group    : "",
                            ext_link: "",
                            posted    : "",
                            edited    : "",
                        },
                    showAdminJS: true
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
                    sid        : req.body.sid,
                    title    : req.body.title,
                    img_s3    : req.body.img_s3,
                    img_retina    : req.body.img_retina == 1 || false,
                    content    : req.body.content,
                    short    : req.body.short,
                    group    : req.body.group,
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
            blogpost.find().sort("-sid").limit(1).exec(function(err, doc){
                if(err)
                    console.info(err);
                    
                if(!doc || doc.length == 0){
                    newid = 1;
                }else{
                    newid = doc[0].sid + 1;
                }
                
                // new blog post
                var post = new blogpost({
                    sid        : req.body.sid == "" ? parseInt(newid) : req.body.sid,
                    author    : "mikevalstar@gmail.com",
                    title    : req.body.title,
                    img_s3    : req.body.img_s3,
                    img_retina    : req.body.img_retina == 1 || false,
                    content    : req.body.content,
                    short    : req.body.short,
                    group    : req.body.group,
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
    },
    
    images: function(req, res){
        if( !this._checkLogin(req, res) ) return;
        // dispaly the page, its static, we'll populate with javascript
        res.render('admin/images', { title: 'Image Listing', showAdminJS: true });
    },
    
    imageAdd: function(req, res){
        if( !this._checkLogin(req, res) ) return;
        
        // Gather all the relevent info about the file
        var section = req.body.type;
        var tmpfile = req.files.image.path,
            content_type = req.files.image.type,
            origname = req.files.image.name,
            origext = path.extname(req.files.image.name);
        var origbasename = path.basename(origname, origext);
        var ext = '.jpeg';
        switch(content_type){
            case 'image/gif':
                ext = '.gif';
                break;
            case 'image/jpg':
            case 'image/jpeg':
                ext = '.jpeg';
                break;
            case 'image/png':
                ext = '.png';
                break;    
        }
        
        // Sizes we need/want for a given image based on type (@2x versions will also be generated)
        var sizes = [];
        switch(section){
            case 'lead':
                sizes = [{height: 300, width: 1100}, // Leader lg (on article page)
                         {height: 240, width: 884}, // Leader med (on article page)
                         {height: 182, width: 668}, // Leader tablet (on article page)
                         
                         {height: 209, width: 770}, // Leader lg (on article list)
                         {height: 169, width: 620}, // Leader med (on article list)
                         {height: 129, width: 476}, // Leader tablet (on article list)
                         
                         {height: 106, width: 388}]; // leader phone (article / list / lowres)
        }
        
        flow.exec(
            // Get image info
            function(){
                im.identify(tmpfile, this)
            },
            // Resize Image
            function(err, imageinfo){
                if(!err){
                    // function to convert image
                    // Separate function to isolate variables for callback
                    function convert(dim, file, name, dest, crop, cb){
                        im.convert([file, 
                                    crop ? '-thumbnail' : '-resize', 
                                    crop ? dim + '^' : dim, 
                                    '-background', ext == '.jpeg' ? 'white' : 'transparent',
                                    '-gravity', 'center',
                                    '-extent', dim,
                                    name], 
                                    function(result){ callback({source: name, destination: dest}); } );
                    }
                    
                    // Special case thumbnail & 2x thumbnail
                    var callback = this.MULTI();
                    var thumbname = path.join( path.dirname(tmpfile), origbasename + '_thumb' + ext );
                    convert('150x150', tmpfile, thumbname, section + '/thumb/' + origbasename + ext, false, callback);
                    
                    callback = this.MULTI();
                    thumbname = path.join( path.dirname(tmpfile), origbasename + '_thumb@2x' + ext );
                    convert('300x300', tmpfile, thumbname, section + '/thumb/' + origbasename + "@2x" + ext, false, callback);
                    
                    // Generate all of the various sizes if applicable
                    for( var i = 0; i < sizes.length; i++ ) {
                        if( imageinfo.height >= sizes[i].height
                            && imageinfo.width >= sizes[i].width){
                            
                            // Generate the regular sized image
                            var cb = this.MULTI();
                            var dimensions = sizes[i].width + 'x' + sizes[i].height;
                            var tmpname = path.join( path.dirname(tmpfile), origbasename + '_' + dimensions + ext );
                            var dest = path.join(section, dimensions, origbasename + ext);
                            convert(dimensions, tmpfile, tmpname, dest, true, cb);
                            
                            // geneerate 2x images
                            if( imageinfo.height >= sizes[i].height *2
                                && imageinfo.width >= sizes[i].width *2){   
                                var cb2x = this.MULTI();
                                var dimensions2x = (sizes[i].width * 2) + 'x' + (sizes[i].height * 2);
                                var tmpname2x = path.join( path.dirname(tmpfile), origbasename + '_' + dimensions + '@2x' + ext );
                                var dest2x = path.join(section, dimensions, origbasename + '@2x' + ext);
                                convert(dimensions2x, tmpfile, tmpname2x, dest2x, true, cb2x);
                            }
                        }
                    };
                    
                }// dont do anything and the loop exists on error
            },
            // Upload to S3
            function(results){
                
                // function to upload file to s3
                // Separate function to isolate variables for callback
                function upload(source, dest, cb){
                    as3.uploadImage(source,
                                    dest,
                                    content_type,
                                    function(err, result){ cb(err, result, source); });
                }
                
                // Special case for original
                upload(tmpfile,
                        section + '/orig/' + origbasename + ext,
                        this.MULTI());
                
                for( var i = 0; i < results.length; i++ ) {
                    upload(results[i]['0'].source,
                            results[i]['0'].destination,
                            this.MULTI());
                }
            },
            // Delete temp files
            function(results){
                // All processing is finished, delete the temp files
                for( var i = 0; i < results.length; i++ ) {
                    fs.unlink(results[i][2]);
                }
                
                res.send({success: "Image resized and uploaded"}); // tell the browser it uploaded. so it can regen the page
            }
        );
        
    },
    
    ajaxImageList: function(req, res){
        if( !this._checkLogin(req, res) ) return;
        
        as3.listImages('lead/thumb', function(err, results){
            if(!err){
                if(results.Contents && results.Contents.length > 0){
                    var imgList = [];
                    for(var i = 0; i < results.Contents.length; i++){
                        var row = results.Contents[i];
                        if(row.Key[row.Key.length - 1] != "/" && path.basename(row.Key).indexOf('@2x') < 1 ){
                            imgList.push({
                                image: '//s3.amazonaws.com/mikevalstar/' + row.Key,
                                imageShort: path.basename(row.Key),
                                mod: row.LastModified,
                                size: row.Size
                            });
                        }
                    }
                    
                    imgList.sort(function(a,b){ if(a.mod == b.mod){ return 0 } return a.mod > b.mod ? -1 : 1; }); // sort newest first
                    
                    res.send({images: imgList});
                }else{
                    res.send({notice: "0 results found"});
                }
            }else{
                res.send({error: "There was an error with the request", details: err});
            }
        });
    }
    
};