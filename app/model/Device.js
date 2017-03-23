const DBInterface = require('../../core/db/DBInterface');
const mongoose = require('mongoose');
class DeviceModel extends DBInterface{
	init(){
		this.setTabelName("device");
		let model = mongoose.Schema({
	        deviceId: {type: String, required: true},
	        pid: {type: String},
	        softwareVer: {type: String},
	        deviceVer: {type: String},
	        deviceModel: {type: String},
	        userUpdatetime: {type: Number},
	        updateTime: {type: Date},
	        createTime: {type: Date, required: true, default: Date.now}
	    }, {collection: 'device'});
	    model.index({deviceId: 1}, {unique: true});

	    return model;







	}
}
module.exports = DeviceModel;