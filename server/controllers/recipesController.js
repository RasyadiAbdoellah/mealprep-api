const Recipe = require('../models').Recipe
const Ingredient = require('../models').Ingredient
// const RecipeIngredients = require('../models').RecipeIngredients
const sequelize = require('../models').sequelize
const diff = require('lodash').differenceWith
const isEq = require('lodash').isEqual

function simplifyRecipe(RecipeInstance){
//simplifyRecipe takes either a Recipe instance or a recipe object and returns a simplified version where the ingredient array elements are flat objects
	let Recipe
	try{
		Recipe = RecipeInstance.get({plain: true})
	}catch(error){
		Recipe = RecipeInstance
	}
	Recipe.Ingredients.forEach(e => {
		const flat = Object.assign(e, e.RecipeIngredients)
		delete flat.RecipeIngredients
		e = flat
	})
	return Recipe
}

function getIngredientInstances(ingredientReqArray) {
// getIngredientInstances receives an array of ingredient names and maps promises that resolve to retrieved or created Ingredient instances. 
// function returns a promise that resolves into an array of retrieved/created ingredient id, and request's original ingredint quantity value and scale.
	const ingredients = ingredientReqArray.map( e => {
		return Ingredient.findOrCreate({where: {name: e.name}}).spread((ingredient, created) => {
			return { id: ingredient.id, val: e.val, scale: e.scale}
		})
	})

	return Promise.all(ingredients).then(values => values)
}

function ingredientAssociations(toAdd, toRemove, recipeInstance){
	const remove = toRemove.map( e => {
		return recipeInstance.removeIngredient(e.id)
	})	
	const add = toAdd.map( e => {
		return recipeInstance.addIngredient(e.id, {through: {val: e.val, scale: e.scale}})
	})
	const promises = [Promise.all(remove), Promise.all(add)]
	return Promise.all(promises)
} 


module.exports = {
	async create(req, res) {
		/*
    What I want to happen: 
     1. create or find all the corresponding ingredient instances.
     2. Add the quantity value and scale to the corresponding ingredient instance
     3. create recipe
     4. associate the ingredient instance and set the val and scale attributes on RecipeIngredients join table.
     5. return the recipe and its associations.

     notes: a recipe has to have an ingredient

     a recipe object = Recipe:{
      name: required ,
      details,
      day,
      week,
      month,
      Ingredients: [
        {
          name: required -unique,
          val,
          scale,
        }
      ]

     }
    */
   
		try{
			const data = req.body.Recipe
			const recipe = await Recipe.create(data)
			const ingredients = await getIngredientInstances(data.Ingredients)
			
			await ingredientAssociations(ingredients, [], recipe)
	
			//reload with new relationshps
			await recipe.reload({
				include: [{
					model: Ingredient, attributes:['id', 'name', 'typeOf'],
					through:{
						attributes: ['val', 'scale']
					}
				}]
			})
			res.status(200).send(simplifyRecipe(recipe))
		}
		catch(error){
			res.status(400).send(error.toString())
		}
    
	},



	readAll(req, res) {
		/* 
    Quantity value and scale are RecipeIngredient objects inside an Ingredient object in the Ingredients array.
    This is because the values are stored on the join table.
    */

		return Recipe
			.all({
				include: [{
					model: Ingredient,
					attributes:['id', 'name', 'typeOf'],
					through:{
						attributes: ['val', 'scale']
					}
				}]
			})
			.then(recipes => recipes.map(el => {
				// calls simplifyRecipe to flatten returned Ingredient objects
				return simplifyRecipe(el.get({plain: true}))
			}))
			.then(recipes => res.status(200).send(recipes))
			.catch(error => res.status(400).send(error.toString()))
	},
  
	readOne(req, res){
		return Recipe
			.findById(req.params.id, {
				include: [{
					model: Ingredient,
					attributes:{exclude:['createdAt','updatedAt']},
					through:{
						attributes: ['val', 'scale']
					}
				}]
			})
			.then(recipe => {
				if (recipe){
					return simplifyRecipe(recipe.get({plain: true}))
				}
				else {
					throw new Error('no recipe found')
				}
			})
			.then(recipe => res.status(200).send(recipe))
			.catch(error => res.status(400).send(error))
	},

	async update(req, res){
		try{
			const recipe = await Recipe.findById(req.params.id, { 
				include: [{
					model: Ingredient,
					attributes:['id'],
					through:{
						attributes: ['val', 'scale']
					}
				}]
			}
			)
			const data = req.body.Recipe

			let modifiedIngredients, originalIngredients
			originalIngredients = simplifyRecipe(recipe).Ingredients
			modifiedIngredients = await getIngredientInstances(data.Ingredients)
			
			await recipe.update(data)

			const ingredientsToRemove = diff(originalIngredients, modifiedIngredients, isEq)
			const ingredientsToAdd = diff(modifiedIngredients, originalIngredients, isEq)

			await ingredientAssociations(ingredientsToAdd, ingredientsToRemove, recipe)

			await recipe.reload({
				include: [
					{model: Ingredient, attributes:{exclude:['createdAt','updatedAt']},
						through:{
							attributes: ['val', 'scale']
						}
					}]
			})
			res.status(201).send(simplifyRecipe(recipe))
		}
		catch(error){
			res.status(400).send(error.toString())
		}
	},


	async destroy(req, res){
		try{
			//find recipe by id
			const recipe = await Recipe.findById(req.params.id,{ include: [Ingredient]})
			//map ingredient ids to new array
			const ingredientIds = recipe.get({plain: true}).Ingredients.map(e => e.id)
			//use ingredientId array to un-associate ingredients, then immediately destroy the recipe
			await recipe.removeIngredients(ingredientIds).then(() => recipe.destroy())
			//send 201
			res.status(201).send()

		}
		catch(error){
			//create more robust error reporting later
			res.status(400).send(error)
		}
	}
}