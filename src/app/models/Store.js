const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database").sequelize;
const Company = require("./Company");

class Store extends Model {}

Store.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ceco: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supervisor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
    },
    status: {
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
  },
  {
    sequelize,
    modelName: "Store",
    tableName: "tbl_store",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Store.belongsTo(Company, { foreignKey: "company_id", as: "company" });

module.exports = Store;
