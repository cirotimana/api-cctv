const express = require('express');
const router = express.Router();
const attachmentController = require('../app/controllers/attachmentController');

router.get('/attachments/:type/:filename', attachmentController.getAttachment);

module.exports = router;
