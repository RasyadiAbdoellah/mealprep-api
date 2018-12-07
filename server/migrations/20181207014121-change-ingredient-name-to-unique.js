'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   return queryInterface.addConstraint(
    'Ingredients',
    ['name'],
    {
      type: "unique",
      name: "unique_name_idx"
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
  return queryInterface.removeConstraint(
    'Ingredients',
    'unique_name_idx'
  )
}
};
