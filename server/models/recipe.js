'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define('Recipe', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    details: DataTypes.STRING,
    day: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 7
      }
    },
    week: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 4
      }
    },
    month: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 12
      }
    },
  }, {});
  Recipe.associate = function(models) {
    // associations can be defined here
    Recipe.belongsToMany(models.Ingredient, {
      onDelete: 'CASCADE', 
      through: models.RecipeIngredients
    })
  };
  return Recipe;
};