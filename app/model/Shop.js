const DBInterface = require('../../core/db/DBInterface');
const mongoose = require('mongoose');
class Shop extends DBInterface{
	init(){
		this.setTabelName("shop");
		let model = mongoose.Schema({
	        title: {type: String},
	        model: {type: String},
	        type: {type: String},
	        price: {type: String},
	        nowPrice: {type: String},
	        image: {type: String},
	        description: {type: String},
	        url: {type: String},
	        status: {type: Number, default: 1},
	        releaseTime: {type: Date},
	        createTime: {type: Date, default: Date.now}
	    }, {collection: 'shop'});
	    model.index({status: 1});
	    return model;







	}
}
module.exports = Shop;