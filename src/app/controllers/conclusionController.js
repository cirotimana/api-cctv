const Conclusion = require('../models/Conclusion');

// Crear conclusión
const createConclusion = async (req, res) => {
    try {
        const { description } = req.body;
        const newConclusion = await Conclusion.create({ description });
        res.status(201).json(newConclusion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todas las conclusiones
const getConclusions = async (req, res) => {
    try {
        const conclusions = await Conclusion.findAll({
            where: { delete_at: null },
        });
        res.status(200).json(conclusions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener conclusión por ID
const getConclusionById = async (req, res) => {
    try {
        const { id } = req.params;
        const conclusion = await Conclusion.findOne({
            where: { id, delete_at: null },
        });
        if (!conclusion) {
            return res.status(404).json({ message: 'Conclusion not found' });
        }
        res.status(200).json(conclusion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar conclusión
const updateConclusion = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const conclusion = await Conclusion.findOne({
            where: { id, delete_at: null },
        });
        if (!conclusion) {
            return res.status(404).json({ message: 'Conclusion not found' });
        }
        await conclusion.update({ description });
        res.status(200).json(conclusion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar conclusión
const deleteConclusion = async (req, res) => {
    try {
        const { id } = req.params;
        const conclusion = await Conclusion.findOne({
            where: { id, delete_at: null },
        });
        if (!conclusion) {
            return res.status(404).json({ message: 'Conclusion not found' });
        }
        await conclusion.update({ delete_at: new Date() });
        res.status(200).json({ message: 'Conclusion deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createConclusion,
    getConclusionById,
    updateConclusion,
    deleteConclusion,
    getConclusions,
};
