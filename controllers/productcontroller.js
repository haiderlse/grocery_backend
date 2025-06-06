
// At the very top of the file
console.log('--- DEBUG: [CONTROLLER] productController.js - START ---');

let Product;
try {
  const productModelModule = require('../models/ProductModel');
  Product = productModelModule.Product; 

  if (!Product) {
    console.error('--- DEBUG: [CONTROLLER] CRITICAL: Product model is UNDEFINED after requiring from ../models/ProductModel.js! Check ProductModel.js export.');
  } else {
    console.log('--- DEBUG: [CONTROLLER] Product model appears to be loaded/defined. Type:', typeof Product);
  }
} catch (e) {
  console.error('--- DEBUG: [CONTROLLER] CRITICAL: ERROR occurred while requiring ../models/ProductModel.js ---', e.message, e.stack);
}

// Get all products, optionally filtered by category or tag
exports.getAllProducts = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getAllProducts - Handler called with query:', req.query);
  if (!Product) {
    console.error('--- DEBUG: [CONTROLLER] getAllProducts - Product model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Product model not loaded.' });
  }
  try {
    const query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.tag) {
      // If tag is an array in query, handle it; otherwise, direct match
      query.tags = Array.isArray(req.query.tag) ? { $in: req.query.tag } : req.query.tag;
    }
    console.log('--- DEBUG: [CONTROLLER] getAllProducts - Executing Product.find() with query:', query);
    const products = await Product.find(query);
    console.log('--- DEBUG: [CONTROLLER] getAllProducts - Product.find() returned, count:', products.length);
    res.json(products);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getAllProducts:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getAllProducts. Type:', typeof exports.getAllProducts);


// Get a single product by ID
exports.getProductById = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getProductById - Handler called for ID:', req.params.id);
  if (!Product) {
    console.error('--- DEBUG: [CONTROLLER] getProductById - Product model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Product model not loaded.' });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('--- DEBUG: [CONTROLLER] getProductById - Product not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] getProductById - Product found:', product.name);
    res.json(product);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getProductById:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getProductById. Type:', typeof exports.getProductById);


// Search for products
exports.searchProducts = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] searchProducts - Handler called with query:', req.query.q);
  if (!Product) {
    console.error('--- DEBUG: [CONTROLLER] searchProducts - Product model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Product model not loaded.' });
  }
  try {
    const searchQuery = req.query.q;
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim() === '') {
      return res.status(400).json({ message: 'Search query "q" is required and must be a non-empty string.' });
    }
    // Using $text search requires a text index on the schema
    // const products = await Product.find({ $text: { $search: searchQuery.trim() } });
    // Fallback to regex search if text index is not set up or for more flexibility
    const regex = new RegExp(searchQuery.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'); // Escape special regex chars
    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } },
        { tags: { $regex: regex } } // Searches if any tag matches the regex
      ]
    });
    console.log('--- DEBUG: [CONTROLLER] searchProducts - Found products:', products.length);
    res.json(products);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in searchProducts:', err.message, err.stack);
    res.status(500).json({ message: 'Server error during product search' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.searchProducts. Type:', typeof exports.searchProducts);


// Create a new product
exports.createProduct = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] createProduct - Handler called with body:', req.body);
  if (!Product) {
    console.error('--- DEBUG: [CONTROLLER] createProduct - Product model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Product model not loaded.' });
  }
  try {
    // Basic validation for required fields
    const { name, description, price, imageUrl, category, stock } = req.body;
    if (!name || !description || price === undefined || !imageUrl || !category || stock === undefined) {
      return res.status(400).json({ message: 'Missing required fields: name, description, price, imageUrl, category, stock.' });
    }
    
    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    console.log('--- DEBUG: [CONTROLLER] createProduct - Product saved:', product.name);
    res.status(201).json(product);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in createProduct:', err.message, err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while creating product' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.createProduct. Type:', typeof exports.createProduct);


// Update a product
exports.updateProduct = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] updateProduct - Handler called for ID:', req.params.id, 'with body:', req.body);
  if (!Product) {
    console.error('--- DEBUG: [CONTROLLER] updateProduct - Product model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Product model not loaded.' });
  }
  try {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
    }
    // Using req.body directly with $set is generally safe if the body only contains valid fields for update.
    // Mongoose will only update fields present in req.body if they are also in the schema.
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!product) {
      console.log('--- DEBUG: [CONTROLLER] updateProduct - Product not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] updateProduct - Product updated:', product.name);
    res.json(product);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in updateProduct:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found (invalid ID format)' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while updating product' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.updateProduct. Type:', typeof exports.updateProduct);


// Delete a product
exports.deleteProduct = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] deleteProduct - Handler called for ID:', req.params.id);
  if (!Product) {
    console.error('--- DEBUG: [CONTROLLER] deleteProduct - Product model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Product model not loaded.' });
  }
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      console.log('--- DEBUG: [CONTROLLER] deleteProduct - Product not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] deleteProduct - Product deleted:', product.name);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in deleteProduct:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.deleteProduct. Type:', typeof exports.deleteProduct);

// At the very end of the file
console.log('--- DEBUG: [CONTROLLER] productController.js - END ---');
console.log('--- DEBUG: [CONTROLLER] Final module.exports keys:', Object.keys(module.exports));
console.log('--- DEBUG: [CONTROLLER] module.exports itself:', module.exports);
