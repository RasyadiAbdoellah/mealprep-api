const Recipe = require('../models').Recipe
const Ingredient = require('../models').Ingredient
const RecipeIngredients = require('../models').RecipeIngredients
const sequelize = require('../models').sequelize

function simplifyRecipe(Recipe){
    Recipe.Ingredients.forEach(e => {
    const flat = Object.assign(e, e.RecipeIngredients)
    delete flat.RecipeIngredients
    e = flat
  })
  return Recipe
}


module.exports = {

  //create has been replaced with asyncCreate for now. Will need testing
  create(req, res) {
    const data = req.body.Recipe
    //bulkCreates any new ingredients.
    Ingredient.bulkCreate(
      data.Ingredients,
      { fields:['name'], ignoreDuplicates:true}
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
              // not too sure why it has to return a promise.all, but my best guess is since transactions require a promise chain to be returned, not returning a promise commits the transaction after the first query.
              return Promise.all(associations)
            })
        })
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
        res.status(400).send(error)
      })
  },

  async asyncCreate(req, res) {
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
     const {Ingredients} = data
     const recipe = await Recipe.create(data)
     let ingredients = Ingredients.map( e => {
       return Ingredient.findOrCreate({where: {name: e.name}}).spread((ingredient, created) => {
         return { id: ingredient.id, val: e.val, scale: e.scale}
       })
     })
     //resassign ingredients to the value of the promise array
     ingredients = await Promise.all(ingredients).then(values => values)
 
     const association = ingredients.map(e => {
       return recipe.addIngredient(e.id, {through: {val: e.val, scale: e.scale}})
     })
     
     //wait till the associations are created
     await Promise.all(association)
     //reload with new relationshps
     await recipe.reload({
       include: [
         {model: Ingredient, attributes:['id', 'name', 'typeOf'],
           through:{
             attributes: ['val', 'scale']
           }
         }]
     })
     
     const simplified = simplifyRecipe(recipe.get({plain: true}))
     
     res.status(200).send(simplified)
   }
   catch(error){
     res.status(400).send(error)
   }
    
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
      .then(recipes => recipes.map(el => {
        const simplified = simplifyRecipe(el.get({plain: true}))
        return simplified
      }))
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
        const simplified = simplifyRecipe(recipe.get({plain: true}))
        return simplified
      }
      else {
        throw new Error('no recipe found')
      }
    })
    .then(recipe => res.status(200).send(recipe))
    .catch(error => res.status(400).send(error))
  },

  async asyncUpdate(req, res){ 
    const data = req.body.recipe
    const {Ingredients} = data
    let ingredients
    return Recipe
    .findById(req.params.id, {include: [Ingredient]})
    .then(async recipe => {
      if(recipe){
        const recipeInstance = recipe.get({plain: true})

        console.log('first if')
          if( !Ingredients || Ingredients.length === 0){
            console.log('in if no array')
            await recipe.setIngredients([])
          } else if (
            (Ingredients.length !== recipeInstance.Ingredients.length) &&
            (Ingredients.length !== 0 )
          ){
            console.log('in else')
            const associations = Ingredients.map(e => recipeInstance.addIngredients(e.id))

            await Promise.all(associations)
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