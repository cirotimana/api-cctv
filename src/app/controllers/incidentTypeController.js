const IncidentType = require('../models/IncidentType');

// Crear incident type
const createIncidentType = async (req, res) => {
    try {
        const { name } = req.body;
        const newIncidentType = await IncidentType.create({ name });
        res.status(201).json(newIncidentType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todos los incident types
const getIncidentTypes = async (req, res) => {
    try {
        const incidentTypes = await IncidentType.findAll({
            where: { delete_at: null },
        });
        res.status(200).json(incidentTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener incident type por ID
const getIncidentTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const incidentType = await IncidentType.findOne({
            where: { id, delete_at: null },
        });
        if (!incidentType) {
            return res.status(404).json({ message: 'IncidentType not found' });
        }
        res.status(200).json(incidentType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar incident type
const updateIncidentType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const incidentType = await IncidentType.findOne({
            where: { id, delete_at: null },
        });
        if (!incidentType) {
            return res.status(404).json({ message: 'IncidentType not found' });
        }
        await incidentType.update({ name });
        res.status(200).json(incidentType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar incident type
const deleteIncidentType = async (req, res) => {
    try {
        const { id } = req.params;
        const incidentType = await IncidentType.findOne({
            where: { id, delete_at: null },
        });
        if (!incidentType) {
            return res.status(404).json({ message: 'IncidentType not found' });
        }
        await incidentType.update({ delete_at: new Date() });
        res.status(200).json({ message: 'IncidentType deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getIncidentTypeById,
    updateIncidentType,
    createIncidentType,
    deleteIncidentType,
    getIncidentTypes,
};
