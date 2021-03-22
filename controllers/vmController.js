var Server = require('../models/server');
var Vm = require('../models/vm');
var async = require('async');

const { body, validationResult } = require('express-validator/check');

exports.virtualmachine_list = function (req, res, next){
    Vm.find()
    .populate('MasterSer')
    .exec(function (err, list_virtualmachines){
        if(err){return next(err);}
        // 成功查询，就render
        res.render('vm_list', {title: '虚拟机列表', vm_list:list_virtualmachines});
    })
};


exports.virtualmachine_detail = function (req, res, next){

    Vm.findById(req.params.id)
    .populate('MasterSer')
    .exec(function (err, vm) {
      if (err) { return next(err); }
      if (vm==null) { // No results.
          var err = new Error('未找到该虚拟机信息');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('vm_detail', { title: '虚拟机:', vm: vm});
    })
};


exports.virtualmachine_create_get = function (req, res, next){
    Server.find({},'Sername')
    .exec(function (err, servers) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('vm_form', {title: '创建虚拟机', server_list:servers } );
    });
};

// Handle VirtualMachine create on POST.
exports.virtualmachine_create_post = [
    // Validate and sanitize fields.
    body('vmname', '虚拟机名称不能为空').trim().isLength({ min: 1 }).escape(),
    body('masterser', '虚拟机挂靠服务器必须确定').trim().isLength({ min: 1 }).escape(),
    body('vmip', '虚拟机IP地址不能为空').trim().isLength({ min: 1 }).escape(),
    body('vmos', '虚拟机操作系统不能为空').trim().isLength({ min: 1 }).escape(),
    body('vmadmin', '用户名不能为空').trim().isLength({ min: 1 }).escape(),
    body('vmkey', '登陆密码不能为空').trim().isLength({ min: 1 }).escape(),
    body('isfordemo', '必须确定是否存放演示程序').trim().isLength({ min: 1 }).escape(),

    (req, res, next) =>{
        const errors = validationResult(req);

        var vm = new Vm({
            VmName: req.body.vmname,
            MasterSer: req.body.masterser,
            VmIP: req.body.vmip,
            VmOS: req.body.vmos,
            VmAdmin: req.body.vmadmin,
            VmKey: req.body.vmkey,
            IsForDemo: req.body.isfordemo,
            VmPurpose: req.body.vmpurpose,
            VmOwner: req.body.vmowner,
            VmRemarks: req.body.vmremarks,
        });

        if (!errors.isEmpty()){
            // There are errors. Render form again with sanitized values and error messages.
            Server.find({},'SerName')
                .exec(function (err, servers) {
                    if(err){return next(err);}
                    res.render('vm_form', { title: '创建虚拟机', 
                                            server_list:servers, 
                                            selected_server: vm.MasterSer._id,
                                            errors: errors.array(),
                                            vm:vm});
            });
            return;
        }
        else{
            // Data from form is valid
            vm.save(function (err){
                if(err){return next(err);}
                res.redirect(vm.url);
            });
        }
    }
];

// Display VirtualMachine delete form on GET.
exports.virtualmachine_delete_get = function(req, res, next){
    Vm.findById(req.params.id)
    .populate('MasterSer')
    .exec(function (err, vm){
        if (err) { return next(err); }
        if (vm==null) { // No results.
            res.redirect('/api/vm/all');
        }
        // Successful, so render.
        res.render('vm_delete', { title: '删除虚拟机', vm:  vm});
    })
};


// Handle VirtualMachine delete on POST.
exports.virtualmachine_delete_post = function (req, res, next){
    // Assume valid vm id in field.
    Vm.findByIdAndRemove(req.body.id, function deleteVm(err) {
        if (err) { return next(err); }
        // Success, so redirect to list of vm items.
        res.redirect('/api/vm/all');
        });
};

exports.virtualmachine_update_get = function(req, res, next){

    // Get book, authors and genres for form.
    async.parallel({
        vm: function(callback) {
            Vm.findById(req.params.id).populate('MasterSer').exec(callback)
        },
        servers: function(callback) {
            Server.find(callback)
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.vm==null) { // No results.
                var err = new Error('未找到该虚拟机信息');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('vm_form', { title: '更新虚拟机信息', server_list : results.servers, selected_server : results.vm.MasterSer._id, vm:results.vm });
        });
};

exports.virtualmachine_update_post = [
    // Validate and sanitize fields.
    body('vmname', '虚拟机名称不能为空').trim().isLength({ min: 1 }).escape(),
    body('masterser', '虚拟机挂靠服务器必须确定').trim().isLength({ min: 1 }).escape(),
    body('vmip', '虚拟机IP地址不能为空').trim().isLength({ min: 1 }).escape(),
    body('vmos', '虚拟机操作系统不能为空').trim().isLength({ min: 1 }).escape(),
    body('vmadmin', '用户名不能为空').trim().isLength({ min: 1 }).escape(),
    body('vmkey', '登陆密码不能为空').trim().isLength({ min: 1 }).escape(),
    body('isfordemo', '必须确定是否存放演示程序').trim().isLength({ min: 1 }).escape(),

    (req, res, next) =>{
        const errors = validationResult(req);

        var vm = new Vm({
            _id: req.params.id,
            VmName: req.body.vmname,
            MasterSer: req.body.masterser,
            VmIP: req.body.vmip,
            VmOS: req.body.vmos,
            VmAdmin: req.body.vmadmin,
            VmKey: req.body.vmkey,
            IsForDemo: req.body.isfordemo,
            VmPurpose: req.body.vmpurpose,
            VmOwner: req.body.vmowner,
            VmRemarks: req.body.vmremarks,
        });

        if (!errors.isEmpty()){
            // There are errors. Render form again with sanitized values and error messages.
            Server.find({},'SerName')
                .exec(function (err, servers) {
                    if(err){return next(err);}
                    res.render('vm_form', { title: '创建虚拟机', 
                                            server_list:servers, 
                                            selected_server: vm.MasterSer._id,
                                            errors: errors.array(),
                                            vm:vm});
            });
            return;
        }
        else{
            // A.findByIdAndUpdate(id, update, options, callback) // executes
            // id：指定_id的值；update：需要修改的数据；options控制选项；callback回调函数。
            Vm.findByIdAndUpdate(req.params.id, vm, {}, function (err,thevm) {
                if (err) { return next(err); }
                   // Successful - redirect to detail page.
                   res.redirect(thevm.url);
                });
        }
    }
];

