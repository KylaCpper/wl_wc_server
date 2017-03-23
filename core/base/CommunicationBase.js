const path = require('path');
const CommunicationControllerPath = path.join(__dirname,"..","..","/app/controller/CommunicationController.js");
const fs = require('fs');
const CommunicationControllerBase = require("./CommunicationControllerBase");
let communicationController = null;
class CommunicationBase{
	constructor(router,app) {
		router.post('/communication/monitor',this.monitor);
		router.post('/communication/authorization',this.other);
		if(fs.existsSync(CommunicationControllerPath)){
			let controllerClass = require(CommunicationControllerPath);
			let controller = new controllerClass(app.dbManager);
			if(controller instanceof CommunicationControllerBase){
				communicationController = controller;
			}else{
				console.log(`controller must be extends CommunicationControllerBase`);
			}
		}else{
			console.log(`Cannot find ${CommunicationControllerPath}`);
		}
	}

	monitor(){
		throw Error("need override method:monitor");
	}

	other(){
		throw Error("need override method:other");
	}
}

CommunicationBase.notificationController = function*(data){
	if(communicationController)
		yield communicationController.onMessage(data);
	
}
module.exports = CommunicationBase;