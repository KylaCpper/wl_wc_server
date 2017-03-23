const DaoBase = require('./DaoBase');
class ControllerBase{
	constructor(models) {
        this.models = models;
    }
    
	daoLoader(daoClass){
		let dao = new daoClass(this.models);
		if(dao instanceof DaoBase){
			return dao;
		}else{
			console.error(`must be extends DaoBase`);
		}
	}
}
module.exports = ControllerBase;
