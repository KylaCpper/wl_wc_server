const DBInterface = require('./DBInterface');
const mongoose = require('mongoose');
const fs = require('fs');
class ModelLoader{
	constructor(db){
		this.db = db;
	}

	loader(path){
		let model = require(path);
		let obj = new model();
		if(obj instanceof DBInterface){
			let schema = obj.getModel();
			if(schema instanceof mongoose.Schema){
				if(obj.tabelName != undefined){
					let model = this.db.model(obj.tabelName, schema);
					return {
						model:model,
						tabelName:obj.tabelName
					}
				}else{
					console.error(`${path} please call setTabelName in init`);
					return false;
				}
			}else{
				console.error(`${path} must be extends mongoose.Schema`);
				return false;
			}
		}else{
			console.error(`${path} must be extends DBInterface`);
			return false;
		}
	}
}
module.exports = ModelLoader;