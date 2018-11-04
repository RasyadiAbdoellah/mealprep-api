const Recipe = require('../models').Recipe
const Ingredient = require('../models').Ingredient

async function asyncForEach(array, callback) {
   for(let i = 0; i<array.length; i++){
     await callback(array[i], i, array)
   }
}

module.exports = {

  //create checks if the data sent to server has an ingredients array. If it does, create expects every array element passed to be an Ingredient object with an id and uses this id to create a recipe-id association.
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
          let error
         await asyncForEach(ingredientData, async e => {
           if(e.id){
             const result = await recipe.addIngredient(e.id, { through: {val:e.val, scale: e.scale} })
           } else {
             error = new Error('invalid ingredient object')
           }
            console.log("this is the many to many result", result)
            })
          }

          return !error? recipe: error
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