/* eslint-disable no-unused-vars */
'use strict'
module.exports = (sequelize, DataTypes) => {
	const RecipeIngredients = sequelize.define(
		'RecipeIngredients',
		{
			RecipeId: DataTypes.INTEGER,
			IngredientId: DataTypes.INTEGER,
			val: DataTypes.INTEGER,
			scale: DataTypes.STRING,
		},
		{},
	)
	RecipeIngredients.associate = function(models) {
		// associations can be defined here
	}
	return RecipeIngredients
}
