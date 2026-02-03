const incidentTypeController = require('../app/controllers/incidentTypeController');
const router = require("express").Router();

// Middlewares
const authRequired = require("../app/middleware/validateToken");

// Rutas CRUD para IncidentType
router.delete('/incident-types/:id', authRequired, incidentTypeController.deleteIncidentType);
router.get('/incident-types/:id', authRequired, incidentTypeController.getIncidentTypeById);
router.put('/incident-types/:id', authRequired, incidentTypeController.updateIncidentType);
router.post('/incident-types', authRequired, incidentTypeController.createIncidentType);
router.get('/incident-types', authRequired, incidentTypeController.getIncidentTypes);

module.exports = router;
