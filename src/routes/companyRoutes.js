const companyController = require('../app/controllers/companyController');

const router = require("express").Router();

// Middlewares
const authRequired = require("../app/middleware/validateToken");

router.get('/companies', authRequired, companyController.getCompanies);
router.get('/companies/:id', authRequired, companyController.getCompanyById);

module.exports = router;
