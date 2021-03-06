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
     'typeOf',
     {
      type: Sequelize.ENUM,
      defaultValue: 'uncategorized',
      values: ['carbs', 'fruit', 'veg', 'dairy', 'protein', 'seasoning & garnishes', 'other', 'uncategorized']
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
    const query = 'ALTER TABLE \"Ingredients\" DROP COLUMN \"typeOf\"; ' +
    'DROP TYPE \"enum_Ingredients_typeOf\"'

    return queryInterface.sequelize.query(query)
  }
};
