const { isBefore, startOfDay } = require("date-fns");
const Permission = require("../models/Permission");
const { createToken } = require("../utils/jwt");
const Module = require("../models/Module");
const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Función auxiliar para buscar al usuario por email
const findUserByEmail = async (email) => {
  return await User.findOne({
    where: { email, delete_at: null },
    include: [
      {
        model: Role,
        include: [
          {
            model: Permission,
            include: [Module],
          },
        ],
      },
    ],
  });
};

// Función auxiliar para verificar la expiración de la contraseña
const isPasswordExpired = (user) => {
  return (
    user.flag_password === true &&
    isBefore(
      startOfDay(new Date(user.expiration_password)),
      startOfDay(new Date())
    )
  );
};

// Función auxiliar para manejar la expiración de la contraseña
const handlePasswordExpiration = async (user) => {
  await user.update({ flag_password: false });
  return {
    expired: true,
    message: "La contraseña ha caducado",
  };
};

// Función auxiliar para verificar la contraseña
const verifyPassword = async (inputPassword, userPassword) => {
  return await bcrypt.compare(inputPassword, userPassword);
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verificar expiración de la contraseña
    if (isPasswordExpired(user)) {
      await handlePasswordExpiration(user);
    }

    // Verificar si la contraseña es correcta
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Crear token
    const token = await createToken({ userId: user.id });
    res.cookie("token", token);

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Error during login" });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error during logout" });
  }
};

// Get user profile
const profile = async (req, res) => {
  try {
    // Find user by id
    const user = await User.findOne({
      where: { id: req.userId, delete_at: null },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error retrieving user" });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({
      where: { id: decodedToken.userId, delete_at: null },
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
              include: [Module],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user,
      token,
    });
  });
};

module.exports = {
  verifyToken,
  profile,
  logout,
  login,
};
