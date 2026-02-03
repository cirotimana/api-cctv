const sequelize = require("../../config/database").sequelize;
const { DataTypes, Model } = require("sequelize");
const User = require("./User");
const Ticket = require("./Ticket");

class Interaction extends Model {}

Interaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interaction_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  },
  {
    sequelize,
    modelName: "Interaction",
    tableName: "tbl_interaction",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Interaction.belongsTo(User, { foreignKey: "user_id", as: "user" });
Interaction.belongsTo(Ticket, { foreignKey: "ticket_id", as: "ticket" });

module.exports = Interaction;
