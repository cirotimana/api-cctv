const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database").sequelize;
const Module = require("./Module");

class Permission extends Model {}

Permission.init(
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
            unique: true,
        },
        description: {
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
        module_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tbl_module',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
    },
    {
        sequelize,
        modelName: "Permission",
        tableName: "tbl_permission",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Permission.belongsTo(Module, {
    foreignKey: "module_id",
    as: "module",
});

module.exports = Permission;