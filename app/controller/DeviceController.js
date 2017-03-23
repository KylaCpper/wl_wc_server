const UserDeviceDao = require('../dao/UserDeviceDao');
const UserDeviceInfoDao = require('../dao/UserDeviceInfoDao');
const AccessTokenDao = require('../dao/AccessTokenDao');
const ActionLogDao = require('../dao/ActionLogDao');
const UserinfoDao = require('../dao/UserinfoDao');
const UserDao = require('../dao/UserDao');
const DeviceDao = require('../dao/DeviceDao');
const CommunicationControllerBase = require('../../core/base/CommunicationControllerBase');
const moment = require('moment');
const Public = require('./Public');
const self = {};
class DeviceController extends CommunicationControllerBase{
	constructor(models) {
		super(models);
		self.userdeviceDao = this.daoLoader(UserDeviceDao);
		self.userdeviceinfoDao = this.daoLoader(UserDeviceInfoDao);
		self.accesstokenDao = this.daoLoader(AccessTokenDao);
		self.actionlogDao = this.daoLoader(ActionLogDao);
		self.userinfoDao = this.daoLoader(UserinfoDao);
		self.deviceDao = this.daoLoader(DeviceDao);
		self.userDao = this.daoLoader(UserDao);
		self.access_token;
	}	

	*test(){

	}


	*getDevice(){
		let data = this.request.body;
		let token;
		let devices = [];
		let deviceids = [];
		if(data.token){
			if(token = this.Auth.verifyToken(data.token)){
				//select mongo by user_device
				let userdevices = yield self.userdeviceDao.select(token._id); 
				if(userdevices[0]){
					for(let i=0;i<userdevices.length;i++){
						deviceids[i] = userdevices[i]._device_obj_id
					}
					//mongo z json
				    var userDevices = userdevices.map(function (user, id) {
				        let boning = JSON.stringify(user);
						boning = JSON.parse(boning);
				        return boning;
				    });
				    //add pid
 					devices = yield self.deviceDao.selectPid(deviceids); 
 					for(let i=0;i<userDevices.length;i++){
 						for(let i1=0;i1<devices.length;i1++){
							if(devices[i1]._id==userDevices[i]._device_obj_id){
								userDevices[i].pid=devices[i1].pid;
								userDevices[i].deviceId=devices[i1].deviceId;
							}
						}
					}
				}
				this.body = {"code":0,"msg":"success","data":userDevices};
			} else 
				this.body = {"code":502,"msg":"token无效"};
		} else 
			this.body = {"code":501,"msg":"缺少参数"};

	}

	*getState(){
		let data = this.request.body;
		let token,userdevice;
	
			if(data.token&&data.deviceID){
				if(token = this.Auth.verifyToken(data.token)){
						//select mongo by user_device
						let device = yield self.deviceDao.select(data.deviceID);
						if(userdevice = yield self.userdeviceDao.selectBindNum(device._id)){ 
						if(userdevice.length<=4){
							this.body = {"code":0,"msg":"success","data":"yes"};
							return;
						}
						this.body = {"code":0,"msg":"success","data":"no"};
					} else
						this.body = {"code":500,"msg":"系统错误"};
				} else 
				 	this.body = {"code":502,"msg":"token无效"};
			} else 
				this.body = {"code":502,"msg":"缺少参数"};




	}
	*delDevice(){
		let data = this.request.body;
		let token,wx_token;
		if(data.token&&data.deviceID&&data.ticket&&data.device_id){
			if(token = this.Auth.verifyToken(data.token)){
				//get access_token
				wx_token = yield Public.wxToken(this,self);
				//wechat unbind 
				let err = yield this.plugin.weixin.unbind({"access_token":wx_token.access_token,"ticket":data.ticket,"openid":token.openid,"device_id":data.device_id});
				// let err = yield this.plugin.weixin.compelUnbind({"access_token":wx_token.access_token,"ticket":data.ticket,"openid":token.openid,"device_id":data.device_id});
				console.log(err)
				if(err.base_resp){//ugen unbind
					if(err.base_resp.errcode==0){
						let _data={
							"_device_obj_id":data.deviceID,
							"_user_obj_id":token._id,
							"seat":null,
							"status":0
						}
						if(yield self.userdeviceDao.updata(_data)){
								yield self.deviceDao.updataUserTime(data.deviceID);
								yield self.userdeviceinfoDao.updateStatus_2(data.deviceID,token._id);
								this.body = {"code":0,"msg":"success"};
						} else
							this.body = {"code":500,"msg":"系统错误"};
					} else
						this.body = {"code":503,"msg":"wchat error"};
				} else
					this.body = {"code":503,"msg":"wchat error"};
			} else 
				this.body = {"code":502,"msg":"token无效"};
		} else 
			this.body = {"code":501,"msg":"缺少参数"};

	}

	*delInfo(){
		let data = this.request.body;
		let token,info;
		if(data.token&&data._user_device_info_obj_id){
			if(token = this.Auth.verifyToken(data.token)){
				if(yield self.userdeviceinfoDao.updataStatus(data._user_device_info_obj_id)){
					this.body = {"code":0,"msg":"success"};

				} else
					this.body = {"code":500,"msg":"系统错误"};
			} else 
				this.body = {"code":502,"msg":"token无效"};
		} else 
			this.body = {"code":501,"msg":"缺少参数"};

	

	}

	*getNewMessage(){

		let data = this.request.body;
		let token,info,devices;
		if(data.token&&data.deviceID&&data.year){
			if(token = this.Auth.verifyToken(data.token)){
				//select mongo  and screen isread=1or0
				if(devices = yield self.userdeviceinfoDao.selectNew(data.deviceID,data.year)){
					let isread = new Array(12);
					for(let i=1;i<=12;i++){
						for(let i1=0;i1<devices.length;i1++){
							if(moment(devices[i1].createTime).format("M")==i){
								if(devices[i1].isread==0){
									isread[i-1]=1;
									break;
								}
								if(devices[i1].isread==1){
									isread[i-1]=0;

								}
							}
						}
					}
					this.body = {"code":0,"msg":"success","data":isread};
				} else
					this.body = {"code":500,"msg":"系统错误"};
			} else 
				this.body = {"code":502,"msg":"token无效"};
		} else 
			this.body = {"code":501,"msg":"缺少参数"};

	
		
	}

	*getDeviceInfo(){
		let data = this.request.body;
		let token,devices,deviceRecode;
		let _data =[];
		if(data.token&&data.deviceID[0]){
			if(token = this.Auth.verifyToken(data.token)){
				//select mongo screen device seat
				if(deviceRecode = yield self.userdeviceDao.selectBindNums(data.deviceID,token._id)){
					for(let i=0;i<deviceRecode.length;i++){

						_data[i] ={
									"weight":"",
									"seat":new Array(4),
									"new":false
						};	 	
					}
				
					//select mongo screen isread=1or0
					if(devices = yield self.userdeviceinfoDao.selects(data.deviceID,token._id)){

// console.log(devices_+'\n--------------')
// console.log(deviceRecode)
						//add weight
						for(let i=0;i<devices.length;i++){
							if(devices[i]){
								_data[i].weight=devices[i].weight;
							}
							
						}
						 //_data.weight=devices[devices.length-1].info.weight;
 						//screen isread
						for(let i=0;i<devices.length;i++){
							for(let i1=0;i1<devices[i].length;i1++){
								if(devices[i][i1].isread==0){
									_data[i].new=true;
									break;
								}
								if(devices[i][i1].isread==1){
									_data[i].new=false;
								}

							}
						}


						
							// for(let i=0;i<devices.length;i++){
							// 		if(devices[i].isread==0){
							// 			_data.new=true;
							// 			break;
							// 		}
							// 		if(devices[i].isread==1){
							// 			_data.new=false;
							// 		}
							// }
					}
				// //screen  seat
				for(let i=0;i<deviceRecode.length;i++){
					for(let s=1;s<=4;s++){
						for(let i1=0;i1<deviceRecode[i].length;i1++){
							if(deviceRecode[i][i1].seat==s){
								_data[i].seat[s-1]=0;
								if(deviceRecode[i][i1]._user_obj_id==token._id){
									_data[i].seat[s-1]=1
								}
								break;
							}
						}
					}

				}

						
							// for(let i=1;i<=4;i++){
							// 	for(let i1=0;i1<deviceRecode.length;i1++){
							// 		if(deviceRecode[i1].seat==i){
							// 				_data.seat[i-1]=0;
							// 			if(deviceRecode[i1]._user_obj_id==token._id){
							// 				_data.seat[i-1]=1;
							// 			}
							// 			break;
							// 		}
							// 	}
							// }
						this.body = {"code":0,"msg":"success","data":_data};
					
				} else
					this.body = {"code":500,"msg":"系统错误"};
			} else 
				this.body = {"code":502,"msg":"token无效"};
		} else 
			this.body = {"code":501,"msg":"缺少参数"};

	
		
	}


	*activate(){
		let data = this.request.body;
		let token;
		if(data.token&&data.deviceID){
			if(token = this.Auth.verifyToken(data.token)){
				//select device bind user count <4 bind : >4 102
				if(yield Public.actBind(this,self,data.deviceID,token._id)){
						this.body = {"code":0,"msg":"success","data":1};
				} else 
					this.body = {"code":0,"msg":"success","data":102};
			} else 
				this.body = {"code":502,"msg":"token无效"};
		} else 
			this.body = {"code":501,"msg":"缺少参数"};		
	}



	// *getInfo(){
	// 	let data = this.request.body;
	// 	let token,deviceinfo;
	// 	if(data.token&&data._user_device_info_obj_id){
	// 		if(token = this.Auth.verifyToken(data.token)){
	// 			//select user_device_info deviceinfo
	// 			if(deviceinfo = yield self.userdeviceinfoDao.selectInfo(data._user_device_info_obj_id)){
	// 				//user_device_info isread=1 by id
	// 				yield self.userdeviceinfoDao.updataRead(data._user_device_info_obj_id);
	// 				this.body = {"code":0,"msg":"success","data":deviceinfo}
	// 			} else 
	// 				this.body = {"code":500,"msg":"系统错误"};
	// 		} else 
	// 			this.body = {"code":502,"msg":"token无效"};
	// 	} else 
	// 		this.body = {"code":501,"msg":"缺少参数"};


	// }
	*getInfo() {
		let data = this.request.body;
		let token, deviceinfo;
		if (data.token && data.id) {
		    if (token = this.Auth.verifyToken(data.token)) {
		        //select user_device_info deviceinfo
		        if (deviceinfo = yield self.userdeviceinfoDao.selectInfo(data.id)) {
		            //user_device_info isread=1 by id
		            yield self.userdeviceinfoDao.updataRead(data.id);
		            this.body = {"code": 0, "msg": "success", "data": deviceinfo}
		        } else
		            this.body = {"code": 500, "msg": "系统错误"};
		    } else
		        this.body = {"code": 502, "msg": "token无效"};
		} else
		    this.body = {"code": 501, "msg": "缺少参数"};
	}

	*getDetail() {
		let data = this.request.body;
		let token, detail;
		if (data.token && data.deviceID && data.key && data.tag) {
			if (token = this.Auth.verifyToken(data.token)) {
				if (detail = yield self.userdeviceinfoDao.seletDetail(token._id, data)) {
					this.body = {"code": 0, "msg": "success", "data": detail};
				} else
					this.body = {"code": 500, "msg": "系统错误"};
			} else
				this.body = {"code": 502, "msg": "token无效"};
		} else
			this.body = {"code": 501, "msg": "缺少参数"};
	}

	*getInfoLists(){
		let data = this.request.body;
		let token,devicelists;
		if(data.token&&data.deviceID&&data.date&&data.page){
			if(token = this.Auth.verifyToken(data.token)){
				//select user_device_info devicelist
				if(devicelists = yield self.userdeviceinfoDao.selectlists(data.deviceID,token._id,data.date,data.page)){
					//user_device_info isread=1 by month

						yield self.userdeviceinfoDao.updataMonth(data.deviceID,token._id,data.date);

					this.body = {"code":0,"msg":"success","data":devicelists};
				} else
					this.body = {"code":0,"msg":"sucess","data":null};
			} else 
				this.body = {"code":502,"msg":"token无效"};
		} else 
			this.body = {"code":501,"msg":"缺少参数"};

		
	}


	*getInfoList(){
		let data = this.request.body;
		let token,devicelists;
		if(data.token&&data.deviceID&&data.key&&data.tag){
			if(token = this.Auth.verifyToken(data.token)){
				//select user_device_info deviceSinglelist
				if(devicelists = yield self.userdeviceinfoDao.selectlist(data.deviceID,token._id,data.tag)){
					this.body = {"code":0,"msg":"success","data":devicelists};
				} else
					this.body = {"code":0,"msg":"success","data":null};
			} else 
				this.body = {"code":502,"msg":"token无效"};
		} else 
			this.body = {"code":501,"msg":"缺少参数"};

		
	}






}

function *wxToken(that){
	if(that){
		let tokenRow,accessRow,jsRow,wx_token;
		if(tokenRow = yield self.accesstokenDao.select()){
			wx_token = {"access_token":tokenRow.access_token,"js_token":tokenRow.js_token};
			return wx_token;
		} else {
			if((accessRow = yield that.plugin.weixin.getAccessToken())&&(jsRow = yield this.plugin.weixin.getJsToken({"access_token":accessRow.access_token}))){
				tokenRow = yield self.accesstokenDao.insert(accessRow.access_token,jsRow.ticket);
				wx_token = {"access_token":tokenRow.access_token,"js_token":tokenRow.js_token};
				return wx_token;
			} else
				return false;
		}
	} else 
		return false;
}



module.exports = DeviceController;