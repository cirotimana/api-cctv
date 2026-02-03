const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/database");
const Store = require("./Store");

class DvrControl extends Model {}

DvrControl.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    store_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    dvr_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    notification_email_in: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    notification_email_out: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    remote_connection_tool: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "None",
    },
    remote_connection_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notifications_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    supervisor: {
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
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tbl_store",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "DvrControl",
    tableName: "dvr_control",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeSave: (dvrControl) => {
        const fieldsToUpperCase = [
          "store_name",
          "company_name",
          "dvr_name",
          "remote_connection_tool",
          "remote_connection_id",
          "notes",
          "supervisor",
        ];

        const fieldsToLowerCase = [
          "notification_email_in",
          "notification_email_out",
        ];

        fieldsToUpperCase.forEach((field) => {
          if (dvrControl[field]) {
            dvrControl[field] = dvrControl[field].toUpperCase();
          }
        });

        fieldsToLowerCase.forEach((field) => {
          if (dvrControl[field]) {
            dvrControl[field] = dvrControl[field].toLowerCase();
          }
        });
      },
    },
  }
);

DvrControl.belongsTo(Store, { foreignKey: "store_id", as: "store" });

module.exports = DvrControl;
