"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pattern extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.pattern.belongsTo(models.user, {
        as: "patterns",
        foreignKey: "user_id",
      });
      models.pattern.hasMany(models.score);
    }
  }
  pattern.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "pattern",
    }
  );
  return pattern;
};
