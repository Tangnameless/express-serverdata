//服务器模型
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ServerSchema = new Schema({
    Sername: {type: String, required: true},     // 服务器名称
    SerIp: {type: String, required: true},       // 服务器IP
    SerType: {type: String, required: true},     // 服务器类别
    SerAdmin: {type: String, required: true},    // 登录用户名
    SerKey: {type: String, required: true},      // 登录密码
    SerOS: {type: String, required: true},       // 服务器操作系统
    IPMI_IP: {type: String},                     // IPMI_IP
    IB_IP: {type: String},                       // IB内网IP
    IPMI_Admin_key: {type: String},              // IPMI信息，用“/”分隔用户名和密码
    SerPurpose: {type: String},                  // 服务器用途
    SerOwner: {type: String, required: true},    // 使用人
    SerLocation: {type: String, required: true}, // 服务器所属实验室
    SerRemarks: {type: String, required: true},  // 备注信息
});

// Virtual for this Server instance URL.
ServerSchema
.virtual('url')
.get(function () {
  return '/api/server/'+this._id;
});

// Export model.
module.exports = mongoose.model('Server', ServerSchema);
