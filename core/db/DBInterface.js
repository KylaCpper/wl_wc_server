class DBInterface {
	constructor(db) {
        this._db = db;
        this.model = this.init();
    }

    init(){
    	throw Error("need override method:init");
    }

    getModel(){
    	return this.model;
    }

    setTabelName(name){
    	this.tabelName = name;
    }
}
module.exports = DBInterface;