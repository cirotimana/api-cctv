const Permission = require("../models/Permission");
const Module = require("../models/Module");

const createPermission = async (req, res) => {
  try {
    const { name, description, module_id } = req.body;

    const moduleExists = await Module.findByPk(module_id);
    if (!moduleExists) {
      return res.status(404).json({ error: "Module not found" });
    }

    const permission = await Permission.create({
      name,
      description,
      module_id,
    });

    res.status(201).json({
      message: "Permission created successfully",
      id: permission.id,
      name: permission.name,
      module_id: permission.module_id,
      createdAt: permission.created_at,
    });
  } catch (error) {
    console.error("Error creating permission:", error);
    res.status(500).json({ error: "Error creating permission" });
  }
};

const getPermission = async (req, res) => {
  try {
    const permission = await Permission.findOne({
      where: { id: req.params.id, delete_at: null },
      include: [{ model: Module, as: "module" }],
    });

    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    const { module_id, ...permissionWithoutModuleId } = permission.toJSON();

    res.status(200).json(permissionWithoutModuleId);
  } catch (error) {
    console.error("Error retrieving permission:", error);
    res.status(500).json({ error: "Error retrieving permission" });
  }
};

const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      where: { delete_at: null },
      include: [{ model: Module, as: "module" }],
    });

    const groupedPermissions = permissions.reduce((acc, permission) => {
      const { module, ...permissionData } = permission.toJSON();
      if (!acc[module.name]) {
        acc[module.name] = {
          module: module,
          permissions: [],
        };
      }
      acc[module.name].permissions.push(permissionData);
      return acc;
    }, {});

    res.status(200).json(Object.values(groupedPermissions));
  } catch (error) {
    console.error("Error retrieving permissions:", error);
    res.status(500).json({ error: "Error retrieving permissions" });
  }
};

const updatePermission = async (req, res) => {
  try {
    const { name, description, module_id } = req.body;

    const permission = await Permission.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    if (module_id) {
      const moduleExists = await Module.findByPk(module_id);
      if (!moduleExists) {
        return res.status(404).json({ error: "Module not found" });
      }
    }

    await permission.update({ name, description, module_id });

    res.status(200).json({
      message: "Permission updated successfully",
      id: permission.id,
      name: permission.name,
      module_id: permission.module_id,
      updatedAt: permission.updated_at,
    });
  } catch (error) {
    console.error("Error updating permission:", error);
    res.status(500).json({ error: "Error updating permission" });
  }
};

const deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    await permission.update({ delete_at: new Date() });

    res.status(200).json({
      message: "Permission deleted successfully",
      id: permission.id,
    });
  } catch (error) {
    console.error("Error deleting permission:", error);
    res.status(500).json({ error: "Error deleting permission" });
  }
};

module.exports = {
  getAllPermissions,
  updatePermission,
  createPermission,
  deletePermission,
  getPermission,
};
