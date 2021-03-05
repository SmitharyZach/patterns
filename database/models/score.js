"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class score extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.score.belongsTo(models.pattern, {
        foreignKey: "pattern_id",
      });
    }
  }
  score.init(
    {
      score: DataTypes.BOOLEAN,
      pattern_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "score",
    }
  );
  return score;
};
