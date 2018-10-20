const Recipe = require('../models').Recipe

module.exports = {
  create(req, res) {
    return Recipe
      .create({
        name: req.body.name,
        details: req.body.details,
        day: (req.body.day && req.body.day <=31 && req.body.day >= 1) ? req.body.day : null
      })
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
        res.status(400).send('no recipe found')
      }
    })
    .catch(error => res.status(400).send(error))
  },

  update(req, res){
    return Recipe
    .findById(req.params.id)
    .then(recipe => {
      if(recipe){
        recipe.update({
          name: req.body.name,
          details: req.body.details,
          day: (req.body.day <=31 && req.body.day >= 1) ? req.body.day : null
        })
        .then(recipe => res.status(201).send(recipe))
        .catch(error => res.status(400).send(error))
      }else{
        res.status(400).send('no recipe found')
      }
    })
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