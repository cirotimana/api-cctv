const { sequelize } = require("../../config/database");
const { DataTypes, Model } = require("sequelize");
const DvrControl = require("./DvrControl");
const Store = require("./Store");

class EventHv extends Model {}

EventHv.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dvr_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dvr_serial_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    camera_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "new",
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "attachment",
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
    inbox_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EventHv",
    tableName: "tbl_event_hv",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

EventHv.belongsTo(DvrControl, {
  foreignKey: "external_id",
  targetKey: "external_id",
  as: "dvrControl",
});

EventHv.belongsTo(Store, {
  foreignKey: "external_id",
  targetKey: "ceco",
  as: "store",
});

module.exports = EventHv;
