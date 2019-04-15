'use strict'
module.exports = (sequelize, DataTypes) => {
	const Ingredient = sequelize.define(
		'Ingredient',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					notEmpty: true,
				},
			},
			typeOf: {
				type: DataTypes.ENUM,
				defaultValue: 'uncategorized',
				values: [
					'carbs',
					'fruit',
					'veg',
					'dairy',
					'protein',
					'seasoning & garnishes',
					'other',
					'uncategorized',
				],
			},
		},
		{},
	)
	Ingredient.associate = function(models) {
		// associations can be defined here
		Ingredient.belongsToMany(models.Recipe, {
			onDelete: 'CASCADE',
			through: models.RecipeIngredients,
		})
	}
	return Ingredient
}
