'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn(
			'Recipes',
			'details',
			{
				type: Sequelize.TEXT
			}
		)
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn(
			'Recipes',
			'details',
			{
				type: Sequelize.STRING
			}
		)
	}
};
