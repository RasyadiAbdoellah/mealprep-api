const express = require('express');
const router = express.Router();
const ingredientsController = require('../server/controllers').ingredientsController


router.post('/', ingredientsController.create)
router.get('/', ingredientsController.readAll)
router.get('/:id', ingredientsController.readOne)
router.put('/:id', ingredientsController.update)
router.delete('/:id', ingredientsController.destroy)

module.exports = router;