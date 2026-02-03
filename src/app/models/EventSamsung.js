const { sequelize } = require("../../config/database");
const { DataTypes, Model } = require("sequelize");
const DvrControl = require("./DvrControl");
const Store = require("./Store");

class EventSamsung extends Model {}

EventSamsung.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    mac_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    event_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "observations",
    },
    attachment: {
      type: DataTypes.STRING,
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
    modelName: "EventSamsung",
    tableName: "tbl_event_samsung",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

EventSamsung.belongsTo(DvrControl, {
  foreignKey: "external_id",
  targetKey: "external_id",
  as: "dvrControl",
});

EventSamsung.belongsTo(Store, {
  foreignKey: "external_id",
  targetKey: "ceco",
  as: "store",
});

module.exports = EventSamsung;
