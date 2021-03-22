// 负责用户的注册及登录验证

// 为正确验证的用户提供token


var User = require('../models/user');

const { body, validationResult } = require("express-validator");

var async = require('async');

// 加密用
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");

const SECRET = "cyqtokensecret";

// 登录注册页面
exports.index = function(req, res) {
    res.render('index.pug');
};

// GET 登录页面
exports.login_get = function(req, res){
    res.render('login.pug');
};

// POST 登陆页面
exports.login_post = async function(req, res){
    const user = await User.findOne({
        username: req.body.username,
    });
    if (!user) {
        return res.status(422).send({
            message: "用户名不存在",
        });
    }
    const isPasswordValid = bcryptjs.compareSync(
        req.body.password,
        user.password
    );
    if (!isPasswordValid) {
        return res.status(422).send({
            message: "密码不正确",
        });
    }

    //   生成token;
    const token = jwt.sign(
        {
            id: String(user._id),
        },
        SECRET            //生成token,使用jsonwebtoken包，jwt.sign({id}, SECRET);生成的token加入到请求头Authorization: Bearer token中
    );
    res.send({ user, token });
};



// GET 注册页面
exports.register_get = function(req, res) {
    res.render('register.pug');
};

// POST 注册页面
exports.register_post = async function(req, res, next){
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        user_class:req.body.user_class,
    });
    res.send(user);
};

// GET 访问用户信息页面
// 使用认证
exports.userinfo_get = async function(req, res, next){
    const raw = String(req.headers.authorization).split(" ").pop();  //获取token
    // console.log(raw);
    const { id } = jwt.verify(raw, SECRET);                          //验证token
    user = await User.findById(id);
    res.send(user);                                                  //根据token可以知道当前登录的用户

};


