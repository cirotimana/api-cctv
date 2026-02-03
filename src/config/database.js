const { Sequelize } = require("sequelize");
const config = require("../../config.json");


// Determinar el entorno actual (por defecto 'development')
const env = process.env.NODE_ENV || "development";

// Obtener la configuración correspondiente al entorno
const dbConfig = config[env];

console.log(dbConfig);

// Configuración de Sequelize con los datos del entorno actual
const sequelize = new Sequelize(
  config.DB_DATABASE,
  config.DB_USERNAME,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    dialect: config.DB_DIALECT,
    port: config.DB_PORT,
    schema: 'sch_cctv',
    searchPath: 'sch_cctv',
    timezone: '-05:00',
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
