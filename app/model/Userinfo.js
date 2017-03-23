const DBInterface = require('../../core/db/DBInterface');
const mongoose = require('mongoose');
class UserinfoModel extends DBInterface{
	init(){
		this.setTabelName("userinfo");
		let model = mongoose.Schema({
	        _user_obj_id: {type: String, required: true},
	        nickname: {type: String, required: true},
	        head: {type: String},
	        city: {type: String},
	        sex: {type: Number},
	        height: {type: Number},
	        birthday: {type: Date},
	        toWeight: {type: Number},
	        updateTime: {type: Date,default: Date.now}

	    }, {collection: 'userinfo'});
	    model.index({_user_obj_id: 1}, {unique: true});
	    return model;







	}
}
module.exports = UserinfoModel;