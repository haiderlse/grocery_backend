const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller');

// GET all products (can include query params for category/tag)
// /api/products?category=Fruits&tag=Sale
router.get('/', productController.getAllProducts);

// GET search products
// /api/products/search?q=apple
router.get('/search', productController.searchProducts);

// GET a single product by ID
router.get('/:id', productController.getProductById);

// POST create a new product
router.post('/', productController.createProduct);

// PUT update a product by ID
router.put('/:id', productController.updateProduct);

// DELETE a product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;