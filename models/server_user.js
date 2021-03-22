// 服务器用户模型
var mongoose = require('mongoose');

const { DateTime } = require("luxon");  //for date handling

var Schema = mongoose.Schema;

var ServerUserSchema = new Schema({
    UserName:{type: String, required: true},
    UserKey:{type: String, required: true},
    UserClass:{type: String, required: true},
    ItsServer: { type: Schema.ObjectId, ref: 'Server', required: true }, // Reference to the associated server.
});

// Virtual for this ServerUser object's URL.
ServerUserSchema
.virtual('url')
.get(function () {
  return '/api/serveruser/'+this._id;
});


// Export model.
module.exports = mongoose.model('ServerUser', ServerUserSchema);
