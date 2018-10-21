const Recipe = require('../models').Recipe

module.exports = {
  create(req, res) {
    
    const data = req.body.recipe
    if(data.day < 1 || data.day >31) {
      data.day = null
    }
    return Recipe
      .create(data)
      .then(recipe => res.status(201).send(recipe))
      .catch(error => res.status(400).send(error))
  },

  readAll(req, res) {
    return Recipe
      .all()
      .then(recipes => res.status(200).send(recipes))
      .catch(error => res.status(400).send(error))
  },
  
  readOne(req, res){
    return Recipe
    .findById(req.params.id)
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