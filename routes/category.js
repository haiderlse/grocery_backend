
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categorycontroller');

// GET all categories
router.get('/', categoryController.getAllCategories);

// GET a single category by ID
router.get('/:id', categoryController.getCategoryById);

// POST create a new category
router.post('/', categoryController.createCategory);

// PUT update a category by ID
router.put('/:id', categoryController.updateCategory);

// DELETE a category by ID
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
