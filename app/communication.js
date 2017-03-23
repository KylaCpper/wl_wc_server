const CommunicationBase = require('../core/base/CommunicationBase');
class Communication extends CommunicationBase{

	*monitor(next){
		this.body = {success:"ok"};
		yield Communication.notificationController(this.request.body);
	}
}
module.exports = Communication;