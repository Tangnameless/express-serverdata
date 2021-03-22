var express = require('express');
var router = express.Router();


// Require our controllers.
// 导入控制器模块
var vm_controller = require('../controllers/vmController');


/// virtualmachine ROUTES ///

// GET request for creating a virtualmachine. NOTE This must come before route that displays virtualmachine (uses id).
router.get('/create', vm_controller.virtualmachine_create_get);

// POST request for creating virtualmachine.
router.post('/create', vm_controller.virtualmachine_create_post);

// GET request to delete virtualmachine.
router.get('/:id/delete', vm_controller.virtualmachine_delete_get);

// POST request to delete virtualmachine.
router.post('/:id/delete', vm_controller.virtualmachine_delete_post);

// GET request to update virtualmachine.
router.get('/:id/update', vm_controller.virtualmachine_update_get);

// POST request to update virtualmachine.
router.post('/:id/update', vm_controller.virtualmachine_update_post);

// GET request for list of all virtualmachine.
router.get('/all', vm_controller.virtualmachine_list);

// GET request for one virtualmachine.
router.get('/:id', vm_controller.virtualmachine_detail);


module.exports = router;