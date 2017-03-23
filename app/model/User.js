const DBInterface = require('../../core/db/DBInterface');
const mongoose = require('mongoose');
class UserModel extends DBInterface{
	init(){
		this.setTabelName("user");
		let model = mongoose.Schema({
	        username: {type: String, required: true},
	        source: {type: String},
	        loginTime: {type: Date},
	        createTime: {type: Date, default: Date.now}
	    }, {collection: 'user'});
	    model.index({username: 1}, {unique: true});
	    return model;







	}
}
module.exports = UserModel;