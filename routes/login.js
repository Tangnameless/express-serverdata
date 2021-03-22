// 用户注册与登录相关路由


var express = require('express');
var router = express.Router();

// Require our controllers.
// 导入控制器模块
var user_controller = require('../controllers/userController'); 


//LOGIN ROUTES ///
// 注意这里是相对路径，接在'/api'后
// GET 根目录
router.get('/', user_controller.index);  

// GET 登录页面
router.get('/login', user_controller.login_get);

// POST 登录页面
router.post('/login', user_controller.login_post);

// GET 注册页面
router.get('/register', user_controller.register_get);

// POST 注册页面
router.post('/register', user_controller.register_post);

// 根据验证返回用户个人信息
router.get('/userinfo', user_controller.userinfo_get);

module.exports = router;

