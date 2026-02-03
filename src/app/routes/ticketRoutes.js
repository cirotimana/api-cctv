const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");

// Ruta para generar un nuevo código de ticket
router.get("/generate-code", ticketController.generateTicketCode);

module.exports = router;