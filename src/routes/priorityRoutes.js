const priorityController = require('../app/controllers/priorityController');

const router = require("express").Router();

// Middlewares
const authRequired = require("../app/middleware/validateToken");

router.post('/priorities', authRequired, priorityController.createPriority);
router.get('/priorities', authRequired, priorityController.getPriorities);
router.get('/priorities/:id', authRequired, priorityController.getPriorityById);
router.put('/priorities/:id', authRequired, priorityController.updatePriority);
router.delete('/priorities/:id', authRequired, priorityController.deletePriority);

module.exports = router;
