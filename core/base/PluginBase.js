class PluginBase{
	getPluginObj(){
		throw Error("need override method:setPluginObj. return plugin Object");
	}

	getPluginName(){
		throw Error("need override method:setPluginName. return name(String)");
	}
}
module.exports = PluginBase;