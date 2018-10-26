const Recipe = require('../models').Recipe
const Ingredient = require('../models').Ingredient

async function asyncForEach(array, callback) {
   for(let i = 0; i<array.length; i++){
     await callback(array[i], i, array)
   }
}

module.exports = {

  // The app is designed so that ingredients work sort of like tags to a post, and are created when creating a new recipe. 
  // Due to this, the recipe create method has to create or find the ingredient, then 
  create(req, res) {
    
    const data = req.body.recipe
    if(data.day < 1 || data.day >31) {
      data.day = null
    }

    const ingredientData = data.ingredients

    return Recipe
      .create(data)
      .then(async recipe => {
        if(ingredientData){
         await asyncForEach(ingredientData, async e => {
            await Ingredient.findOrCreate({ where: {name: e.name}}).spread((result,created) =>{
                return recipe.addIngredient(result, { through: {val:e.val, scale: e.scale} })
              })
            })
          }
          return recipe
      })
      .then(recipe => Recipe.find({where: {id: recipe.id}, include: [Ingredient]}))
      .then(recipe => res.status(201).send(recipe))
      .catch(error => res.status(400).send(error))
  },

  readAll(req, res) {
    return Recipe
      .all({
        include: [Ingredient]
      })
      .then(recipes => res.status(200).send(recipes))
      .catch(error => res.status(400).send(error))
  },
  
  readOne(req, res){
    return Recipe
    .findById(req.params.id, {
      include: [Ingredient]
    })
    .then(recipe => {
      if (recipe){
        res.status(200).send(recipe)
      }
      else {
        throw new Error('no recipe found')
      }
    })
    .catch(error => res.status(400).send(error))
  },

  update(req, res){
    
    const data = req.body.recipe

    if(data.day && (data.day < 1 || data.day >31)) {
      data.day = null
    }
    
    return Recipe
    .findById(req.params.id)
    .then(recipe => {
      if(recipe){
       return recipe.update(data)
      }else{
        throw new Error('invalid recipe ID')
      }
    })
    .then(recipe => res.status(201).send(recipe))
    .catch(error => res.status(400).send(error))
  },

  destroy(req, res){
    return Recipe
    .findById(req.params.id)
    .then(recipe => recipe.destroy())
    .then(() => res.status(201).send('deleted'))
    .catch(error => res.status(400).send(error))
  }
}