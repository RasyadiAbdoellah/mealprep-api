const Ingredient = require('../models').Ingredient

module.exports = {
	create(req, res) {
		return Ingredient
			.create(req.body.ingredient)
			.then(ingredient => res.status(201).send(ingredient))
			.catch(error => res.status(400).send(error))
	},

	readAll(req, res) {
		return Ingredient
			.all()
			.then(ingredients => res.status(200).send(ingredients))
			.catch(error => res.status(400).send(error))
	},
  
	readOne(req, res){
		return Ingredient
			.findById(req.params.id)
			.then(ingredient => {
				if (ingredient){
					res.status(200).send(ingredient)
				}
				else {
					throw new Error('no ingredient found')
				}
			})
			.catch(error => res.status(400).send(error))
	},

	update(req, res){
		return Ingredient
			.findById(req.params.id)
			.then(ingredient => {
				if(ingredient){
					return ingredient.update(req.body.ingredient)
				}else{
					throw new Error('invalid ingredient ID')
				}
			})
			.then(ingredient => res.status(201).send(ingredient))
			.catch(error => res.status(400).send(error))
	},

	destroy(req, res){
		return Ingredient.findById(req.params.id)
			.then(ingredient => ingredient.destroy())
			.then(() => res.status(201).send('deleted'))
			.catch(error => res.status(400).send(error))
	}
}