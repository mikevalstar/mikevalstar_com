var StaticPages = module.exports = function StaticPages(){};

StaticPages.prototype = {

    initPages: function(app){
    
        // Routes
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