const DaoBase = require('../../core/base/DaoBase');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const crypto = require('crypto');
const moment = require("moment");
class UserinfoDao extends DaoBase{


        *insert(_user_obj_id,data){
            let UserInfoTable;
            if(data){
                 UserInfoTable= this.models.userinfo({
                    "_user_obj_id":_user_obj_id,
                    "nickname":data.nickname,
                    "head":data.headimgurl,
                    "city":data.city,
                    "sex":data.sex

                });
            } else {
                UserInfoTable =this.models.userinfo({
                     "_user_obj_id":_user_obj_id,
                     "nickname":"",
                     "head":"",
                     "city":"",
                     "sex":0

                });
            }

            try{
                return yield UserInfoTable.save();
   
            } catch (err) {
                throw(err);
            }
        }


        *updata(_user_obj_id,data){
            if(!data.toWeight){
                data.toWeight=null;
            }
            let birthday = moment(data.birthday).add(8,'h').format();
            let oldValue = {
                "_user_obj_id":_user_obj_id
            };
            let newData = {
                "sex":data.sex,
                "height":data.height,
                "birthday":birthday,
                "toWeight":data.toWeight,
                "updateTime":new Date()
            };
            return yield this.models.userinfo.update(oldValue,newData);
      
        }

        *select(_user_obj_id){
            let sql ={
                "_user_obj_id":_user_obj_id
            }
            return yield this.models.userinfo.findOne(sql).exec();


        }

        *selectInfos(_ids){
            let sql ={
                "_user_obj_id":{$in:_ids}
            }
            return yield this.models.userinfo.find(sql).exec();
        }

        *selectInfo(_user_obj_id){
            let sql ={
                "_user_obj_id":_user_obj_id
            }
            let userinfo = yield this.models.userinfo.findOne(sql).exec();
    
            if(userinfo){
                if(userinfo.height){
                    return "info"

                }
                return "base"
            }


                return false;

        }


}

module.exports = UserinfoDao;