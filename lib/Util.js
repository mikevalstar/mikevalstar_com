var dateFormat = require('dateformat');

var Util = module.exports = {
	
	  link_title: function(title){
		return title.replace(/ /gi, "_");
	}
	
	, human_date: function(dt){
		return dateFormat(dt, "longDate");
	}
	
}