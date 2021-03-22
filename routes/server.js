// 服务器信息管理路由


var express = require('express');
var router = express.Router();

// Require our controllers.
// 导入控制器模块
var server_controller = require('../controllers/serverController'); 

/// SERVER ROUTES ///

// GET request for creating a server. NOTE This must come before routes that display server (uses id).
router.get('/create', server_controller.server_create_get);

// POST request for creating server.
router.post('/create', server_controller.server_create_post);

// GET request to delete server.
router.get('/:id/delete', server_controller.server_delete_get);

// POST request to delete server.
router.post('/:id/delete', server_controller.server_delete_post);

// GET request to update server.
router.get('/:id/update', server_controller.server_update_get);

// POST request to update server.
router.post('/:id/update', server_controller.server_update_post);

// GET 服务器信息列表
router.get('/all', server_controller.server_list);

// GET 一个服务器的详细信息页面
router.get('/:id', server_controller.server_detail);


module.exports = router;