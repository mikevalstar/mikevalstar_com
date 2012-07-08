var mongoose = require('mongoose');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Database = module.exports = function Database(){};

Database.prototype = {
	
	  _collections: {
	  	adminUser: {
			  login		: String
			, password	: String
		},
		blogPost:{
			sid		: { type: Number, required: true, unique: true, index: true },
			author	: { type: String },
			title	: { type: String },
			img_lg	: { type: String },
			img_sm	: { type: String },
			content	: { type: String },
			short	: { type: String },
			group	: { type: String },
			ext_link: { type: String },
			posted	: { type: Date, index: true, default: Date.now },
			edited	: { type: Date, default: Date.now },
		},
	}
	
	, _db: null
	, _schema: {}
	, _model: {}
	
	, connect: function(url){
		mongoose.connect(url);
		
		this._schema.adminUser = new Schema(this._collections.adminUser);
		this._model.adminUser = mongoose.model('adminUser', this._schema.adminUser);
		
		this._schema.blogPost = new Schema(this._collections.blogPost);
		this._model.blogPost = mongoose.model('blogPost', this._schema.blogPost);
		
	}
	
	, model: function(mod){	
		switch (mod){
			case 'adminUser':
				return this._model.adminUser;
			case 'blogPost':
				return this._model.blogPost;
		}
	}

};