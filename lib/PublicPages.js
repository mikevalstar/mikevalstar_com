var jade = require('jade');
var Util = require("./Util");


var PublicPages = module.exports = function PublicPages(){};

PublicPages.prototype = {

    db: null

    , initPages: function(app, db){
        this.db = db;
        var self = this;
        
        app.get('/', function(req, res) { self.pageIndex(req, res, false); });
        app.get('/Blog', function(req, res) { self.pageIndex(req, res, false); });
        app.get('/Blog/:page([0-9]+)', function(req, res) { self.pageIndex(req, res, {page: req.params.page}); });
        app.get('/Blog/:year([0-9]+)/:month([0-9]+)', function(req, res) { self.pageIndex(req, res, {year: req.params.year, month: req.params.month}); });
        //app.get('/Blog/:group', function(req, res) { self.pageIndex(req, res, {group: req.params.group}); });
        app.get('/Blog/s/:topic', function(req, res) { self.pageIndex(req, res, {search: req.params.topic}); });
        app.get('/Blog/:id/:title', function(req, res) { self.pageBlogPost(req, res); });
        
        app.get('/RSS', function(req, res) { self.RSS(req, res); });
    }
    
    , pageIndex: function(req, res, nav){
        var perpage = (nav === false || nav.page) ? 10 : 100; // show 100 items for month or search, otherwise 10
        console.log(nav);
        var blogpost = this.db.model('blogPost');
        var page = (nav && nav.page) ? nav.page - 1 : 0;
        var query = {};
        if(nav && nav.search) query = {title: {$regex: new RegExp('.*' + Util.escapeRegEx(nav.search) + '.*', 'i')}};
        if(nav && nav.group) query = {group: nav.group}; 
        if(nav && nav.year){
            var start = new Date(nav.year, nav.month, 1);
            var end = new Date(nav.year, start.getMonth() + 1, 1);
            query = {posted: { $gte: start, $lt: end }}; 
        }

        var query = blogpost.find(query);
        
        query.sort("-posted").skip(page * perpage).limit(perpage).exec(function(err, docs){
        
            for ( var k in docs ){
                docs[k].link_title = Util.link_title(docs[k].title);
                var new_short = jade.compile(docs[k].short);
                docs[k].short = new_short();
                docs[k].posted_human = Util.human_date(docs[k].posted);
            }
            
            query.count(function(err, postcount){ 
                var totalpages = Math.ceil(postcount / perpage);
                var nextpage = totalpages > page ? page + 2 : false;
                var prevpage = page > 0 ? page : false;
            
                var render_page = function(monthlist){
                    res.render('index', {
                            title: 'Blog',
                            posts: docs,
                            nextpage: nextpage,
                            prevpage: prevpage,
                            months: monthlist,
                            month_names: new Array("January","February","March","April","May","June","July","August","September","October","November","December"),
                            showFullNav: nav
                        });
                }
                
                // Production of month groups for Archive
                var map = function(){
                    emit( this.posted.getFullYear() + '-' + this.posted.getMonth() , { count: 1, year: this.posted.getFullYear(), month: this.posted.getMonth() } );
                };
                
                var reduce = function(key, values){
                    var result = { 
                        count: values.length,
                        month: values[0].month,
                        year: values[0].year
                    };
                    return result;
                };
                
                blogpost.collection.mapReduce(
                    map.toString()
                    , reduce.toString()
                    , {out: { inline: 1 }}
                    , function(err, monthlist){
                        monthlist.reverse();
                        render_page(monthlist);
                    }
                );
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
            var new_short = jade.compile(row.short);
            row.short = new_short();
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
    
    , RSS: function(req, res){
        var blogpost = this.db.model('blogPost');
        var query = blogpost.find().sort("-posted").limit(30).exec(function(err, docs){
            
            for ( var k in docs ){
                docs[k].title = docs[k].title;
                var new_short = jade.compile(docs[k].short);
                docs[k].description = new_short();
                docs[k].pubDate = docs[k].posted;
                docs[k].link = (docs[k].ext_link != '') ? 
                    docs[k].ext_link : 
                    'http://mikevalstar.com/Blog/' + docs[k].sid + "/" + Util.link_title(docs[k].title);
                docs[k].guid = 'http://mikevalstar.com/Blog/' + docs[k].sid + "/" + Util.link_title(docs[k].title);
                docs[k].isPermaLink = true;
            }
            
            res.header('Content-Type', 'application/xml');
            res.render('rss2.0.template.jade', {
                  dateFormat: Util.GetRFC822Date
                , channel: {
                          title: "Mike Valstar's Blog"
                        , link: "http://mikevalstar.com"
                        , description: "WEB DEVELOPMENT, PROGRAMMING, RANDOM THOUGHTS"
                    }
                , items: docs
                , layout: false
            });
        });
    } 
};