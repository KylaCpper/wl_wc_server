/*
anthor: kyla
use: where npm install wechat-crypto and xm12js and koa-request and you can go it
function: wechat's  third  auth api 
*/
const WXBizMsgCrypt = require('wechat-crypto');
const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true}); 
const url = 'https://api.weixin.qq.com/';
const require = require('koa-request');
class wxAuth {
		constructor(parmas){
			checkKeyExists(parmas,"appid");
			checkKeyExists(parmas,"eckey");
			checkKeyExists(parmas,"secret");
			checkKeyExists(parmas,"token");
			const crypt = new WXBizMsgCrypt(parmas.token, parmas.eckey, parmas.appid);

			this.appid = parmas.appid;
			this.secret = parmas.secret;
			this.eckey = parmas.eckey;
			this.token = parmas.token;

		}
	decrypt(parmas,callback){
			checkKeyExists(parmas,"encrypt");
		    let xml = crypt.decrypt(parmas.encrypt);
            xmlParser.parseString(xml.message,callback);  
	}


//component access token
	get_access_token_com(parmas){
			checkKeyExists(parmas,"ticket");
            let data = {
                        "component_appid":this.appid ,
                        "component_appsecret": this.secret, 
                        "component_verify_ticket": parmas.ticket
            };
            
			return yield this.send({url:'cgi-bin/component/api_component_token',data:data,type:'post'});
	
		
	}

	get_pre_code(parmas){
			checkKeyExists(parmas,"access_token_com");
			let	data={
						"component_appid": this.appid

			 };
			

				return yield this.send({url:'cgi-bin/component/api_create_preauthcode?component_access_token='+parmas.access_token_com,data:data,type:'post'});
	
			
	}

//auth access token and refresh token
 	get_access_token_auth(parmas){
 			checkKeyExists(parmas,"access_token_com");
 			checkKeyExists(parmas,"auth_code");
			let	data={
					"component_appid": this.appid,
					"authorization_code": parmas.auth_code
			};
			

				return yield this.send({url:'cgi-bin/component/api_query_auth?component_access_token='+parmas.access_token_com,data:data,type:'post'});
	
			
	}
//refresh auth access token and refresh token
	refresh_access_token_auth(access_token_com, access_token_refresh, auth_appid){
			checkKeyExists(parmas,"access_token_com");
			checkKeyExists(parmas,"access_token_refresh");
			checkKeyExists(parmas,"auth_appid");
			let	data={
					"component_appid": this.appid,
					"authorizer_appid": parmas.auth_appid,
					"authorizer_refresh_token": parmas.access_token_refresh,
			};
		

			return yield this.send({url:'cgi-bin/component/api_authorizer_token?component_access_token='+parmas.access_token_com,data:data,type:'post'});


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
module.exports =wxAuth;



