// 虚拟机模型
var mongoose = require('mongoose');

const { DateTime } = require("luxon");  //for date handling

var Schema = mongoose.Schema;

var VirtualMachineSchema = new Schema({
    VmName:{type: String, required: true},   //虚拟机名称
    MasterSer: { type: Schema.ObjectId, ref: 'Server', required: true }, // 虚拟机挂靠服务器
    VmIP: {type: String, required: true},    // 虚拟器IP
    VmOS: {type: String, required: true},    // 虚拟机操作系统
    VmAdmin: {type: String, required: true}, // 登录用户名
    VmKey: {type: String, required: true},   // 登录密码
    IsForDemo:{type: Number, required: true, enum:[0, 1], default:0}, //是否存放演示程序，0：未存放 1：存放
    VmPurpose: {type: String},               // 虚拟机用途
    VmOwner: {type: String},                 // 虚拟机使用人
    VmRemarks: {type: String},               // 备注
});

// Virtual for this virtualmachine object's URL.
VirtualMachineSchema
.virtual('url')
.get(function () {
  return '/api/vm/'+this._id;
});

// Export model.
module.exports = mongoose.model('VirtualMachine', VirtualMachineSchema);
