const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database").sequelize;

class UserRole extends Model {}

UserRole.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tbl_user",
        key: "id",
      },
      onUpdate: "CASCADE", 
      onDelete: "CASCADE", 
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tbl_role",
        key: "id",
      },

      onUpdate: "CASCADE", 
      onDelete: "CASCADE", 
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
    modelName: "UserRole",
    tableName: "tbl_user_role", 
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = UserRole;
