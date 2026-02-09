const { Sequelize } = require("sequelize");
require("dotenv").config(); // Ensure dotenv is loade

// Determinar el entorno actual (por defecto 'development')
const env = process.env.NODE_ENV || "development";

// Configuración de Sequelize con los datos del entorno actual
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    schema: 'sch_cctv',
    searchPath: 'sch_cctv',
    timezone: '-05:00',
    logging: false, // Optional: disable logging for cleaner output
  }
);

// Función para conectar a la base de datos
const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      `Connection to ${env} database has been established successfully.`
    );
  } catch (error) {
    console.error(`Unable to connect to the ${env} database:`, error);
  }
};

module.exports = { sequelize, connect };
