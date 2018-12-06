const Recipe = require('../models').Recipe
const Ingredient = require('../models').Ingredient
const RecipeIngredients = require('../models').RecipeIngredients

async function asyncForEach(array, callback) {
   for(let i = 0; i<array.length; i++){
     await callback(array[i], i, array)
   }
}

module.exports = {

  create(req, res) {
    /*
    What I want to happen: 
     1. create or find all the corresponding ingredient instances.
     2. Add the quantity value and scale to the corresponding ingredient instance
     3. create recipe
     4. associate the ingredient instance and set the val and scale attributes on RecipeIngredients join table.
     5. return the recipe and its associations.
    */
    
    const data = req.body.Recipe
    if(data.day < 1 || data.day >31) {
      data.day = null
    }

    //find or creates all ingredient instances found in data.Ingredients array.
      //the req array elements are objects with name, typeOf, quantity value, and scale keys.
    const ingredientData = data.Ingredients.map((ingredient, index, array) => Ingredient.findOrCreate({where: {name: ingredient.name}}).spread((instance, created) => {
      //return the found/created instance, and tack on the quantity scale and val.
      return {
        instance,
        val: ingredient.val,
        scale: ingredient.scale
      }
    }))

    //not sure if below will be neccessary.
    const quantities = data.Ingredients.map(ingredient => ingredient.quantity)

    //persistedRecipe is assigned the recipe object once it's created
    //This is done just so that we have access to it outside the promise chain
    let persistedRecipe

    return Recipe
      .create(data)
      .then(recipe => {
        // assign recipe instance to the variable above so that we have access to it outside this local scope.
        persistedRecipe = recipe
        
        //line below should evaluate into a Promise.all of association promises
        return Promise.all(ingredientData).then(values => {

          // the .map below creates an array of promises that resolve when an ingredient is successfully added to the join table.
          let assocPromise = values.map((obj, i, arr )=> recipe.addIngredient(obj.id, {through: { val: obj.val, scale: obj.scale}}))

          //return the above array wrapped in a Promise.all so we can chain a .then
          return Promise.all(assocPromise)
        })
      })
      .then(() => Recipe.find({where: {id: persistedRecipe.id}, include: [Ingredient]}))
      .then(recipe => res.status(201).send(recipe))
      .catch(error => res.status(400).send(error))
  },

  readAll(req, res) {
    /* 
    Due to the nature of the DB design, quantity value and scale are RecipeIngredient objects inside an Ingredient object.
    This is because the values are stored on the join table.
    
    */

    return Recipe
      .all({
        attributes:['id', 'name', 'details', 'day', 'week', 'month'],
        include: [
          {
            model: Ingredient,
            attributes:['id', 'name', 'typeOf'],
            through:{
              attributes: ['val', 'scale']
            }
          }
        ]
      })
      .then(recipes => res.status(200).send(recipes))
      .catch(error => res.status(400).send(error))
  },
  
  readOne(req, res){
    return Recipe
    .findById(req.params.id, {
      attributes:['id', 'name', 'details', 'day', 'week', 'month'],
      include: [
        {
          model: Ingredient,
          attributes:['id', 'name', 'typeOf'],
          through:{
            attributes: ['val', 'scale']
          }
        }
      ]
    })
    .then(recipe => {
      if (recipe){
        return recipe
      }
      else {
        throw new Error('no recipe found')
      }
    })
    .then(recipe => res.status(200).send(recipe))
    .catch(error => res.status(400).send(error))
  },

  update(req, res){
    
    const data = req.body.recipe

    if(data.day && (data.day < 1 || data.day >31)) {
      data.day = null
    }
    
    const ingredientData = data.Ingredients

    return Recipe
    .findById(req.params.id, {include: [Ingredient]})
    .then(async recipe => {
      console.log('top of then')
      if(recipe){
        const recipeInstance = recipe.get({plain: true})

        console.log('first if')
          if( !ingredientData || ingredientData.length === 0){
            console.log('in if no array')
            await recipe.setIngredients([])
          } else if (ingredientData.length >= recipeInstance.Ingredients.length){
            console.log('in else')
            await asyncForEach(ingredientData, e => {
              Ingredient.findOrCreate({ where: {name: e.name}}).spread((result,created) =>{
                  return recipe.addIngredient(result, { through: {val:e.val, scale: e.scale} })
                })
              })
          } else {
            
          }
      console.log('returning updated')
      return recipe.update(data)
      }else{
        throw new Error('invalid recipe ID')
      }
    })
    .then(recipe => {
      return Recipe.findById(recipe.get({plain: true}).id, {include : [Ingredient]})
    })
    .then(recipe => res.status(201).send(recipe))
    .catch(error => res.status(400).send(error))
  },

  destroy(req, res){
    return Recipe
    .findById(req.params.id,{ include: [Ingredient]})
    .then(recipe => {
      ingredients = recipe.get({plain: true}).Ingredients.map(e => e.id)
      console.log(ingredients)
      recipe.removeIngredients(ingredients).then(() => recipe.destroy())
    })
    .then(() => res.status(201).send('deleted'))
    .catch(error => res.status(400).send(error))
  }
}