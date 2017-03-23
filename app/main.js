const API = require("./API");
const Communication = require("./communication");
const APIBase = require("../core/base/APIBase");
const CommunicationBase = require("../core/base/CommunicationBase");
const wxsdk = require("wxapi");
class Main{
	constructor(router,app) {
		let APIObj = new API(router,app);
		if(!APIObj instanceof APIBase){
			throw Error("API.js must be extends APIBase");
		}
		let communicationObj = new Communication(router,app);
		if(!communicationObj instanceof CommunicationBase){
			throw Error("communication.js must be extends CommunicationBase");
		}
	}

	initSDK(){
		
	}
}
module.exports = Main;