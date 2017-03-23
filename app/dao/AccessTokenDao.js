const DaoBase = require('../../core/base/DaoBase');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const crypto = require('crypto');
const moment = require("moment");
class AccessToken extends DaoBase{


        *insert(access_token,js_token){
            let time = moment().add().format(); 
            let AccessTokenTable= this.models.access_token({
                "access_token":access_token,
                "js_token":js_token
            });

            try{
               return yield AccessTokenTable.save();
         
            } catch (err) {
                throw(err);
            }
        }


        *select(){
            return yield this.models.access_token.findOne({}).exec();
        

        }



}

module.exports = AccessToken;