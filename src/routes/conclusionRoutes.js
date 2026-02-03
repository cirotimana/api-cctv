const conclusionController = require('../app/controllers/conclusionController');
const router = require("express").Router();

// Middlewares
const authRequired = require("../app/middleware/validateToken");

router.delete('/conclusions/:id', authRequired, conclusionController.deleteConclusion);
router.get('/conclusions/:id', authRequired, conclusionController.getConclusionById);
router.put('/conclusions/:id', authRequired, conclusionController.updateConclusion);
router.post('/conclusions', authRequired, conclusionController.createConclusion);
router.get('/conclusions', authRequired, conclusionController.getConclusions);

module.exports = router;
