const path = require("path");
const fs = require("fs");
const sequelize = require("../../config/database").sequelize;
const IncidentType = require("../models/IncidentType");
const Interaction = require("../models/Interaction");
const Conclusion = require("../models/Conclusion");
const Priority = require("../models/Priority");
const Status = require("../models/Status");
const Ticket = require("../models/Ticket");
const Store = require("../models/Store");
const User = require("../models/User");
const { Op } = require("sequelize");
const { format } = require("date-fns");
require("dotenv").config();

// Función para generar un nuevo código de ticket
const generateTicketCode = async (req, res) => {
  try {
    const prefix = "PF";
    const currentYear = format(new Date(), "yy");
    const initialCode = parseInt(process.env.TICKET_REPORT_NUMBER || "0", 10);

    const lastTicket = await Ticket.findOne({
      where: {
        code: {
          [Op.like]: `%-${currentYear}`,
        },
        delete_at: null,
      },
      order: [["code", "DESC"]],
    });

    let newNumber = initialCode + 1;

    if (lastTicket && lastTicket.code && lastTicket.code.trim() !== "") {
      const parts = lastTicket.code.split("-");
      if (parts.length === 3) {
        const [_, lastNumber, lastYear] = parts;
        if (lastYear === currentYear && !isNaN(lastNumber)) {
          newNumber = parseInt(lastNumber, 10) + 1;
        } else {
          newNumber = 1;
        }
      }
    }

    const formattedNumber = newNumber.toString().padStart(4, "0");
    const newCode = `${prefix}-${formattedNumber}-${currentYear}`;

    res.status(200).json({ code: newCode });
  } catch (error) {
    console.error("Error generating ticket code:", error);
    res.status(500).json({ message: error.message });
  }
};

// Función para actualizar el código del ticket
const updateTicketCode = async (req, res) => {

  try {
    const { id } = req.params;
    const { newCode } = req.body;

    const ticket = await Ticket.findOne({
      where: { id, delete_at: null },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await ticket.update({ code: newCode });

    console.log("Ticket code updated successfully:", newCode);
    res
      .status(200)
      .json({ message: "Ticket code updated successfully", code: newCode });
  } catch (error) {
    console.error("Error updating ticket code:", error);
    res.status(500).json({ message: error.message });
  }
};

// Función para crear un ticket
const createTicket = async (req, res) => {
  try {

    const {
      store_id,
      incident_date,
      incident_type_id,
      priority_id,
      owner_id,
      responsible_id,
      attachment,
      details,
      reception_date,
      amount,
      amount_type,
    } = req.body;

    if (
      !store_id ||
      !incident_date ||
      !incident_type_id ||
      !priority_id ||
      !owner_id ||
      !responsible_id
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos requeridos deben estar presentes" });
    }

    const formattedReceptionDate = reception_date
      ? new Date(reception_date).toISOString()
      : null;

    const code = "";

    const newTicket = await Ticket.create({
      code,
      incident_date,
      store_id,
      incident_type_id,
      status_id: 1,
      priority_id,
      owner_id,
      responsible_id,
      attachment,
      details,
      reception_date: formattedReceptionDate,
      amount,
      amount_type,
      conclusion_id: 1,

    });

    res.status(201).json(newTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: error.message });
  }
};

// Función para obtener todos los tickets
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: Store, as: "store" },
        { model: Status, as: "status" },
        { model: Priority, as: "priority" },
        { model: IncidentType, as: "incidentType" },
        { model: Conclusion, as: "conclusion" },
        { model: User, as: "owner" },
        { model: User, as: "responsible" },
      ],
      order: [["created_at", "DESC"]],
      where: { delete_at: null },
    });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Función para obtener un ticket por IDb
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({
      where: { id, delete_at: null },
      include: [
        { model: Store, as: "store" },
        { model: Status, as: "status" },
        { model: Priority, as: "priority" },
        { model: IncidentType, as: "incidentType" },
        { model: Conclusion, as: "conclusion" },
        { model: User, as: "owner" },
        { model: User, as: "responsible" },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para actualizar un ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      store_id,
      incident_date,
      incident_type_id,
      status_id,
      priority_id,
      conclusion_id,
      owner_id,
      responsible_id,
      status,
      attachment,
      details,
      reception_date,
      amount,
      amount_type,
    } = req.body;

    const ticket = await Ticket.findOne({
      where: { id, delete_at: null },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await ticket.update({
      store_id,
      incident_date,
      incident_type_id,
      status_id,
      priority_id,
      conclusion_id,
      owner_id,
      responsible_id,
      status_id: status,
      attachment,
      details,
      reception_date,
      amount,
      amount_type,
    });

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para actualizar solo el estado de un ticket
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id } = req.body;

    const ticket = await Ticket.findOne({
      where: { id, delete_at: null },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const status = await Status.findByPk(status_id);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    const updateData = { status_id };

    // Si el estado cambia a "in_progress", registrar la fecha de inicio de atención
    if (status.description === "in_progress" && !ticket.reception_date) {
      updateData.reception_date = new Date().toISOString();
    }

    await ticket.update(updateData);

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para eliminar un ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({
      where: { id, delete_at: null },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await ticket.update({ delete_at: new Date() });
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para obtener el Dashboard (estadísticas de tickets)
const getDashboard = async (req, res) => {
  try {
    const [results] = await sequelize.query("SELECT * FROM sch_cctv.fn_getdashboardstats()");

    const formattedResults = results.map((row) => ({
      status_description: row.status_description || row.statusdescription,
      priority_description: row.priority_description || row.prioritydescription,
      totalTickets: parseInt(row.totalTickets || row.totaltickets || 0, 10),
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para obtener los tickets en formato Kanban
const getKanban = async (req, res) => {

  console.log("REQUEST KANBAN", req.params);
  try {
    const { id } = req.params;

    const tickets = await Ticket.findAll({
      where: {
        [Op.or]: [{ responsible_id: id }],
        delete_at: null,
      },
      include: [
        { model: Status, as: "status" },
        { model: Priority, as: "priority" },
        { model: Store, as: "store" },
        { model: User, as: "owner" },
        { model: User, as: "responsible" },
        { model: IncidentType, as: "incidentType" },
      ],
    });

    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found" });
    }

    const kanbanData = {
      pending: tickets.filter((ticket) => ticket.status.description === "new"),
      inProgress: tickets.filter(
        (ticket) => ticket.status.description === "in_progress"
      ),
      completed: tickets.filter(
        (ticket) => ticket.status.description === "resolved"
      ),
      closed: tickets.filter(
        (ticket) => ticket.status.description === "closed"
      ),
    };

    res.status(200).json(kanbanData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para obtener interacciones de un ticket
const getInteractions = async (req, res) => {
  try {
    const { id } = req.params;
    const interactions = await Interaction.findAll({
      where: { ticket_id: id, delete_at: null },
      include: [{ model: User, as: "user" }],
      order: [["created_at", "ASC"]],
    });
    res.status(200).json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// all interactions
const getAllInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.findAll({
      where: { delete_at: null },
      include: [{ model: User, as: "user" }],
      order: [["created_at", "ASC"]],
    });
    res.status(200).json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Funcion para agregar una interacción a un ticket
const addInteraction = async (req, res) => {
  try {
    const { id } = req.params; // ID del ticket
    const { user_id, text, type } = req.body; // Recibir user_id y type desde el body

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const newInteraction = await Interaction.create({
      ticket_id: id,
      user_id: user_id, // Se usa el ID del usuario enviado desde el frontend
      interaction_type: type, // Tipo de interacción (comment, observation, additional_note)
      comment: text,
    });

    res.status(201).json(newInteraction);
  } catch (error) {
    console.error("Error en addInteraction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const interaction = await Interaction.findByPk(id);

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    await interaction.destroy();
    res.status(200).json({ message: "Interaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const interaction = await Interaction.findByPk(id);

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    await interaction.update({ comment: text });
    res.status(200).json(interaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { id } = req.params;
    const ticket = await Ticket.findOne({
      where: { id, delete_at: null },
    });
    if (!ticket) {
      console.error("No se encontró el ticket con ID:", id);
      return res.status(404).json({ message: "Ticket not found" });
    }

    // obtener el archivo subido
    const fileInfo = {
      filename: req.file.filename, // Nombre del archivo
    };

    // si ya hay archivos adjuntos agregar el nuevo archivo al array
    let attachments = [];
    if (ticket.attachment) {
      attachments = JSON.parse(ticket.attachment);
    }
    attachments.push(fileInfo);

    // aqui se guarda
    await ticket.update({ attachment: JSON.stringify(attachments) });

    res.status(200).json({ message: "File uploaded successfully", fileInfo });
  } catch (error) {
    console.error("Error en uploadDocument:", error);
    res.status(500).json({ message: error.message });
  }
};

const listAttachments = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({
      where: { id, delete_at: null },
    });

    if (!ticket) {
      console.error("No se encontró el ticket con ID:", id);
      return res.status(404).json({ message: "Ticket not found" });
    }

    const attachments = ticket.attachment ? JSON.parse(ticket.attachment) : [];

    res.status(200).json({ attachments });
  } catch (error) {
    console.error("Error en listAttachments:", error);
    res.status(500).json({ message: error.message });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const ticket = await Ticket.findOne({
      where: { id, delete_at: null },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const attachments = ticket.attachment ? JSON.parse(ticket.attachment) : [];
    const fileInfo = attachments.find((file) => file.filename === filename);

    if (!fileInfo) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = path.join(__dirname, "../../assets/attachments", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.type(path.extname(filename));

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).json({ message: "Error al descargar el archivo" });
      }
    });
  } catch (error) {
    console.error("Error en downloadAttachment:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateTicketCode,
  downloadAttachment,
  updateTicketStatus,
  getAllInteractions,
  deleteInteraction,
  updateInteraction,
  updateTicketCode,
  getInteractions,
  listAttachments,
  addInteraction,
  uploadDocument,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getDashboard,
  getTickets,
  getKanban,
};
