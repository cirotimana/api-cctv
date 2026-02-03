const statusController = require("../app/controllers/statusController");
const router = require("express").Router();

// Middlewares
const authRequired = require("../app/middleware/validateToken");

router.delete('/statuses/:id', authRequired, statusController.deleteStatus);
router.get('/statuses/:id', authRequired, statusController.getStatusById);
router.put('/statuses/:id', authRequired, statusController.updateStatus);
router.post('/statuses', authRequired, statusController.createStatus);
router.get('/statuses', authRequired, statusController.getStatuses);

module.exports = router;

