const roleController = require('../app/controllers/roleController');
const router = require('express').Router();

// Middlewares
const authRequired = require('../app/middleware/validateToken');

router.post('/roles', authRequired,  roleController.createRole);
router.get('/roles', authRequired, roleController.getAllRoles);
router.get('/roles/:id', authRequired, roleController.getRole);
router.put('/roles/:id', authRequired, roleController.updateRole);
router.delete('/roles/:id', authRequired, roleController.deleteRole);
router.get('/roles/:id/permissions', authRequired, roleController.getRolePermissions);

module.exports = router;