const DaoBase = require('../../core/base/DaoBase');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const crypto = require('crypto');
const moment = require("moment");
class UserDao extends DaoBase{
        *insert(username){
            let time = moment().format(); 
            let userTable= this.models.user({
                "username":username,
                "source":'1'
                
            });
            try{
              return yield userTable.save();
              
            } catch (err) {
                throw(err);
            }
        }

        *insertTime(username){
            let time = moment().format(); 
            let userTable= this.models.user({
                "username":username,
                "source":'1',
                "loginTime":new Date()
                
            });

            try{
              return yield userTable.save();
              
            } catch (err) {
                throw(err);
            }
        }

        *updata(username){
            let oldValue ={
                "username":username

            }

            let newData ={
                "loginTime":new Date()
            }
            yield this.models.user.update(oldValue,newData);
        }



        *select(username){
            let sql ={
                "username":username
            }
            return yield this.models.user.findOne(sql).exec();
            

        }



        *selectId(usernames){
            let sql ={
                "username":{$in:usernames}
            }
            let userRows = yield this.models.user.find(sql).exec();
            let _ids = [];
            for(let i=0;i<userRows.length;i++){
                _ids[i] = userRows[i]._id; 
            }
            return _ids;
        }

        *selectOpen(_ids){
            let sql ={
                "_id":{$in:_ids}
            }
            let userRows = yield this.models.user.find(sql).exec();
            let openids = [];
            for(let i=0;i<userRows.length;i++){
                openids[i] = userRows[i].username;
            }
            return openids;

        }






}

module.exports = UserDao;

