const fs = require('fs');
const path = require('path');
const pluginPath = path.join(__dirname, '..','..','plugin');
const PluginBase = require('./PluginBase');
class PluginLoader{
	constructor(app){
		let plugins = fs.readdirSync(pluginPath);
		let pluginMap = {};
		//遍历plugin目录
		plugins.forEach(function(item){
		    let dirPath = pluginPath + path.sep + item;
		    //获取子目录
		    if(fs.statSync(dirPath).isDirectory()){
		    	let file = dirPath+path.sep+"main.js";
		    	//检查子目录下的main文件是否存在
		    	if(fs.statSync(file).isFile()){
		    		let plugin = require(file);
		    		let obj = new plugin();
		    		//验证加载对象类型
		    		if(!(obj instanceof PluginBase)){
		    			errorLog(obj.constructor.name,`${obj.constructor.name} must be extends PluginBase`);
		    			return;
		    		}
		    		//验证名字是否是字符串
		    		let name = obj.getPluginName();
		    		if(typeof name != 'string'){
		    			errorLog(obj.constructor.name,"getPluginName method must be return string");
		    			return;
		    		}
		    		let pluginObj = obj.getPluginObj();
		    		//验证插件对象不为空
		    		if(pluginObj == null){
		    			errorLog(obj.constructor.name,"getPluginObj method must be return obj not null");
		    			return;
		    		}
		    		pluginMap[name] = pluginObj;
		    	}else{
		    		console.err(`Cannot find file:${file}`);
		    	}
		    }
		});
		//设置全局插件
		app.use(function*(next){
			this.plugin = pluginMap;
			yield next;
		})
	}
}

function errorLog(className,reason){
	console.log(`can't add plugin ${className} to globals. reason:${reason}`);
}

module.exports = PluginLoader;