var Server = require('../models/server');
var Vm = require('../models/vm');

// 导入验证和清理方法
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
// trim()：去除字符串的头尾空格
// escape()清理操作，会从名称变量中，删除可能在JavaScript跨站点脚本攻击中使用的HTML字符。
// body(fields[, message]): 指定请求本文中的一组字段（POST参数）以及可选的错误消息，如果测试失败，则可以显示该字段。验证标准以菊花链形式连接到 body()方法。
// sanitizeBody(fields): 指定一个正文要清理的字段。然后将清理操作，以菊花链形式连接到此方法。
// populate(), 返回填充的document

var async = require('async');
const { rawListeners } = require('../models/server');


// 服务器列表控制器函数，需要获取数据库中所有Server对象的列表
// 然后将这些对象传给模板进行呈现
// display list of all Servers.
exports.server_list = function (req, res, next) {
    Server.find({})       // 查找全部服务器
        .exec(function (err, list_Servers) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('server_list', { title: '服务器列表', server_list: list_Servers });
        });
};

// Display detail page for a specific Server.
exports.server_detail = function (req, res, next) {

    async.parallel({
        server: function (callback) {
            Server.findById(req.params.id)
                .exec(callback);
        },
        server_vms: function (callback) { //查找该服务器上挂载的所有虚拟机
            Vm.find({ 'MasterSer': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.server == null) { // No results.
            var err = new Error('Server not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('server_detail', { title: '服务器详细信息', server: results.server, server_vms: results.server_vms });
    });
};


// Display Server create form on GET.
// 仅渲染视图，传递一个title变量
exports.server_create_get = function (req, res, next) {
    res.render('server_form', { title: '创建服务器' });
};

// Handle Server create on POST.
exports.server_create_post = [
    // 注意是验证表单传来的字段，不是模型的字段
    // Validate and sanitize fields.
    body('sername', '服务器名称不能为空').trim().isLength({ min: 1 }).escape(),
    body('serip', '服务器IP不能为空').trim().isLength({ min: 1 }).escape(),
    body('sertype', '服务器类型不能为空').trim().isLength({ min: 1 }).escape(),
    body('seradmin', '用户名不能为空').trim().isLength({ min: 1 }).escape(),
    body('serkey', '登陆密码不能为空').trim().isLength({ min: 1 }).escape(),
    body('seros', '服务器系统不能为空').trim().isLength({ min: 1 }).escape(),
    body('serowner', '使用人不能为空').trim().isLength({ min: 1 }).escape(),
    body('serlocation', '所属实验室不能为空').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var server = new Server(
            {
                Sername: req.body.sername,
                SerIp: req.body.serip,
                SerType: req.body.sertype,
                SerAdmin: req.body.seradmin,
                SerKey: req.body.serkey,
                SerOS: req.body.seros,
                IPMI_IP: req.body.ipmi_ip,
                IB_IP: req.body.ib_ip,
                IPMI_Admin_key: req.body.ipmi_admin_key,
                SerPurpose: req.body.serpurpose,
                SerOwner: req.body.serowner,
                SerLocation: req.body.serlocation,
                SerRemarks: req.body.serremarks,
            }
        );


        if (!errors.isEmpty()) {
            // 有错误，将上次输入的信息返回创建页面重新床架
            res.render('server_form', { title: '创建服务器', server: server, errors: errors.array() });
            return;
        }
        else {
            // 表单输入数据是有效的
            // Check if Genre with same name already exists.
            Server.findOne({ 'name': req.body.name })
                .exec(function (err, found_server) {
                    if (err) { return next(err); }

                    if (found_server) {
                        // Server已经存在，导向其详细信息页面
                        res.redirect(found_server.url);
                    }
                    else {
                        server.save(function (err) {
                            if (err) { return next(err); }
                            // 保存新的Server数据，导向其详细信息页面
                            res.redirect(server.url);
                        });
                    }
                });
        }
    }
];



// GET 展示删除服务器页面
exports.server_delete_get = function (req, res, next) {

    async.parallel({
        server: function (callback) {
            Server.findById(req.params.id).exec(callback)
        },
        server_vms: function (callback) { //查找该服务器上挂载的所有虚拟机
            Vm.find({ 'MasterSer': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.server == null) {
            // 没有在数据库中查到相应的server
            // 没有什么可以删除，返回数据库列表
            res.redirect('/api/sever/all');
        }
        // Successful, so render
        res.render('server_delete', { title: '删除服务器', server: results.server, server_vms: results.server_vms });
    });
};

// POST 提交服务器删除操作
exports.server_delete_post = function (req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).
    async.parallel({
        server: function (callback) {
            Server.findById(req.body.serverid).exec(callback)
        },
        server_vms: function (callback) {
            Vm.find({ 'MasterSer': req.body.serverid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        if (results.server_vms.length > 0) {
            // 服务器上仍然有挂载的虚拟机。用GET方式返回路由
            res.render('server_delete', { title: '删除服务器', server: results.server, server_vms: results.server_vms });
            return;
        }
        else {
            //服务器上已经没有挂载的虚拟机。删除服务器信息并转向服务器列表
            Server.findByIdAndRemove(req.body.serverid, function deleteServer(err) {
                if (err) { return next(err); }
                res.redirect('/api/server/all')
            })
        }
    });
};

// Display Server update form on GET.
exports.server_update_get = function (req, res, next) {

    Server.findById(req.params.id, function (err, server) {
        if (err) { return next(err); }
        if (server == null) { //no results
            var err = new Error('没找到相应服务器');
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('server_form', { title: '更新服务器信息', server: server });
    });
};

// Handle Server update on POST.
exports.server_update_post = [
    // Validate and sanitize fields.
    body('sername', '服务器名称不能为空').trim().isLength({ min: 1 }).escape(),
    body('serip', '服务器IP不能为空').trim().isLength({ min: 1 }).escape(),
    body('sertype', '服务器类型不能为空').trim().isLength({ min: 1 }).escape(),
    body('seradmin', '用户名不能为空').trim().isLength({ min: 1 }).escape(),
    body('serkey', '登陆密码不能为空').trim().isLength({ min: 1 }).escape(),
    body('seros', '服务器系统不能为空').trim().isLength({ min: 1 }).escape(),
    body('serowner', '使用人不能为空').trim().isLength({ min: 1 }).escape(),
    body('serlocation', '所属实验室不能为空').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request .
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data 
        var server = new Server(
            {
                _id: req.params.id,                 //the old id!
                Sername: req.body.sername,
                SerIp: req.body.serip,
                SerType: req.body.sertype,
                SerAdmin: req.body.seradmin,
                SerKey: req.body.serkey,
                SerOS: req.body.seros,
                IPMI_IP: req.body.ipmi_ip,
                IB_IP: req.body.ib_ip,
                IPMI_Admin_key: req.body.ipmi_admin_key,
                SerPurpose: req.body.serpurpose,
                SerOwner: req.body.serowner,
                SerLocation: req.body.serlocation,
                SerRemarks: req.body.serremarks,
            }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('server_form', { title: '更新服务器信息', server: server, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Server.findByIdAndUpdate(req.params.id, server, {}, function (err, theserver) {
                if (err) { return next(err); }
                // Successful - redirect to server detail page.
                res.redirect(theserver.url);
            });
        }
    }
];

