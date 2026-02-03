const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/database");
const Store = require("./Store");

class DvrStatus extends Model {}

DvrStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
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
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notes: {
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
    store_ceco: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      references: {
        model: "tbl_store",
        key: "ceco",
      },
    },
  },
  {
    sequelize,
    modelName: "DvrStatus",
    tableName: "tbl_dvr_status",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeSave: (dvrControl) => {
        const fieldsToUpperCase = [
          "dvr_name",
          "remote_connection_tool",
          "notes",
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

DvrStatus.belongsTo(Store, { foreignKey: "store_ceco", targetKey: "ceco", as: "store" });

module.exports = DvrStatus;
