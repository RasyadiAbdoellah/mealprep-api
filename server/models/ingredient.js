'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'other',
      validate: {
        isIn: [['carbs', 'fruit', 'veg', 'dairy', 'protein', 'seasoning & garnishes', 'other']]
      }
    }
  }, {});
  Ingredient.associate = function(models) {
    // associations can be defined here
  };
  return Ingredient;
};