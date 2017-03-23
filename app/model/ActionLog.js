const DBInterface = require('../../core/db/DBInterface');
const mongoose = require('mongoose');
class ActionLog extends DBInterface{
	init(){
		this.setTabelName("action_log");
		let model = mongoose.Schema({
	        device: {type: String, required: true},
	        action: {type: String, required: true},
	        data: {},
	        createTime: {type: Date}
	    }, {collection: 'action_log'});
	    model.index({device: 1});
	    return model;







	}
}
module.exports = ActionLog;