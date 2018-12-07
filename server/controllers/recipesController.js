const Recipe = require('../models').Recipe
const Ingredient = require('../models').Ingredient
const RecipeIngredients = require('../models').RecipeIngredients
const sequelize = require('../models').sequelize

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

    const data = req.body.Recipe
    
    //1. find or creates all ingredient instances found in data.Ingredients array. The first part of the function bulkCreates any new ingredients.
    Ingredient.bulkCreate(
      data.Ingredients,
      {
        fields:['name'],
        ignoreDuplicates:true,
      }
      )
    // map a new array of promises that resolve to an object with the ingredient id, quantity value, and scale  
    const ingredientData = data.Ingredients.map((ingredient, index, array) => {
      return Ingredient.find({where: {name: ingredient.name}}).then(instance => {
      //return the found/created instance, and tack on the quantity scale and val.
        return {
          id: instance.id,
          val: ingredient.val,
          scale: ingredient.scale
          }
        })
      })

    //persistedRecipe is assigned the recipe object once it's created
    //This is done just so that we have access to it outside the promise chain
    let persistedRecipe
    
    return Promise.all(ingredientData)
      .then(ingredientValues => {

        //initialize a transaction so that the below methods to DB happen together
        return sequelize.transaction((t) => {
          return Recipe
            .create(data, {transaction: t})
            .then(recipe => {
              persistedRecipe = recipe
              const associations = ingredientValues.map(ingredient => {
                  return recipe.addIngredient(ingredient.id, {through: {val: ingredient.val, scale: ingredient.scale}, transaction: t})
              })
              //
              return Promise.all(associations)
            })
        })
        
        //line below should evaluate into a Promise.all of association promises
        // return Promise.all(ingredientData).then(values => {

        //   // the .map below creates an array of promises that resolve when an ingredient is successfully added to the join table.
        //   let assocPromise = values.map( obj => {
        //     console.log('in assocPromise map')
        //     return recipe.addIngredient(obj.id, {through: { val: obj.val, scale: obj.scale}})})

        //   //return the above array wrapped in a Promise.all so we can chain a .then

        //   return Promise.all(assocPromise)
        // })
      })
      .then(() => Recipe.find({where: {id: persistedRecipe.id}, include: [
        {
          model: Ingredient,
          attributes:['id', 'name', 'typeOf'],
          through:{
            attributes: ['val', 'scale']
          }
        }
      ]}))
      .then(recipe => res.status(201).send(recipe))
      .catch(error => {
        console.log(error)
        res.status(400).send(error)
      })
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