const UserRole = require("../models/UserRole");
const { addMonths } = require("date-fns");
const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  try {
    const { email, password, profile_image, username, is_active, role_id } =
      req.body;

    // Validar que se proporcione un role_id
    if (!role_id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    // Verificar si el rol existe
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Crear el usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      profile_image,
      username,
      is_active,
    });

    // Asignar el rol al usuario
    await UserRole.create({
      user_id: user.id,
      role_id: role.id,
    });

    res.status(201).json({
      message: "User created successfully",
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating user", message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, delete_at: null },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving user", message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { username, email, role_id, is_active } = req.query;
    const where = { delete_at: null };
    const { Op } = require("sequelize");

    if (username) {
      where.username = { [Op.iLike]: `%${username}%` };
    }
    if (email) {
      where.email = { [Op.iLike]: `%${email}%` };
    }
    if (is_active !== undefined && is_active !== "") {
      where.is_active = is_active === "true";
    }

    const include = [
      {
        model: Role,
        through: { attributes: [] },
      },
    ];

    if (role_id) {
      include[0].where = { id: role_id };
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ["password"] },
      include,
    });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving users", message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const {
      profile_image,
      is_active,
      password,
      username,
      role_id,
      email,
    } = req.body;


    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    user.email = email !== undefined ? email : user.email;
    user.profile_image = profile_image !== undefined ? profile_image : user.profile_image;
    user.username = username !== undefined ? username : user.username;
    user.is_active = is_active !== undefined ? is_active : user.is_active;

    await user.save();

    if (role_id !== undefined) {
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      await UserRole.destroy({ where: { user_id: user.id } });
      await UserRole.create({ user_id: user.id, role_id: role.id });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating user", message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.is_active = req.body.is_active;
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error updating user status" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Eliminar el registro en user_roles
    await UserRole.destroy({ where: { user_id: user.id } });

    // Eliminar el usuario
    await user.update({ delete_at: new Date() });
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting user", message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.params;

    // Validar que los campos requeridos estén presentes
    if (!newPassword) {
      return res
        .status(400)
        .json({ error: "New password is required" });
    }

    // Buscar al usuario por ID
    const user = await User.findOne({
      where: { id, delete_at: null },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña, flag_password y expiration_password
    user.password = hashedPassword;
    user.flag_password = true;
    user.expiration_password = addMonths(new Date(), 3);
    await user.save();

    res.status(200).json({ message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    res
      .status(500)
      .json({
        error: "Error al cambiar la contraseña",
        message: error.message,
      });
  }
};

module.exports = {
  updateUserStatus,
  changePassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
};
