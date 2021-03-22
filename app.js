var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
var helmet = require('helmet');



// 导入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');    // 导入登录与注册模块路由
const serverRouter = require('./routes/server');  // 导入服务器信息管理模块路由
const vmRouter = require('./routes/vm');          // 导入虚拟机信息管理模块路由

var app = express();

// 这段代码整体使用
// 导入 mongoose 模块
const mongoose = require('mongoose');
// 设置默认 mongoose 连接
const mongoDB = process.env.MONGODB_URI || 'mongodb+srv://dbUser:tyty123@cluster0.dr6vo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoDB);
// 让 mongoose 使用全局 Promise 库
mongoose.Promise = global.Promise;
// 取得默认连接
const db = mongoose.connection;
// 将连接与错误事件绑定（以获得连接错误的提示）
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));

// 设置模板存放目录和模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); //Compress all routes
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));  //现在 'public' 文件夹下的所有文件均可通过在根 URL 后直接添加文件名来访问了

// 设置url对应的router
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', loginRouter);
app.use('/api/server', serverRouter);
app.use('/api/vm', vmRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// 错误处理中间件可以任何所需内容，但是必须在所有其它 app.use() 和路由调用后才能调用，因此它们是需求处理过程中最后的中间件。
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


