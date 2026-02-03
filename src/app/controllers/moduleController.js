const Module = require("../models/Module");

const createModule = async (req, res) => {
    try {
        const { name, description } = req.body;
        const module = await Module.create({
            name,
            description,
        });

        res.status(201).json({
            message: "Module created successfully",
            id: module.id,
            name: module.name,
            createdAt: module.createdAt,
        });
    } catch (error) {
        res
            .status(500)
            .json({ error: "Error creating module", message: error.errors[0].message });
    }
};

const getModule = async (req, res) => {
    try {
        const module = await Module.findOne({
            where: { id: req.params.id, delete_at: null },
        });

        if (!module) {
            return res.status(404).json({ error: "Module not found" });
        }

        res.status(200).json(module);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving module" });
    }
};

const getAllModules = async (req, res) => {
    try {
        const modules = await Module.findAll({
            where: { delete_at: null },
        });
        res.status(200).json(modules);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving modules" });
        console.log(error);
    }
};

const updateModule = async (req, res) => {
    try {
        const module = await Module.findOne({
            where: { id: req.params.id, delete_at: null },
        });
        if (!module) {
            return res.status(404).json({ error: "Module not found" });
        }

        const { name, description } = req.body;
        await module.update({ name, description });

        res.status(200).json({
            message: "Module updated successfully",
            id: module.id,
            name: module.name,
            updatedAt: module.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ error: "Error updating module" });
    }
};

const deleteModule = async (req, res) => {
    try {
        const module = await Module.findOne({
            where: { id: req.params.id, delete_at: null },
        });
        if (!module) {
            return res.status(404).json({ error: "Module not found" });
        }

        await module.update({ delete_at: new Date() });
        res.status(200).json({ message: "Module deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting module" });
    }
};

module.exports = {
    getAllModules,
    createModule,
    updateModule,
    deleteModule,
    getModule,
};