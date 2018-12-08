const express = require('express');
const router = express.Router();
const recipesController = require('../server/controllers').recipesController


router.post('/', recipesController.create)
router.get('/', recipesController.readAll)
router.get('/:id', recipesController.readOne)
router.patch('/:id', recipesController.update)
router.delete('/:id', recipesController.destroy)

module.exports = router;