'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    typeOf: {
      type: DataTypes.ENUM,
      defaultValue: 'uncategorized',
      values: ['carbs', 'fruit', 'veg', 'dairy', 'protein', 'seasoning & garnishes', 'other', 'uncategorized']
    }
  }, {});
  Ingredient.associate = function(models) {
    // associations can be defined here
  };
  return Ingredient;
};