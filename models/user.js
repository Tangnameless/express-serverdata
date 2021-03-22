// 网站用户模型

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: { type: String, required: true, maxlength: 20, unique: true },
  password: {
    type: String,
    set(val) {
      return require("bcryptjs").hashSync(val, 4); // 对密码进行加密
    },
  },
  user_class: {type: String, required: true, enum:['普通用户', '服务器管理员', '系统管理员'], default:'普通用户'},
  // user_realname:{type: String, maxlength: 20},
  // user_affiliation: { type: String, required: true, maxlength: 20 }
});



// Virtual for this user instance URL.
UserSchema.virtual('url').get(function() {
  return '/api/user/' + this._id;
});

// Export model.
module.exports = mongoose.model('User', UserSchema);

