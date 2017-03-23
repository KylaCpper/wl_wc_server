const PluginBase = require('../../core/base/PluginBase');
const Weixin = require('./weixin');
class WeixinPlugin extends PluginBase{
	getPluginName(){
		return "weixin";
	}

	getPluginObj(){
		return new Weixin({
			appid:"wx1f803a51ce44b64e",
			secret:"1684023411cb9d25c4caf893a3b3b2e3",
			eckey:"",
			token:""
		});
	}
}
module.exports = WeixinPlugin;