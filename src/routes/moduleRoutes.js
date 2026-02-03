const moduleController = require('../app/controllers/moduleController');
const router = require('express').Router();

// Middlewares
const authRequired = require('../app/middleware/validateToken');

router.delete('/modules/:id', authRequired, moduleController.deleteModule);
router.put('/modules/:id', authRequired, moduleController.updateModule);
router.post('/modules', authRequired, moduleController.createModule);
router.get('/modules', authRequired, moduleController.getAllModules);
router.get('/modules/:id', authRequired, moduleController.getModule);

module.exports = router;

