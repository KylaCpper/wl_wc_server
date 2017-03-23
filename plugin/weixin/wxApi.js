/*
author: kyla
Use: where npm install koa-request and crypto and you can go it
function: wechat hard device api
*/ 

const request= require("koa-request");
const sign = require("./jssdk/sign.js");
const crypto = require("crypto");
const url = 'https://api.weixin.qq.com/';

class wxApi {
		constructor(parmas){
	    	checkKeyExists(parmas,"appid");
	    	checkKeyExists(parmas,"secret");
	    	//checkKeyExists(parmas,"router");
			this.appid = parmas.appid;
			this.secret = parmas.secret;
			//this.router = parmas.router;

		}
		*getUserDate(parmas){
			checkKeyExists(parmas,"token");
			checkKeyExists(parmas,"openid");
			return yield this.send({url:'sns/userinfo?access_token='+parmas.token+'&openid='+parmas.openid+'&lang=zh_CN'})
		}

	    *getOpenid(parmas){
	    	checkKeyExists(parmas,"code");
	    	return yield this.send({url:'sns/oauth2/access_token?appid='+this.appid+'&secret='+this.secret+'&code='+parmas.code+'&grant_type=authorization_code'});
	       
	    };
	    //get wechat user data
	    *getUserinfo(parmas){
	    	checkKeyExists(parmas,"access_token");
	    	checkKeyExists(parmas,"openid");
			return yield this.send({url:'sns/userinfo?access_token='+parmas.access_token+'&openid='+parmas.openid+'&lang=zh_CN'});

	    };

	    *getAccessToken(){
	    		
	    	return yield this.send({url:'cgi-bin/token?grant_type=client_credential&appid='+this.appid+'&secret='+this.secret});
	    }
	    
	    *getJsToken(parmas){
	    	checkKeyExists(parmas,"access_token");
	    	return yield this.send({url:'cgi-bin/ticket/getticket?access_token='+parmas.access_token+'&type=jsapi'});
	    }



	    //get jssdk sign
		*getSign(parmas){
	    	checkKeyExists(parmas,"js_token");
	    	checkKeyExists(parmas,"url");
	    	return yield sign(parmas.js_token,parmas.url);
		}
		//get user bind device 
		*getBindDevice(parmas){
			checkKeyExists(parmas,"access_token");
	    	checkKeyExists(parmas,"openid");
			return yield this.send({url:'device/get_bind_device?access_token='+parmas.access_token+'&openid='+parmas.openid});
			
		}

		*unbind(parmas){
			checkKeyExists(parmas,"access_token");
	    	checkKeyExists(parmas,"openid");
	    	checkKeyExists(parmas,"device_id");
	    	checkKeyExists(parmas,"ticket");
            let data = {
                "ticket":parmas.ticket,
                "device_id":parmas.device_id,
                "openid":parmas.openid

            };
			return yield this.send({url:'device/unbind?access_token='+parmas.access_token,type:'post',data:data});
			
		}


		*compelUnbind(parmas){
			checkKeyExists(parmas,"access_token");
	    	checkKeyExists(parmas,"openid");
		   	let data={
	            "openid":parmas.openid,
	            "device_id":parmas.device_id
	        }
			return yield this.send({"url":'device/compel_unbind?access_token='+parmas.access_token,type:'post',data:data});
			
		}
		*sendOut(parmas){

			return yield this.send({"url":'hardware/mydevice/platform/sendmsgtodevicecloud?access_token='+parmas.access_token,type:'post',"data":parmas.data})
		}

		//set data go in device
		*setDataparmas(){
			checkKeyExists(parmas,"data");
	    	checkKeyExists(parmas,"access_token");
			return yield this.send({url:'hardware/mydevice/platform/ctrl_device?access_token='+access_token,type:'post',data,data});			
		}

		//get data from device
		*getData(parmas){
			checkKeyExists(parmas,"data");
	    	checkKeyExists(parmas,"access_token");
			return yield this.send({url:'hardware/mydevice/platform/get_device_status?access_token='+access_token,type:'post',data,data});
			
		}


		*getQrcode(parmas){
			checkKeyExists(parmas,"access_token");
			checkKeyExists(parmas,"device_num");
			checkKeyExists(parmas,"device_id_list");
	    	let data = {
			    "device_num":parmas.device_num,
			    "device_id_list":parmas.device_id_list
			}
			return yield this.send({url:'device/create_qrcode?access_token='+parmas.access_token,type:'post',data:data});
			
		}
		//user bind device state
		*getBindState(parmas){
			checkKeyExists(parmas,"access_token");
			checkKeyExists(parmas,"device_id");
			return yield this.send({url:'device/get_stat?access_token='+access_token+'&device_id='+device_id});
		}

		*getUser(parmas){
			checkKeyExists(parmas,"access_token");
			checkKeyExists(parmas,"device_id");
			checkKeyExists(parmas,"device_type");
			return yield this.send({url:'device/get_openid?access_token='+parmas.access_token+'&device_type='+parmas.device_type+'&device_id='+parmas.device_id});
		}

		*model(parmas){
			checkKeyExists(parmas,"access_token");
			checkKeyExists(parmas,"data");
				return yield this.send({url:'cgi-bin/message/template/send?access_token='+parmas.access_token,type:'post',data:parmas.data});


		}

		//wechat token sign
		wechat_token(parmas){
			checkKeyExists(parmas,"token");
			checkKeyExists(parmas,"nonce");
			checkKeyExists(parmas,"timestamp");
			checkKeyExists(parmas,"signature");


	    	var TOKEN = parmas.token;
	    	var arr = [ parmas.nonce,parmas.timestamp,TOKEN];
	    	arr.sort();
	    	var sha1 = crypto.createHash('sha1');
	    	var msg = arr[0] + arr[1] + arr[2];
	    	sha1.update(msg);
	    	msg = sha1.digest('hex');
	    	if(msg == parmas.signature) {
	        	return parmas.echostr;
	    	} 
	    	else {
	        	return false;
	    	}


		}

		receive(parmas,callback){
			checkKeyExists(parmas,"url");
			this.router.post(parmas.url,callback);
		}


		*send(parmas){
			checkKeyExists(parmas,"url");
			let data;
			if(parmas.type == 'post'){
				 if(parmas,"data"){ 
				 	data = yield request.post(url+parmas.url,{form:parmas.data});
				 	
				 }
				 else
				 	data = yield request.post(url+parmas.url);
			}
			else
				data = yield request.get(url+parmas.url);	


			if(data.statusCode == 200)
				 return JSON.parse(data.body);
			else
				 return data;
				
			
			
		}

}

function checkKeyExists(map,key){
	try{
		if(!map[key])
			throw Error(key+' is undefined');
	}
	catch(e){
			console.log(e)

	}
}
module.exports =wxApi;



