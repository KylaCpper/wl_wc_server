const DBInterface = require('../../core/db/DBInterface');
const mongoose = require('mongoose');
class UserDeviceInfoModel extends DBInterface{
	 init() {
        this.setTabelName("user_device_info");
        let model = mongoose.Schema({
            _device_obj_id: {type: String, required: true},
            _user_obj_id: {type: String, required: true},
            type: {type: String, required: true},
            info: {type: Object},
            isread: {type: Number, required: true, default: 0},
            status: {type: Number, required: true, default: 0},
            createTime: {type: Date, required: true, default: Date.now}
        }, {collection: 'user_device_info'});
        model.index({_device_obj_id: 1});
        model.index({_user_obj_id: 1});
        return model;
    }
}
module.exports = UserDeviceInfoModel;