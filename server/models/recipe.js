'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define('Recipe', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    details: DataTypes.STRING,
    day: DataTypes.BIGINT
  }, {});
  Recipe.associate = function(models) {
    // associations can be defined here
  };
  return Recipe;
};