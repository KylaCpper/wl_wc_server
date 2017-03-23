const CommunicationControllerBase = require('../../core/base/CommunicationControllerBase');
const UserDeviceDao = require('../dao/UserDeviceDao');
const UserDeviceInfoDao = require('../dao/UserDeviceInfoDao');
const AccessTokenDao = require('../dao/AccessTokenDao');
const ActionLogDao = require('../dao/ActionLogDao');
const UserinfoDao = require('../dao/UserinfoDao');
const UserDao = require('../dao/UserDao');
const DeviceDao = require('../dao/DeviceDao');
const Public = require('./Public');
const moment = require("moment");
const weixin = require('../../plugin/weixin/weixin');
const wx = new weixin({"appid":"wx1f803a51ce44b64e",
			"secret":"1684023411cb9d25c4caf893a3b3b2e3"}); 
const self = {};
class CommunicationController extends CommunicationControllerBase{
	constructor(models) {
		super(models);
		self.userdeviceDao = this.daoLoader(UserDeviceDao);
		self.userdeviceinfoDao = this.daoLoader(UserDeviceInfoDao);
		self.accesstokenDao = this.daoLoader(AccessTokenDao);
		self.actionlogDao = this.daoLoader(ActionLogDao);
		self.userinfoDao = this.daoLoader(UserinfoDao);
		self.userDao = this.daoLoader(UserDao);
		self.deviceDao = this.daoLoader(DeviceDao);
		self.access_token;
		this.plugin = {};
		this.plugin.weixin = wx;
	}

	*onMessage(data){  
		let _data;
		if(data.device_id){
		 self.actionlogDao.insert(data);
		}
		
		if(data.msg_type=="bind"){
			//select wchat bind deviceid       return arr device
			let wcDevice=yield Public.wcDevice(this,self,data.open_id);
			//select user table and insert    return  user
			let user = yield Public.user(this,self,data.open_id)
			//select  ugen bind deviceid       return arr device
			let mDevice=yield Public.mDevice(this,self,user._id);
			//bind or unbind  wchat contrast ugen
			yield Public.contrast(this,self,wcDevice,mDevice,user._id);
		}		
//----------------------------------------------------------
		if(data.msg_type=="unbind"){
			let device = yield self.deviceDao.select(data.device_id);
			let user = yield self.userDao.select(data.open_id);
			_data = {
					 "_device_obj_id":device._id,
					 "_user_obj_id":user._id,
					 "seat":null,
					 "status":0
			};
			//updata userdevice
			yield self.userdeviceDao.updata(_data);
			yield self.deviceDao.updataUserTime(device._id);
			yield self.userdeviceinfoDao.updateStatus_2(data.device_id,data.open_id);
		}
//----------------------------------------------------------
		if(data.msg_type=="notify"){

			let info = JSON.parse(data.data);
			let infoData = info.info;
			if(info.type=="device"){
				let device;
				let userInfos = [];
				let _ids=[];
				//select device is be?updata device: insert device
				if(device = yield self.deviceDao.select(data.device_id)){
					if(device.updateTime){
						yield self.deviceDao.updataTime(data.device_id);
					} else {
						yield self.deviceDao.updata(data.device_id,infoData);
					}
					if(infoData.updateTime<device.userUpdatetime){

						//get user device user_ids
						let userdevices=yield self.userdeviceDao.selectBindNum(device._id);
								
						//array openid
						for(let i =0;i<userdevices.length;i++){
							_ids[i] = userdevices[i]._user_obj_id;
						}
						//get userinfo
						let userinfos = yield self.userinfoDao.selectInfos(_ids);
						let openids = yield self.userDao.selectOpen(_ids);
						//mongo z json
						for(let i=0;i<userinfos.length;i++){
								userInfos[i]={};
								userInfos[i].seat = userdevices[i].seat;
								userInfos[i].age = moment().format('YYYY')-moment(userinfos[i].birthday).format('YYYY');
								userInfos[i].user = openids[i];
								userInfos[i].sex = userinfos[i].sex;
								userInfos[i].height = userinfos[i].height;
						}
						let list= {
								"updateTime":device.userUpdatetime,
								"info":userInfos
						}
						console.log(list)
						let wx_token = yield Public.wxToken(this,self);
						//send list to device
						list=JSON.stringify(list)
						let code = yield this.plugin.weixin.sendOut({"access_token":wx_token.access_token,"data":list});
						if(code.error_code==0){

						}
					}



				} else {
						self.deviceDao.insert(data.device_id,infoData);
						return;
				}


			}
					//----------------------------------------------
			if(info.type=="user"){
				_data = {
						"deviceid":data.device_id,
						"openid":infoData.user,
						"type":data.device_type,
						"info":infoData,
							
				};

				let user = yield self.userDao.select(infoData.user);
				let device = yield self.deviceDao.select(data.device_id);
				let userinfo = yield self.userinfoDao.select(user._id);
				let weight="未设置目标体重";
				if(userinfo.toWeight){
					weight=userinfo.toWeight-infoData.weight;

				}
				//insert userdeviceinfo
				_data._device_obj_id = device._id;
				_data._user_obj_id = user._id;
				let userdeviceinfo= yield self.userdeviceinfoDao.insert(_data);
				let mould = {
						    "touser":infoData.user,
						    "template_id":"-3PtLyZpu_jnGyBvVDM3pyutXRPBPYeyFdsgkk-miME",
						    "url":"http://iot.iotface.com/oserio/view/result.html?recordId="+userdeviceinfo._id,            
						    "data":{
							    	"first":{
							    				"value":"您有新的身体数据",
							    				"color":"#173177"
							    	},	
						            "keyword1": {
									            "value":infoData.weight+"kg",
									            "color":"#173177"
						             },
						            "keyword2":{
									            "value":moment(data.create_time).format('YYYY-MM-DD HH:mm:ss'),
						                		"color":"#173177"
						             },
						            "remark":{
						             			"value":"距离目标体重还有" + Math.abs(weight) +"kg",
						                 		"color":"#173177"
						             }
						    	}
						    	

						    
				};
				mould = JSON.stringify(mould);
				//get access_token
				let wx_token = yield Public.wxToken(this,self);
				//send mould
				yield this.plugin.weixin.model({"access_token":wx_token.access_token,"data":mould});




			}
		}
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
module.exports = CommunicationController;