const DBInterface = require('../../core/db/DBInterface');
const mongoose = require('mongoose');
class UserDeviceModel extends DBInterface{
	init(){
		this.setTabelName("user_device");
		let model = mongoose.Schema({
	        _device_obj_id: {type: String, required: true},
	        _user_obj_id: {type: String, required: true},
	        seat: {type: Number},
	        status: {type: Number, required: true,default: 1},
	        createTime: {type: Date, required: true, default: Date.now}
	    }, {collection: 'user_device'});
	    model.index({_device_obj_id: 1});
	    model.index({_user_obj_id: 1});
	   
	    return model;







	}
}
module.exports = UserDeviceModel;