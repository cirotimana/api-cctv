const authController = require('../app/controllers/authController');
const router = require('express').Router();

// Middlewares
const { validateSchema } = require('../app/middleware/validateSchema');
const { loginSchema } = require("../app/validators/authSchema");
const authRequired = require('../app/middleware/validateToken');

router.post("/auth/login", validateSchema(loginSchema), authController.login);
router.get("/auth/profile", authRequired, authController.profile);
router.get("/auth/verify-token", authController.verifyToken);
router.post("/auth/logout", authController.logout);

module.exports = router;