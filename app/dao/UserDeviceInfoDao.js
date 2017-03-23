const DaoBase = require('../../core/base/DaoBase');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const crypto = require('crypto');
const moment = require("moment");
class UserDeviceInfoDao extends DaoBase{


        *insert(data){
            let UserDeviceInfo= this.models.user_device_info({
                "_device_obj_id":data._device_obj_id,
                "_user_obj_id":data._user_obj_id,
                "type":data.type,
                "info":data.info,
               
            });

            try{
                return UserDeviceInfo.save();
     
            } catch (err) {
                throw(err);
            }
        }
        *selectNew(id,year){
            year=new Date(year)
            let start=moment(year).startOf("year").format();
            let end=moment(year).endOf("year").format(); 

            let sql ={
                "_device_obj_id":id,
              
                createTime:{$gte:start,$lte:end}
            };
            
            return this.models.user_device_info.find(sql).exec();

        }
        *select(id){
            let sql ={
                "_device_obj_id":id
              
            };
            
            let userdeviceRow = yield this.models.user_device_info.find(sql).exec();
            if(!userdeviceRow[0]){
                return false;
            }
            return userdeviceRow;
        }
        *selects(ids,_id){
            let sql ={
                "_device_obj_id":{$in:ids},
                "_user_obj_id":_id,
                "status":0
            };
            let data=new Array(ids.length);
            let userdeviceRow = yield this.models.user_device_info.aggregate([{
                    $match: {
                        _user_obj_id: _id,
                        _device_obj_id: {$in: ids}
                    }
                }, {
                    $project: {
                        _device_obj_id: 1,
                        info: 1,
                        isread: 1
                    }
                }, {
                    $group: {
                        _id: "$_device_obj_id",
                        weight: {$last: '$info.weight'},
                        isread: {$min: '$isread'}
                    }
                }]).exec();

            if(!userdeviceRow[0]){
                return false;
            }

            for(let i=0;i<ids.length;i++){
                for(let i1=0;i1<userdeviceRow.length;i1++){
                    if(ids[i]==userdeviceRow[i1]._device_obj_id){
                        data[i]=userdeviceRow[i1];
                        break;
                    }
                }
            }

            return data;
        }

        *selectInfo(id) {
            let sql = {
                "_id": id
            };
            let userdeviceRow = yield this.models.user_device_info.findOne(sql).exec();
            if (!userdeviceRow) {
                return false;
            }
            moment.locale('zh-cn');
            var createTime = moment(userdeviceRow.createTime);
            let data = {
                "weight": userdeviceRow.info.weight,
                "bmi": userdeviceRow.info.bmi,
                "fatRate": userdeviceRow.info.fatRate,
                "kcal": userdeviceRow.info.kcal,
                "bodyAge": userdeviceRow.info.bodyAge,
                "date": createTime.format('MMMDo dddd'),
                "time": createTime.format('HH:mm')
            };
            return data;
        }

        *seletDetail(id, data) {
            var subtractDay;
            var cycle;
            switch (data.tag) {
                case 'week':
                    subtractDay = 7;
                    cycle = 1;
                    break;
                case 'month':
                    subtractDay = 30;
                    cycle = 6;
                    break;
                case 'quarter':
                    subtractDay = 90;
                    cycle = 18;
                    break;
            }
            var now = moment();
            var nowDay = moment().startOf('day');
            var startDay = moment();
            startDay.subtract((subtractDay - 1), 'days').startOf('day').format();
            var oneDay = (1000 * 60 * 60 * 24);
            let aggregate = yield this.models.user_device_info.aggregate([{
                $match: {
                    status: 0,
                    _device_obj_id: data.deviceID,
                    _user_obj_id: id,
                    createTime: {$lte: new Date(now), $gte: new Date(startDay)}
                }
            }, {
                $project: {
                    _device_obj_id: 1,
                    _user_obj_id: 1,
                    createTime: 1,
                    info: 1,
                    differ: {$floor: {$divide: [{$subtract: ['$createTime', new Date(nowDay)]}, cycle * oneDay]}},
                    time: {$dateToString: {format: '%m.%d', date: '$createTime'}}
                }
            }, {
                $group: {
                    _id: {'differ': '$differ'},
                    value: {$avg: '$info.' + data.key},
                    record: {$sum: 1},
                    time: {$first: '$time'}
                }
            }, {
                $sort: {time: 1}
            }]).exec();
            return aggregate;
        }

        *selectlists(_device_obj_id,_user_obj_id,date,page){
            let start = moment(date).startOf("month").format();
            let end = moment(date).endOf("month").format();
            page=parseInt(page); 
            let sql ={
             "_device_obj_id":_device_obj_id,
             "_user_obj_id":_user_obj_id,
             "status":0,
             "createTime":{$gte:start,$lte:end}   
            }
            let userdeviceRow = yield this.models.user_device_info.find(sql).sort({"createTime":1}).skip((page-1)*5).limit(5).exec();
            if(!userdeviceRow[0]){
                return false;
            }
            let data=[{}];
            for(let i = 0; i < userdeviceRow.length; i++) {
                let createTime = moment(userdeviceRow[i].createTime);
                data[i] = {};
                data[i]._id = userdeviceRow[i]._id;
                data[i].weight = userdeviceRow[i].info.weight;
                data[i].bmi = userdeviceRow[i].info.bmi;
                data[i].fatRate = userdeviceRow[i].info.fatRate;
                data[i].kcal = userdeviceRow[i].info.kcal;
                data[i].bodyAge = userdeviceRow[i].info.bodyAge;
                data[i].isread = userdeviceRow[i].isread;
                data[i].date = createTime.format('MM-DD');
                data[i].time = createTime.format('HH:mm');
            }
            return data;
        }
        *selectlist(_device_obj_id,_user_obj_id,key,tag){
           
            let start=moment().startOf(tag).format();
            let end=moment().endOf(tag).format();  
            let sql ={
                "_device_obj_id":_device_obj_id,
                "_user_obj_id":_user_obj_id,
                "createTime":{$gte:start,$lte:end}
            }
            let userdeviceRow = yield this.models.user_device_info.find(sql,'info').sort({"createTime":1}).exec();
            if(!userdeviceRow[0]){
                return false;
            }
            let data=[];
                for(let i=0;i<userdeviceRow.length;i++){
                    data[i]=userdeviceRow[i][key];
                }
                 return data;

        }
        *updateStatus_2(deviceID,_id){
            let oldValue = {
                "_device_obj_id":deviceID,
                "_user_obj_id":_id
            };
            let newData = {
                "status":2
            };

           return this.models.user_device_info.update(oldValue,newData,{multi: true});
        }

        *updataStatus(id){
            let oldValue = {
                "_id":id
            };
            let newData = {
                "status": 1
               

            };
           return this.models.user_device_info.update(oldValue,newData);
          
        }
        *updataMonth(_device_obj_id,_user_obj_id,date){
            let start = moment(date).startOf("month").format(); 
            let end = moment(date).endOf("month").format(); 
            let oldValue = {
                "_device_obj_id":_device_obj_id,
                "_user_obj_id":_user_obj_id,
                "createTime":{$gte:start,$lte:end}
            };
            let newData = {
                "isread": 1
               

            };
           yield this.models.user_device_info.update(oldValue,newData,{multi: true});
          


        }

        *updataRead(id){
            let oldValue = {
                "_id":id
            };
            let newData = {
                "isread": 1
               

            };
            yield this.models.user_device_info.update(oldValue,newData);
          


        }
        
}

module.exports = UserDeviceInfoDao;