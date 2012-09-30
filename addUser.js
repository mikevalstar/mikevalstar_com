/**********************
A simple script to add a new user
**********************/
// Includes
var crypto = require('crypto');

function hashString(value) {
  hash = crypto.createHash('sha1');
  hash.update(value);
  return hash.digest('hex');
}

// Database
var Database = require('./lib/Database');
var db = new Database();
db.connect('mongodb://localhost/mv');

if(process.argv.length == 4){
    // 0 will be node, 1 will be the script
    
    var au = db.model('adminUser');
    var usr = new au({login: process.argv[2], password: hashString(process.argv[3]) });
    usr.save(function(err){
        console.log("User added to database");
        process.exit(0); // Success
    });
    
}else{
    console.error("Script requires exactly 2 arguments");
    console.error("Usage: node addUser.js <email> <password>");
    process.exit(1); // Failure
}