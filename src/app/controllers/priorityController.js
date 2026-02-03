const Priority = require("../models/Priority");

// Crear priority
const createPriority = async (req, res) => {
  try {
    const { description } = req.body;
    const newPriority = await Priority.create({ description });
    res.status(201).json(newPriority);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las priorities
const getPriorities = async (req, res) => {
  try {
    const priorities = await Priority.findAll({
      where: { delete_at: null },
    });
    res.status(200).json(priorities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener priority por ID
const getPriorityById = async (req, res) => {
  try {
    const { id } = req.params;
    const priority = await Priority.findOne({
      where: { id, delete_at: null },
    });
    if (!priority) {
      return res.status(404).json({ message: "Priority not found" });
    }
    res.status(200).json(priority);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar priority
const updatePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const priority = await Priority.findOne({
      where: { id, delete_at: null },
    });
    if (!priority) {
      return res.status(404).json({ message: "Priority not found" });
    }
    await priority.update({ description });
    res.status(200).json(priority);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar priority
const deletePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const priority = await Priority.findOne({
      where: { id, delete_at: null },
    });
    if (!priority) {
      return res.status(404).json({ message: "Priority not found" });
    }
    await priority.update({ delete_at: new Date() });
    res.status(200).json({ message: "Priority deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPriorityById,
  updatePriority,
  createPriority,
  deletePriority,
  getPriorities,
};
