var mongoose = require('mongoose');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Database = module.exports = function Database(){};

Database.prototype = {
	
	  _collections: {
	  	adminUser: {
			  login		: String
			, password	: String
		}
	}
	
	, _db: null
	, _schema: {}
	, _model: {}
	
	, connect: function(url){
		mongoose.connect(url);
		
		this._schema.adminUser = new Schema(this._collections.adminUser);
		this._model.adminUser = mongoose.model('adminUser', this._schema.adminUser);
		
	}
	
	, model: function(mod){	
		switch (mod){
			case 'adminUser':
				return this._model.adminUser;
		}
	}
	
	, addUser: function(email, pass, ret){
		var au = this.model('adminUser');
		var usr = new au({login: email, password: pass});
		usr.save(ret);
	}
};