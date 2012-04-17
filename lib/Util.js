var dateFormat = require('dateformat');

var Util = module.exports = {
	
	  link_title: function(title){
		return title
			.replace(/  /gi, " ")
			.replace(/ /gi, "_")
			.replace(/'/gi, "")
			.replace(/;/gi, "")
			.replace(/:/gi, "")
			.replace(/\./gi, "")
			.replace(/__/gi, "_");
	}
	
	, human_date: function(dt){
		return dateFormat(dt, "mmmm d, yyyy - h:MM TT");
	}
	
	, GetRFC822Date: function(oDate){
	
		// allow for empty request
		if(typeof(oDate) == "undefined" || !oDate) oDate = new Date();
	
		//Pads numbers with a preceding 0 if the number is less than 10.
		var LZ = function(val){ return (parseInt(val) < 10) ? "0" + val : val; }
		
		/* accepts the client's time zone offset from GMT in minutes as a parameter. returns the timezone offset in the format [+|-}DDDD */
		var getTZOString = function(timezoneOffset){
			var hours = Math.floor(timezoneOffset/60);
			var modMin = Math.abs(timezoneOffset%60);
			var s = new String();
			s += (hours > 0) ? "-" : "+";
			var absHours = Math.abs(hours)
			s += (absHours < 10) ? "0" + absHours :absHours;
			s += ((modMin == 0) ? "00" : modMin);
			return(s);
		}
	
		var aMonths = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		var aDays = new Array( "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
		var dtm = new String();
			
		dtm = aDays[oDate.getDay()] + ", ";
		dtm += LZ(oDate.getDate()) + " ";
		dtm += aMonths[oDate.getMonth()] + " ";
		dtm += oDate.getFullYear() + " ";
		dtm += LZ(oDate.getHours()) + ":";
		dtm += LZ(oDate.getMinutes()) + ":";
		dtm += LZ(oDate.getSeconds()) + " " ;
		dtm += getTZOString(oDate.getTimezoneOffset());
		return dtm;
	}
	
	

		
}