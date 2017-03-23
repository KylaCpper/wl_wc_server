const WXBizMsgCrypt = require('wechat-crypto');
const request = require('koa-request');
const sign = require("./jssdk/sign.js");
const url = 'https://api.weixin.qq.com/';
const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
class Weixin {
    constructor(params) {
        checkKeyExists(params, "appid");
        checkKeyExists(params, "secret");
        this.appid = params.appid;
        this.secret = params.secret;
        if (!!params.eckey && !!params.token) {
            this.eckey = params.eckey;
            this.token = params.token;
            this.crypt = new WXBizMsgCrypt(this.token, this.eckey, this.appid);
            console.log("wxauth");
        }else{
			console.log("wxapi");
        }
    }

    test(){
    	console.log(111);
    }

    * getUserDate(params) {
        checkKeyExists(params, "token");
        checkKeyExists(params, "openid");
        return yield this.send({ url: 'sns/userinfo?access_token=' + params.token + '&openid=' + params.openid + '&lang=zh_CN' })
    }
    *getUnion(params){
        checkKeyExists(params, "access_token");
        checkKeyExists(params, "openid");
        return yield this.send({ url: 'cgi-bin/user/info?access_token='+params.access_token+'&openid='+params.openid+'&lang=zh_CN' })


    }

    * getOpenid(params) {
        checkKeyExists(params, "code");
        return yield this.send({ url: 'sns/oauth2/access_token?appid=' + this.appid + '&secret=' + this.secret + '&code=' + params.code + '&grant_type=authorization_code' });

    };

    //get wechat user data
    * getUserinfo(params) {
        checkKeyExists(params, "access_token");
        checkKeyExists(params, "openid");
        return yield this.send({ url: 'sns/userinfo?access_token=' + params.access_token + '&openid=' + params.openid + '&lang=zh_CN' });

    };

    * getAccessToken() {
        return yield this.send({ url: 'cgi-bin/token?grant_type=client_credential&appid=' + this.appid + '&secret=' + this.secret });
    }

    * getJsToken(params) {
        checkKeyExists(params, "access_token");
        return yield this.send({ url: 'cgi-bin/ticket/getticket?access_token=' + params.access_token + '&type=jsapi' });
    }
    *model(parmas){
        checkKeyExists(parmas,"access_token");
        checkKeyExists(parmas,"data");
        return yield this.send({url:'cgi-bin/message/template/send?access_token='+parmas.access_token,type:'post',data:parmas.data});


    }


    //get jssdk sign
    *getSign(parmas){
        checkKeyExists(parmas,"js_token");
        checkKeyExists(parmas,"url");
        return yield sign(parmas.js_token,parmas.url);
    }

    //get user bind device 
    * getBindDevice(params) {
        checkKeyExists(params, "access_token");
        checkKeyExists(params, "openid");
        return yield this.send({ url: 'device/get_bind_device?access_token=' + params.access_token + '&openid=' + params.openid });

    }

    * unbind(params) {
        checkKeyExists(params, "access_token");
        checkKeyExists(params, "openid");
        checkKeyExists(params, "device_id");
        checkKeyExists(params, "ticket");
        let data = {
            "ticket": params.ticket,
            "device_id": params.device_id,
            "openid": params.openid

        };

        data=JSON.stringify(data)



        return yield this.send({ url: 'device/unbind?access_token=' + params.access_token, type: 'post', data: data });
    }


    * compelUnbind(params) {
        checkKeyExists(params, "access_token");
        checkKeyExists(params, "openid");
        let data = {
            "openid": params.openid,
            "device_id": params.device_id
        }
        data=JSON.stringify(data)
        return yield this.send({ url: 'device/compel_unbind?access_token=' + params.access_token, type: 'post', data: data });
    }

    * sendOut(params) {
        checkKeyExists(params, "data");
        checkKeyExists(params, "access_token");
        return yield this.send({ url: 'hardware/mydevice/platform/sendmsgtodevicecloud?access_token=' + params.access_token, type: 'post', "data": params.data })
    }

    //set data go in device
    * setDeviceData(params) {
        checkKeyExists(params, "data");
        checkKeyExists(params, "access_token");
        return yield this.send({ url: 'hardware/mydevice/platform/ctrl_device?access_token=' + access_token, type: 'post', data, data });
    }

    //get data from device
    * getDeviceData(params) {
        checkKeyExists(params, "data");
        checkKeyExists(params, "access_token");
        return yield this.send({ url: 'hardware/mydevice/platform/get_device_status?access_token=' + access_token, type: 'post', data, data });

    }


    * getQrcode(params) {
            checkKeyExists(params, "access_token");
            checkKeyExists(params, "device_num");
            checkKeyExists(params, "device_id_list");
            let data = {
                "device_num": params.device_num,
                "device_id_list": params.device_id_list
            }
            return yield this.send({ url: 'device/create_qrcode?access_token=' + params.access_token, type: 'post', data: data });

        }
        //user bind device state
        * getBindState(params) {
            checkKeyExists(params, "access_token");
            checkKeyExists(params, "device_id");
            return yield this.send({ url: 'device/get_stat?access_token=' + access_token + '&device_id=' + device_id });
        }

    * getUser(params) {
        checkKeyExists(params, "access_token");
        checkKeyExists(params, "device_id");
        checkKeyExists(params, "device_type");
        return yield this.send({ url: 'device/get_openid?access_token=' + params.access_token + '&device_type=' + params.device_type + '&device_id=' + params.device_id });
    }

    * get_access_token_com(params) {
        checkKeyExists(params, "ticket");
        let data = {
            "component_appid": this.appid,
            "component_appsecret": this.secret,
            "component_verify_ticket": params.ticket
        };
        return yield this.send({ url: 'cgi-bin/component/api_component_token', data: data, type: 'post' });
    }

    * get_pre_code(params) {
        checkKeyExists(params, "access_token_com");
        let data = {
            "component_appid": this.appid
        };
        return yield this.send({ url: 'cgi-bin/component/api_create_preauthcode?component_access_token=' + params.access_token_com, data: data, type: 'post' });
    }

    //auth access token and refresh token
    * get_access_token_auth(params) {
        checkKeyExists(params, "access_token_com");
        checkKeyExists(params, "auth_code");
        let data = {
            "component_appid": this.appid,
            "authorization_code": params.auth_code
        };
        return yield this.send({ url: 'cgi-bin/component/api_query_auth?component_access_token=' + params.access_token_com, data: data, type: 'post' });
    }

    //refresh auth access token and refresh token
    * refresh_access_token_auth(params) {
        checkKeyExists(params, "access_token_com");
        checkKeyExists(params, "access_token_refresh");
        checkKeyExists(params, "auth_appid");
        let data = {
            "component_appid": this.appid,
            "authorizer_appid": params.auth_appid,
            "authorizer_refresh_token": params.access_token_refresh,
        };
        return yield this.send({ url: 'cgi-bin/component/api_authorizer_token?component_access_token=' + params.access_token_com, data: data, type: 'post' });
    }

    * send(params) {
        checkKeyExists(params, "url");
        let data;
        if (params.type == 'post') {
            if (params, "data") {
                data = yield request.post(url + params.url, { form: params.data });
            } else
                data = yield request.post(url + params.url);
        } else
            data = yield request.get(url + params.url);
        if (data.statusCode == 200)
            return JSON.parse(data.body);
        else
            return data;
    }

    //wechat token sign
    wechat_token(params) {
        checkKeyExists(params, "token");
        checkKeyExists(params, "nonce");
        checkKeyExists(params, "timestamp");
        checkKeyExists(params, "signature");
        var TOKEN = params.token;
        var arr = [params.nonce, params.timestamp, TOKEN];
        arr.sort();
        var sha1 = crypto.createHash('sha1');
        var msg = arr[0] + arr[1] + arr[2];
        sha1.update(msg);
        msg = sha1.digest('hex');
        if (msg == params.signature) {
            return params.echostr;
        } else {
            return false;
        }
    }

    decrypt(params, callback) {
        checkKeyExists(params, "encrypt");
        let xml = crypt.decrypt(params.encrypt);
        xmlParser.parseString(xml.message, callback);
    }
}

function checkKeyExists(map, key) {
    if (!map[key])
        throw new Error(key + " is undefined");
}
module.exports = Weixin;
