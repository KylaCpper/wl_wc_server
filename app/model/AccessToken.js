const DBInterface = require('../../core/db/DBInterface');
const mongoose = require('mongoose');
class AccessToken extends DBInterface{
	init(){
		this.setTabelName("access_token");
		let model = mongoose.Schema({
			access_token:{type:String},
			js_token:{type:String},
	        createTime:{type:Date,expires:'1.8h',default: Date.now}
	    }, {collection: 'access_token'});
	    return model;







	}
}
module.exports = AccessToken;