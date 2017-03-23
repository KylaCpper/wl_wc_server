'use strict';
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const ModelLoader = require('./ModelLoader');
class DBManager{
	constructor(url,options){
		this.db = mongoose.createConnection(url,options);
		this.dbManager = {};
		this.db.on('error',(msg)=>{
			console.log("error");
			console.log(msg);
		});
		this.db.on('open',(msg)=>{
			console.log("open");
		});
		this.db.on('reconnected',(msg)=>{
			console.log("reconnected");
		});
		this.db.on('disconnected',(msg)=>{
			console.log("disconnected");
		});
		this.db.on('close',(msg)=>{
			console.log("close");
		});
		this.db.on('connected',(msg)=>{
			console.log("connected");
		});
	}

	loadModel(){
		let dbModelFilePath = path.resolve(__dirname, '../../app/model');
		let models = fs.readdirSync(dbModelFilePath);
		let that = this;
		let modelLoader = new ModelLoader(that.db);
		models.forEach(function(item){
			let modelPath = path.join(dbModelFilePath,item)
			if(fs.statSync(modelPath).isFile()){
				let model = modelLoader.loader(modelPath);
				that.dbManager[model.tabelName] = model.model;
			}
		});
		return this.dbManager;
	}
}

module.exports = DBManager;