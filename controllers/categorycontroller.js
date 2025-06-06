
// At the very top of the file
console.log('--- DEBUG: [CONTROLLER] categoryController.js - START ---');

let Category;
try {
  // Attempt to require the Category model
  const categoryModelModule = require('../models/CategoryModel');
  Category = categoryModelModule.Category; // Specifically access the Category property

  if (!Category) {
    console.error('--- DEBUG: [CONTROLLER] CRITICAL: Category model is UNDEFINED after requiring from ../models/CategoryModel.js! Check CategoryModel.js export (should be module.exports = { Category };). ---');
  } else {
    console.log('--- DEBUG: [CONTROLLER] Category model appears to be loaded/defined. Type:', typeof Category);
  }
} catch (e) {
  console.error('--- DEBUG: [CONTROLLER] CRITICAL: ERROR occurred while requiring ../models/CategoryModel.js ---', e.message, e.stack);
}

// Get all categories
exports.getAllCategories = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getAllCategories - Handler called ---');
  if (!Category) {
    console.error('--- DEBUG: [CONTROLLER] getAllCategories - Category model is not available (was undefined at module load)!');
    return res.status(500).json({ message: 'Server configuration error: Category model not loaded.' });
  }
  try {
    console.log('--- DEBUG: [CONTROLLER] getAllCategories - Executing Category.find()');
    const categories = await Category.find();
    console.log('--- DEBUG: [CONTROLLER] getAllCategories - Category.find() returned, count:', categories.length);
    res.json(categories);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getAllCategories:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getAllCategories. Type:', typeof exports.getAllCategories);


// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getCategoryById - Handler called for ID:', req.params.id);
  if (!Category) {
    console.error('--- DEBUG: [CONTROLLER] getCategoryById - Category model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Category model not loaded.' });
  }
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      console.log('--- DEBUG: [CONTROLLER] getCategoryById - Category not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Category not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] getCategoryById - Category found:', category.name);
    res.json(category);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getCategoryById:', err.message);
     if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching category' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getCategoryById. Type:', typeof exports.getCategoryById);


// Create a new category
exports.createCategory = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] createCategory - Handler called with body:', req.body);
  if (!Category) {
    console.error('--- DEBUG: [CONTROLLER] createCategory - Category model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Category model not loaded.' });
  }
  try {
    const { name, imageUrl } = req.body;
    if (!name || !imageUrl) {
        return res.status(400).json({ message: 'Category name and image URL are required.' });
    }
    const newCategory = new Category({ name, imageUrl });
    const category = await newCategory.save();
    console.log('--- DEBUG: [CONTROLLER] createCategory - Category saved:', category.name);
    res.status(201).json(category);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in createCategory:', err.message, err.stack);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.name) { // Duplicate key error
        return res.status(409).json({ message: `Category with name "${err.keyValue.name}" already exists.` });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while creating category' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.createCategory. Type:', typeof exports.createCategory);

// Update a category by ID
exports.updateCategory = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] updateCategory - Handler called for ID:', req.params.id, 'with body:', req.body);
  if (!Category) {
    console.error('--- DEBUG: [CONTROLLER] updateCategory - Category model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Category model not loaded.' });
  }
  try {
    const { name, imageUrl } = req.body;
    
    if (name === undefined && imageUrl === undefined) {
      return res.status(400).json({ message: 'No update data provided (name or imageUrl required).' });
    }

    const updateData = {};
    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') return res.status(400).json({ message: 'Category name must be a non-empty string.' });
        updateData.name = name.trim();
    }
    if (imageUrl !== undefined) {
        if (typeof imageUrl !== 'string' || imageUrl.trim() === '') return res.status(400).json({ message: 'Image URL must be a non-empty string.' });
        updateData.imageUrl = imageUrl.trim();
    }
    
    const category = await Category.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    
    if (!category) {
      console.log('--- DEBUG: [CONTROLLER] updateCategory - Category not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Category not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] updateCategory - Category updated:', category.name);
    res.json(category);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in updateCategory:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found (invalid ID format)' });
    }
    if (err.code === 11000 && err.keyPattern && err.keyPattern.name) {
        return res.status(409).json({ message: `Category with name "${err.keyValue.name}" already exists.` });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while updating category' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.updateCategory. Type:', typeof exports.updateCategory);

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] deleteCategory - Handler called for ID:', req.params.id);
  if (!Category) {
    console.error('--- DEBUG: [CONTROLLER] deleteCategory - Category model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Category model not loaded.' });
  }
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      console.log('--- DEBUG: [CONTROLLER] deleteCategory - Category not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Category not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] deleteCategory - Category deleted:', category.name);
    // Consider if products in this category should be handled (e.g., uncategorized, or prevent deletion if products exist)
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in deleteCategory:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.deleteCategory. Type:', typeof exports.deleteCategory);

// At the very end of the file
console.log('--- DEBUG: [CONTROLLER] categoryController.js - END ---');
console.log('--- DEBUG: [CONTROLLER] Final module.exports keys for categoryController:', Object.keys(module.exports));
console.log('--- DEBUG: [CONTROLLER] module.exports itself for categoryController:', module.exports);
