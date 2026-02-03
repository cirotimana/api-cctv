const Status = require("../models/Status");

// Crear status
const createStatus = async (req, res) => {
  try {
    const { description } = req.body;
    const newStatus = await Status.create({ description });
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las statuses
const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.findAll({
      where: { delete_at: null },
    });
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener status por ID
const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findOne({
      where: { id, delete_at: null },
    });
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const status = await Status.findOne({
      where: { id, delete_at: null },
    });
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }
    await status.update({ description });
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar status
const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findOne({
      where: { id, delete_at: null },
    });
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }
    await status.update({ delete_at: new Date() });
    res.status(200).json({ message: "Status deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStatusById,
  createStatus,
  updateStatus,
  deleteStatus,
  getStatuses,
};

