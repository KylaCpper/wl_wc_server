const request = require("koa-request");
class Public{


}

//wechat user bind device return arr deivceids
Public.wcDevice = function*(that,self,openid){
let deviceids = [];
			let wx_token = yield Public.wxToken(that,self);
			let list = yield request.get("https://api.weixin.qq.com/device/get_bind_device?access_token="+wx_token.access_token+'&openid='+openid)
			list = JSON.parse(list.body);
			list = list.device_list;
		
			for(let i=0;i<list.length;i++){
				let device = yield self.deviceDao.select(list[i].device_id);
				if(!device){
					device = yield self.deviceDao.insert(list[i].device_id);
				}

				deviceids[i]=device._id
			}

				return deviceids;




}
//ugen user bind device  return arr deviceids
Public.mDevice= function*(that,self,user_id){
			let deviceids =yield self.userdeviceDao.selectBindDevices(user_id);
			
				return deviceids;
			
			
}




//if(!user) add user and info  insert mongo  return user  
Public.user = function*(that,self,openid){
  			let user = yield self.userDao.select(openid);
			if(!user){
			  	user = yield self.userDao.insert(openid);
			}
  			let userinfo = yield self.userinfoDao.selectInfo(user._id);
  			//no userinfo
			if(userinfo=="base"){
			  return {"_id":user._id,"base":"base"};
			}
			//get userinfo insert mongo
			if(!userinfo){
			  		let wx_token = yield Public.wxToken(that,self);
					let userinfoRow = yield that.plugin.weixin.getUnion({
							"access_token":wx_token.access_token,
							"openid":openid
					});
					if(userinfoRow.openid){
							if(userinfoRow.subscribe_time){
								yield self.userinfoDao.insert(user._id,userinfoRow)
				  				return {"_id":user._id};									
							}

							yield self.userinfoDao.insert(user._id)

					}
					return false;
			}

			return {"_id":user._id};

}
//wechat ugen      user bind device contrast
Public.contrast = function*(that,self,wcde,mde,user_id){
let positive=0;

		if(wcde.length>=mde.length){
			positive=0;
			arr1=wcde;
			arr2=mde;

		} else {
			positive=1;
			arr1=mde;
			arr2=wcde;

		}
		a1=arr1.length;
		a2=arr2.length;
		if(a2==0){
			a2=1;
		}
		for(let i=0;i<a1;i++){
			for(let i1=0;i1<a2;i1++){
							if(arr1[i]==arr2[i1]){

								break;
							}
							if(i1==a2-1){
								//wechat there ugen no   bind
								if(positive==0){
									yield Public.bind(that,self,arr1[i],user_id);
								
								} else {
									if(arr2[i])
									yield Public.bind(that,self,arr2[i],user_id);
								}
							}
			}
			for(let i1=0;i1<a1;i1++){
							if(arr1[i1]==arr2[i]){
								break;
							}
							//ugen there wechat no   unbind
							if(i1==(a1-1)){ 
								if(positive==0){
									if(arr2[i])
									yield Public.unbind(that,self,arr2[i],user_id)
								} else {
									yield Public.unbind(that,self,arr1[i],user_id)
								}
							}
			}

		}

}

//unbind
Public.unbind = function*(that,self,de_id,user_id){
			let data = {
					 "_device_obj_id":de_id,
					 "_user_obj_id":user_id,
					 "seat":null,
					 "status":0
			};
			//updata userdevice
			yield self.userdeviceDao.updata(data);
			yield self.deviceDao.updataUserTime(de_id);
			yield self.userdeviceinfoDao.updateStatus_2(de_id,user_id);
}
//bind
Public.bind = function*(that,self,de_id,user_id){
			
let max =0;//count>=4?
let info =1;//userinfo?
let seat;
			let data = {
					 "_device_obj_id":de_id,
					 "_user_obj_id":user_id,
					 "seat":null,
					 "status":0
			};
		
			//select findone userdevice 
			let bindDevice= yield self.userdeviceDao.selectStatus(de_id,user_id)

			let userinfo = yield self.userinfoDao.selectInfo(user_id);
			//no userinfo
			if(userinfo=="base"){
				info = 0;
			}


			//deivce bind user count>4?
			let bindDevices = yield self.userdeviceDao.selectBindNum(de_id)

  			if(bindDevices.length>=4){
 				max = 1;
  			}

	
  			//new
  			if(!bindDevice){
  				if(info==1){
  					if(max==0){
						data.seat=yield Public.screenSeat(bindDevices);

		  				data.status=1;
		  				yield self.userdeviceDao.insert(data);
		  				yield self.deviceDao.updataUserTime(de_id);
  					}
  					if(max==1){
						data.seat=null;
		  				data.status=102;
		  				yield self.userdeviceDao.insert(data);	
  					}
  				}
	  			if(info==0){
					data.seat=null;
			  		data.status=101;
			  		yield self.userdeviceDao.insert(data);		
	  			}

	  			return;
  			}
		
  			if(info==1){

  				if(max==0){
					data.seat=yield Public.screenSeat(bindDevices);
	  				data.status=1;
	  				yield self.userdeviceDao.updata(data);
	  				yield self.deviceDao.updataUserTime(de_id);
	  		
				}

  				if(max==1){
					data.seat=null;
		  			data.status=102;
		  			yield self.userdeviceDao.updata(data);
		  		
  				}

  			}





}

//actdevice
Public.actBind = function*(that,self,de_id,user_id){
			let data = {
					 "_device_obj_id":de_id,
					 "_user_obj_id":user_id,
					 "seat":null,
					 "status":0
			};
		
			//deivce bind user count>4?
			let bindDevices = yield self.userdeviceDao.selectBindNum(de_id)

  			if(bindDevices.length>=4){
 					data.seat=null;
		  			data.status=102;
		  			yield self.userdeviceDao.updata(data);
		  			return 0;	
  			} else {
					data.seat=yield Public.screenSeat(bindDevices);
	  				data.status=1;
	  				yield self.userdeviceDao.updata(data);
	  				yield self.deviceDao.updataUserTime(de_id);
	  				return 1;


  			}

	
}




//screen seat
Public.screenSeat = function*(bindDevices){
let seat;

					//screen unrepeat seat
		  			end:
		  			for(let i=1;i<=4;i++){
		  				for(let i1=0;i1<bindDevices.length;i1++){
				  				if(bindDevices[i1].seat!=i){
						  				if(i1==(bindDevices.length-1)){
						  					seat=i;
						  			
						  					break end;
						  				}
				  				} else 
				  					break;
		  				}
		  			}
		  			if(bindDevices.length==0){
						seat=1

					}
				
	  				return seat;

}









//wchat token
Public.wxToken = function*(that,self){
	if(that){
		let tokenRow,accessRow,jsRow,wx_token;
		if(tokenRow = yield self.accesstokenDao.select()){
			wx_token = {"access_token":tokenRow.access_token,"js_token":tokenRow.js_token};
			return wx_token;
		} else {
			if((accessRow = yield that.plugin.weixin.getAccessToken())&&(jsRow = yield that.plugin.weixin.getJsToken({"access_token":accessRow.access_token}))){
				tokenRow = yield self.accesstokenDao.insert(accessRow.access_token,jsRow.ticket);
				wx_token = {"access_token":tokenRow.access_token,"js_token":tokenRow.js_token};
				return wx_token;
			} else
				return false;
		}
	} else 
		return false;
}

module.exports = Public;