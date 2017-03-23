const DaoBase = require('../../core/base/DaoBase');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const crypto = require('crypto');
const moment = require("moment");
class UserDeviceDao extends DaoBase{


        *insert(data){

            let UserDeviceTable= this.models.user_device({
                "_device_obj_id":data._device_obj_id,
                "_user_obj_id":data._user_obj_id,
                "seat":data.seat,
                "status":data.status
            });
            try{
                yield UserDeviceTable.save();
           
            } catch (err) {
                throw(err);
            }
        }


        *select(_user_obj_id){
            let sql ={
                "_user_obj_id":_user_obj_id,
                "status":{$ne:0}
            }
            return yield this.models.user_device.find(sql,'_device_obj_id status').sort({"createTime":-1}).exec();
        

        }



        *selectDevices(_user_obj_id){
            let sql ={
                "_user_obj_id":_user_obj_id
            }
            let devices= yield this.models.user_device.find(sql).exec();
            let deviceids = [];
            for(let i =0;i<devices.length;i++){
                deviceids[i] = devices[i]._device_obj_id;

            }
            return deviceids;
        }
        *selectBindDevices(_user_obj_id){
            let sql ={
                "_user_obj_id":_user_obj_id,
                "status":1
            }
            let devices= yield this.models.user_device.find(sql).exec();
            let deviceids = [];
            for(let i =0;i<devices.length;i++){
                deviceids[i] = devices[i]._device_obj_id;

            }
            return deviceids;

        }
        *selectStatus(_device_obj_id,_user_obj_id){
            let sql ={
                "_device_obj_id":_device_obj_id,
                "_user_obj_id":_user_obj_id
            }
            return yield this.models.user_device.findOne(sql).exec();


        }   
        *selectBindNum(_device_obj_id){
            let sql = {
                "_device_obj_id":_device_obj_id,
                "status":1 
            }
            return yield this.models.user_device.find(sql).exec();

        }
        *selectBindNums(_device_obj_ids,_id){
            let sql = {
                "_device_obj_id":{$in:_device_obj_ids},
                "status":1
            }
            let data=[];

            let i1=0;
            let i2=0;
            let userdevice = yield this.models.user_device.find(sql).sort({"createTime":-1}).exec();
            if(!userdevice[0]){
                return false;
            }
            //user bind device  group by(createtime -1)be arr
            for(let i=0;i<userdevice.length;i++){

                if(userdevice[i]._user_obj_id==_id){
                    data[i1]=[];
                    for(let i3=0;i3<userdevice.length;i3++){
                        if(userdevice[i]._device_obj_id==userdevice[i3]._device_obj_id){
                            data[i1][i2]=userdevice[i3];
                            i2++;
                        }
                    }
                    i2=0;
                    i1++;
                }
            }
            return data;
        }


        *selectBindDevice(_user_obj_id){
            let sql ={
                "_user_obj_id":_user_obj_id,
                "status":101
            }
            let device = yield this.models.user_device.find(sql).exec();
            if(device[0]){
                let deviceids=[];
                for(let i=0;i<device.length;i++){
                    deviceids[i]=device[i]._device_obj_id; 

                }

                return deviceids;
            }
            
            return false;
        }
                 
        *updata(data){
            let oldValue = {
                "_device_obj_id":data._device_obj_id,
                "_user_obj_id":data._user_obj_id
            };
            let newData = {
                "seat":data.seat,
                "status":data.status

            };

          
           return yield this.models.user_device.update(oldValue,newData);
     


        }


}

module.exports = UserDeviceDao;