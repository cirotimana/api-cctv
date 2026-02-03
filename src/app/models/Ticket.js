const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database").sequelize;

// Importar los modelos necesarios
const IncidentType = require("./IncidentType");
const Conclusion = require("./Conclusion");
const Priority = require("./Priority");
const Status = require("./Status");
const Store = require("./Store");
const User = require("./User");

class Ticket extends Model {}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    incident_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    incident_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priority_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    conclusion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    responsible_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    delete_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    attachment: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "attachment",
    },

    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    reception_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    amount: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    amount_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

  },

  {
    sequelize,
    modelName: "Ticket",
    tableName: "tbl_ticket",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Relaciones con otras tablas (añadir claves foráneas)
Ticket.belongsTo(IncidentType, { foreignKey: "incident_type_id", as: "incidentType"});
Ticket.belongsTo(Conclusion, { foreignKey: "conclusion_id", as: "conclusion" });
Ticket.belongsTo(User, { foreignKey: "responsible_id", as: "responsible" });
Ticket.belongsTo(Priority, { foreignKey: "priority_id", as: "priority" });
Ticket.belongsTo(Status, { foreignKey: "status_id", as: "status" });
Ticket.belongsTo(Store, { foreignKey: "store_id", as: "store" });
Ticket.belongsTo(User, { foreignKey: "owner_id", as: "owner" });

module.exports = Ticket;
