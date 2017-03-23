const DaoBase = require('../../core/base/DaoBase');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const crypto = require('crypto');
const moment = require("moment");
class DeviceDao extends DaoBase{


        *insert(deviceid,data){
            let deviceTable;
           if(!data){
                 deviceTable= this.models.device({
                    "deviceId":deviceid
                });
           } else {
                 deviceTable= this.models.device({
                    "deviceId":deviceid,
                    "pid":data.pid,
                    "softwareVer":data.softwareVer,
                    "deviceVer":data.deviceVer,
                    "deviceModel":data.deviceModel,
                    "updateTime":new Date()
                });              
                

                
            }

            try{
               return yield deviceTable.save();
                   
            } catch (err) {
                throw(err);
            }


        }



           

        *updata(deviceid,data){
            let oldValue = {
                "deviceId":deviceid
               
            };
            let newData = {
                "pid":data.pid,
                "softwareVer":data.softwareVer,
                "deviceVer":data.deviceVer,
                "deviceModel":data.deviceModel,
                "updateTime":new Date()
            };
            yield this.models.device.update(oldValue,newData);
     

        }

        *updataTime(deviceid){

            let oldValue = {
                "deviceId":deviceid
               
            };
            let newData = {
                "updateTime":new Date()
            };
            yield this.models.device.update(oldValue,newData);
     


        }

        *updataUserTimes(deviceids){
            let oldValue = {
                "_id":{$in:deviceids}
               
            };
            let newData = {
                "userUpdatetime":new Date().getTime()
            };
            yield this.models.device.update(oldValue,newData,{multi: true});
  

        }
        *updataUserTime(deviceid){
            let oldValue = {
                "_id":deviceid
               
            };
            let newData = {
                "userUpdatetime":new Date().getTime()
            };
            yield this.models.device.update(oldValue,newData);
  

        }

        *select(deviceid){
            let sql = {
                "deviceId":deviceid
            }
            return yield this.models.device.findOne(sql).exec();



        }

        *selectPid(deviceid){
            let sql = {
                "_id":{$in:deviceid}
            }
            return yield this.models.device.find(sql).exec();
            
               
             
           

        }



}

module.exports = DeviceDao;