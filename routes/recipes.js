const express = require('express');
const router = express.Router();
const recipesController = require('../server/controllers').recipesController


router.post('/', recipesController.asyncCreate)
router.get('/', recipesController.readAll)
router.get('/:id', recipesController.readOne)
router.patch('/:id', recipesController.asyncUpdate)
router.delete('/:id', recipesController.asyncDestroy)

module.exports = router;