const dvrStatusController = require('../app/controllers/dvrStatusController');
const router = require('express').Router();

// Middlewares
const authRequired = require('../app/middleware/validateToken');

// Rutas para el controlador de DVR Status
router.get('/dvr-status', authRequired, dvrStatusController.getAllDvrStatus);
router.get('/dvr-status/:id', authRequired, dvrStatusController.getDvrStatus);
router.post('/dvr-status', authRequired, dvrStatusController.createDvrStatus);
router.put('/dvr-status/:id', authRequired, dvrStatusController.updateDvrStatus);
router.delete('/dvr-status/:id', authRequired, dvrStatusController.deleteDvrStatus);
router.patch('/dvr-status/:id/status', authRequired, dvrStatusController.updateDvrStatusState);
router.get('/dvr-status/status/counts', authRequired, dvrStatusController.getStoreStatusCounts);

module.exports = router;
