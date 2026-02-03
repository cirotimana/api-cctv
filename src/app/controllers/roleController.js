const RolePermission = require("../models/RolePermission");
const Permission = require("../models/Permission");
const Role = require("../models/Role");

const createRole = async (req, res) => {
  try {
    const { name, description, permission_ids } = req.body;

    // Crear el rol
    const role = await Role.create({
      name,
      description,
    });

    // Asignar permisos al rol si se proporcionan
    if (permission_ids && permission_ids.length > 0) {
      for (const permission_id of permission_ids) {
        const permission = await Permission.findByPk(permission_id);
        if (!permission) {
          return res
            .status(404)
            .json({ error: `Permission with ID ${permission_id} not found` });
        }

        await RolePermission.create({
          role_id: role.id,
          permission_id: permission.id,
        });
      }
    }

    res.status(201).json({
      message: "Role created successfully",
      id: role.id,
      name: role.name,
      createdAt: role.createdAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating role", message: error.message });
  }
};

const getRole = async (req, res) => {
  try {
    const role = await Role.findOne({
      where: { id: req.params.id, delete_at: null },
      include: [
        {
          model: Permission,
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(200).json(role);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving role", message: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { delete_at: null },
      include: [
        {
          model: Permission,
          through: { attributes: [] },
        },
      ],
    });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving roles" });
    console.log(error);
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await Role.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    const { name, description, permission_ids } = req.body;

    // Validar que permission_ids sea un array
    if (permission_ids !== undefined && !Array.isArray(permission_ids)) {
      return res.status(400).json({ error: "permission_ids must be an array" });
    }

    // Actualizar los campos del rol
    role.name = name !== undefined ? name : role.name;
    role.description =
      description !== undefined ? description : role.description;
    await role.save();

    // Actualizar permisos solo si se proporcionan
    if (Array.isArray(permission_ids)) {
      await RolePermission.destroy({ where: { role_id: role.id } });

      for (const permission_id of permission_ids) {
        const permission = await Permission.findByPk(permission_id);
        if (!permission) {
          return res
            .status(404)
            .json({ error: `Permission with ID ${permission_id} not found` });
        }

        await RolePermission.create({
          role_id: role.id,
          permission_id: permission.id,
        });
      }
    }

    res.status(200).json({
      message: "Role updated successfully",
      id: role.id,
      name: role.name,
      updatedAt: role.updatedAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating role", message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Eliminar el rol (soft delete)
    await role.update({ delete_at: new Date() });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting role", message: error.message });
  }
};

const assignPermissionToRole = async (req, res) => {
  try {
    const { role_id, permission_id } = req.body;

    // Verificar si el rol existe
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Verificar si el permiso existe
    const permission = await Permission.findByPk(permission_id);
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Asignar el permiso al rol
    await RolePermission.create({
      role_id,
      permission_id,
    });

    res.status(201).json({
      message: "Permission assigned to role successfully",
      role_id,
      permission_id,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error assigning permission to role",
        message: error.message,
      });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const rolePermissions = await RolePermission.findAll({
      where: { role_id: req.params.id },
    });

    res.status(200).json(rolePermissions);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving role permissions" });
  }
};

module.exports = {
  assignPermissionToRole,
  getRolePermissions,
  getAllRoles,
  updateRole,
  deleteRole,
  createRole,
  getRole,
};
