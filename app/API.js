const APIBase = require('../core/base/APIBase');
const DeviceController = require('./controller/DeviceController');
const UserController = require('./controller/UserController');
const CommunicationController = require('./controller/CommunicationController');

class API extends APIBase{
	constructor(router,app) {
		super(router,app);
		//加载controller
		this.userController = this.controllerLoader(UserController);
		this.communicationController = this.controllerLoader(CommunicationController);
		this.deviceController = this.controllerLoader(DeviceController);

		this.setRouter();
	}

	setRouter(){
        this.get('test','test',this.userController.test,false);
        this.post("user","login",this.userController.userLogin,false);
		this.post("user","get_access_token",this.userController.getAccessToken,false);
		this.post("user","getJsSign",this.userController.getJsSign,false);
		this.post("user","updateInfo",this.userController.updateInfo,false);
		this.post("device","getDevice",this.deviceController.getDevice,false);
		this.post("device","deviceState",this.deviceController.getState,false);
		this.post("device","actDevice",this.deviceController.activate,false);
		this.post("device","delDevice",this.deviceController.delDevice,false);
		this.post("device","getNewInfo",this.deviceController.getInfo,false);
		this.post("device","getInfoList",this.deviceController.getInfoLists,false);
		this.post("device","getSingleInfoList",this.deviceController.getInfoList,false);
		this.post("device","getNewMessage",this.deviceController.getNewMessage,false);
		this.post('device','getDetailInfo',this.deviceController.getDeviceInfo,false);
		this.post('device','deInfo',this.deviceController.delInfo,false);
		this.post("device","getDetail",this.deviceController.getDetail,false);
		//this.post("test","callback",this.deviceController.callback,false);
		

	}
}
module.exports = API;