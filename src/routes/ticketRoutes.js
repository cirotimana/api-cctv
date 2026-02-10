const ticketController = require("../app/controllers/ticketController");
const router = require("express").Router();
const multer = require("multer");

// Usar memoria en lugar de disco para subir a S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;

  

// Middlewares
const authRequired = require("../app/middleware/validateToken");

router.get("/tickets", authRequired, ticketController.getTickets);
router.post("/tickets", authRequired, ticketController.createTicket);
router.put("/tickets/:id", authRequired, ticketController.updateTicket);
router.get("/tickets/:id", authRequired, ticketController.getTicketById);
router.delete("/tickets/:id", authRequired, ticketController.deleteTicket);
router.put("/tickets/:id/status", authRequired, ticketController.updateTicketStatus);
router.put("/tickets/:id/code", authRequired, ticketController.updateTicketCode);

// Ruta para subir archivos a un ticket
router.post("/tickets/:id/upload", authRequired, upload.single("file"), ticketController.uploadDocument);
router.get("/tickets/:id/attachments", authRequired, ticketController.listAttachments);
router.get("/tickets/:id/attachments/:filename", authRequired, ticketController.downloadAttachment);


// Rutas para interacciones
router.get("/tickets/:id/interactions", authRequired, ticketController.getInteractions);
router.post("/tickets/:id/interactions", authRequired, ticketController.addInteraction);
router.get("/interactions", authRequired, ticketController.getAllInteractions);
router.delete("/interactions/:id", authRequired, ticketController.deleteInteraction);
router.put("/interactions/:id", authRequired, ticketController.updateInteraction);

// Funciones adicionales
router.get("/helpdesk/dashboard", authRequired, ticketController.getDashboard);
router.get("/helpdesk/kanban/:id", authRequired, ticketController.getKanban);

// Ruta para generar un nuevo código de ticket
router.get("/ticket/generate-code", ticketController.generateTicketCode);

module.exports = router;
