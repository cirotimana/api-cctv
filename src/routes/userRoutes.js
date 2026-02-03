const userController = require('../app/controllers/userController');
const router = require('express').Router();

// Middlewares
const { createUserSchema, updateUserSchema } = require('../app/validators/userSchema');
const { validateSchema } = require('../app/middleware/validateSchema');
const authRequired = require('../app/middleware/validateToken');

router.put('/users/:id', validateSchema(updateUserSchema), authRequired, userController.updateUser);
router.post('/users', validateSchema(createUserSchema), authRequired, userController.createUser);
router.patch('/users/:id/status', authRequired, userController.updateUserStatus);
router.patch('/users/:id/password', authRequired, userController.changePassword);
router.delete('/users/:id', authRequired, userController.deleteUser);
router.get('/users', authRequired, userController.getAllUsers);
router.get('/users/:id', authRequired, userController.getUser);

module.exports = router;
