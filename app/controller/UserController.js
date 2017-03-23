const UserDao = require('../dao/UserDao');
const UserinfoDao = require('../dao/UserinfoDao');
const UserDeviceDao = require('../dao/UserDeviceDao');
const UserDeviceInfoDao = require('../dao/UserDeviceInfoDao');
const AccessTokenDao = require('../dao/AccessTokenDao');
const ActionLogDao = require('../dao/ActionLogDao');
const DeviceDao = require('../dao/DeviceDao');
const CommunicationControllerBase = require('../../core/base/CommunicationControllerBase');
const Public = require('./Public');
const moment = require('moment');
const self = {};
class UserController extends CommunicationControllerBase{
	constructor(models) {
		super(models);
		self.userdeviceDao = this.daoLoader(UserDeviceDao);
		self.userdeviceinfoDao = this.daoLoader(UserDeviceInfoDao);
		self.userDao = this.daoLoader(UserDao);
		self.userinfoDao = this.daoLoader(UserinfoDao);
		self.accesstokenDao = this.daoLoader(AccessTokenDao);
		self.actionlogDao = this.daoLoader(ActionLogDao);
		self.deviceDao = this.daoLoader(DeviceDao);
		self.userdeviceDao = this.daoLoader(UserDeviceDao);
		self.access_token;
		//self.accessToken = this.accessToken();
		//self.a = this;
	}
	*test(){
						let newtoken = this.Auth.newToken({
							openid:"oW2Ljw0icrKjHrvR0_YBa1EqzqsQ",
							_id:"58512b4c56fc7220182a5a12"
						});	

						this.body=newtoken;

let data ={


"_device_obj_id":"58413315cbb61918e03c49e9",
"_user_obj_id":"1",
"seat":3,
"status":1

}



          yield self.userdeviceDao.insert(data);








	}
	*userLogin(){
		let data = this.request.body;
		let token,userRow,userinfoRow,newtoken;
		if(data.token){
			//de token ==true? 0 data : 500 
			if(token = this.Auth.verifyToken(data.token)){
				//select mongo by _id != null  select userinfo return
				if(userRow = yield self.userDao.select(token.openid)){
					if(userinfoRow = yield self.userinfoDao.select(userRow._id)){
						yield self.userDao.updata(token.openid);
						//add new token
						newtoken = this.Auth.newToken({
							openid:token.openid,
							_id:userRow._id
						});	
						let age=Math.round((new Date-new Date(userinfoRow.birthday))/60/60/24/365/1000);
						userinfoRow=JSON.parse(JSON.stringify(userinfoRow))
						userinfoRow.age=age;
						this.body = {"code":0,"msg":"success","data":userinfoRow,"token":newtoken};
					} else
						this.body = {"code":500,"msg":"系统错误"};
				} else
					this.body = {"code":500,"msg":"系统错误"};
			} else 
				this.body = {"code":502,"msg":"token验证错误"};
		} else {
			if(data.code){
				//get openid by code and select user mongo ==repart?
				let user = yield this.plugin.weixin.getOpenid({"code":data.code});
				//if unrepart get userinfo by code and insert user and userinfo and add new token return
				if(!(userRow =yield self.userDao.select(user.openid))){
					let userinfo = yield this.plugin.weixin.getUserDate({"token":user.access_token,"openid":user.openid});
					userRow = yield self.userDao.insertTime(user.openid);
					//add new token
					if(userinfo.openid){
						if(userinfo.nickname){
							userinfoRow = yield self.userinfoDao.insert(userRow._id,userinfo);

						} else {//no look
							userinfoRow = yield self.userinfoDao.insert(userRow._id);
						}

					}
					 newtoken = this.Auth.newToken({
						openid:user.openid,
						_id:userRow._id
					});	
				} else {//if repart select userinfo and add new token return
					if(userinfoRow = yield self.userinfoDao.select(userRow._id)){
						yield self.userDao.updata(userRow.username);
						//add new token
						newtoken = this.Auth.newToken({
							openid:user.openid,
							_id:userRow._id
						});
					} else {
						let userinfo = yield this.plugin.weixin.getUserDate({"token":user.access_token,"openid":user.openid});
						//add new token
						if(userinfo.openid){
							if(userinfo.nickname){
								userinfoRow = yield self.userinfoDao.insert(userRow._id,userinfo);

							} else {//no look
								userinfoRow = yield self.userinfoDao.insert(userRow._id);
							}
						}

						//add new token
						newtoken = this.Auth.newToken({
							openid:user.openid,
							_id:userRow._id
						});


					}

				}

					let age=Math.round((new Date-new Date(userinfoRow.birthday))/60/60/24/365/1000);
					userinfoRow=JSON.parse(JSON.stringify(userinfoRow))
					userinfoRow.age=age;
					this.body = {"code":0,"msg":"success","data":userinfoRow,"token":newtoken};



			} else 
				this.body = {"code":501,"msg":"缺少参数"};
		}


		


	}




	*getAccessToken(){
		let data = this.request.body;
		let token,accessRow,jsRow,wx_token;
		if(data.token){
			if(token = this.Auth.verifyToken(data.token)){
				//get access_token
				if(wx_token = yield Public.wxToken(this,self)){
					this.body = {"code":0,"msg":"success","data":wx_token.access_token};
				} else
					this.body = {"code":500,"msg":"系统错误"};
			} else 
				this.body = {"code":502,"msg":"token验证错误"};
		} else
			this.body = {"code":501,"msg":"缺少参数"};
	}



	*getJsSign(){
		
		let data = this.request.body;
		let token,wx_token,sign;
		if(data.token&&data.url){
			if(token = this.Auth.verifyToken(data.token)){
				//get js_token
				wx_token = yield Public.wxToken(this,self);
				//get sign
				if(sign = yield this.plugin.weixin.getSign({"js_token":wx_token.js_token,"url":data.url})){
					this.body = {"code":0,"msg":"success","data":sign};
				} else
					this.body = {"code":500,"msg":"系统错误"};
			} else 
				this.body = {"code":502,"msg":"token验证错误"};
		} else
			this.body = {"code":501,"msg":"缺少参数"};
	



	}


	*updateInfo(){
		let data = this.request.body;
		let token,userRow;
		if(data.token&&data.sex&&data.height&&data.birthday){
			if(token = this.Auth.verifyToken(data.token)){
				let age=Math.round((new Date-new Date(data.birthday))/60/60/24/365/1000);
				if(age <= 80&&age >= 10&&data.height >= 100&&data.height<=220){	
					//updata mongo by userinfo
					if(yield self.userinfoDao.updata(token._id,data)){
					    let deviceid = yield self.userdeviceDao.selectBindDevice(token._id);
						    for(let i=0;i<deviceid.length;i++){
						    	yield Public.bind(this,self,deviceid[i],token._id);
						    }
							//updata mongo by device userupdatetime
							let deviceids= yield self.userdeviceDao.selectDevices(token._id);
							yield self.deviceDao.updataUserTimes(deviceids);
							this.body = {"code":0,"msg":"success","data":age};
					} else
					    this.body = {"code":500,"msg":"系统错误"};
				} else
					this.body = {"code":503,"msg":"参数不符规格"};
			} else 
				this.body = {"code":502,"msg":"token验证错误"};

		} else 
		 	this.body = {"code":501,"msg":"缺少参数"};

	}

}





module.exports = UserController;