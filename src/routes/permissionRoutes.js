const permissionController = require('../app/controllers/permissionController');
const router = require('express').Router();

// Middlewares
const authRequired = require('../app/middleware/validateToken');

router.post('/permissions', authRequired, permissionController.createPermission);
router.get('/permissions', authRequired, permissionController.getAllPermissions);
router.get('/permissions/:id', authRequired, permissionController.getPermission);
router.put('/permissions/:id', authRequired, permissionController.updatePermission);
router.delete('/permissions/:id', authRequired, permissionController.deletePermission);
module.exports = router;