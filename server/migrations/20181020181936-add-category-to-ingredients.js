'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   return queryInterface.addColumn(
     'Ingredients',
     'category',
     {
      type: Sequelize.ENUM,
      defaultValue: 'other',
      values: ['carbs', 'fruit', 'veg', 'dairy', 'protein', 'seasoning & garnishes', 'other']
    }
   )
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn(
      'Ingredients',
      'category'
    )
  }
};
