const DaoBase = require('../../core/base/DaoBase');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const crypto = require('crypto');
const moment = require("moment");
class ActionLog extends DaoBase{


        insert(data){
            let ActionLogTable= this.models.action_log({
                "device":data.device_id,
                "action":data.msg_type,
                "data":data
            });


            try{
                ActionLogTable.save();
               
            } catch (err) {
                throw(err);
            }
        }


        *select(){
            return yield this.models.action_log.find({}).exec();
             

        }




}

module.exports = ActionLog;