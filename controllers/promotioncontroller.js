
// At the very top of the file
console.log('--- DEBUG: [CONTROLLER] promotionController.js - START ---');

let Promotion;
try {
  const promotionModelModule = require('../models/PromotionModel');
  Promotion = promotionModelModule.Promotion; 

  if (!Promotion) {
    console.error('--- DEBUG: [CONTROLLER] CRITICAL: Promotion model is UNDEFINED after requiring from ../models/PromotionModel.js! Check PromotionModel.js export.');
  } else {
    console.log('--- DEBUG: [CONTROLLER] Promotion model appears to be loaded/defined. Type:', typeof Promotion);
  }
} catch (e) {
  console.error('--- DEBUG: [CONTROLLER] CRITICAL: ERROR occurred while requiring ../models/PromotionModel.js ---', e.message, e.stack);
}

// Get all promotions, optionally filtered by type
exports.getAllPromotions = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getAllPromotions - Handler called with query:', req.query);
  if (!Promotion) {
    console.error('--- DEBUG: [CONTROLLER] getAllPromotions - Promotion model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Promotion model not loaded.' });
  }
  try {
    const query = {};
    if (req.query.type && ['banner', 'card'].includes(req.query.type)) {
      query.type = req.query.type;
    }
    console.log('--- DEBUG: [CONTROLLER] getAllPromotions - Executing Promotion.find() with query:', query);
    const promotions = await Promotion.find(query);
    console.log('--- DEBUG: [CONTROLLER] getAllPromotions - Promotion.find() returned, count:', promotions.length);
    res.json(promotions);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getAllPromotions:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching promotions' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getAllPromotions. Type:', typeof exports.getAllPromotions);

// Get a single promotion by ID
exports.getPromotionById = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getPromotionById - Handler called for ID:', req.params.id);
  if (!Promotion) {
    console.error('--- DEBUG: [CONTROLLER] getPromotionById - Promotion model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Promotion model not loaded.' });
  }
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      console.log('--- DEBUG: [CONTROLLER] getPromotionById - Promotion not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Promotion not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] getPromotionById - Promotion found:', promotion.title);
    res.json(promotion);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getPromotionById:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Promotion not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching promotion' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getPromotionById. Type:', typeof exports.getPromotionById);

// Create a new promotion
exports.createPromotion = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] createPromotion - Handler called with body:', req.body);
  if (!Promotion) {
    console.error('--- DEBUG: [CONTROLLER] createPromotion - Promotion model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Promotion model not loaded.' });
  }
  try {
    const { title, description, imageUrl, type } = req.body;
    if (!title || !description || !imageUrl || !type) {
        return res.status(400).json({ message: 'Missing required fields: title, description, imageUrl, type.' });
    }
    if (!['banner', 'card'].includes(type)) {
        return res.status(400).json({ message: 'Invalid promotion type. Must be "banner" or "card".' });
    }

    const newPromotion = new Promotion(req.body);
    const promotion = await newPromotion.save();
    console.log('--- DEBUG: [CONTROLLER] createPromotion - Promotion saved:', promotion.title);
    res.status(201).json(promotion);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in createPromotion:', err.message, err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while creating promotion' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.createPromotion. Type:', typeof exports.createPromotion);

// Update a promotion by ID
exports.updatePromotion = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] updatePromotion - Handler called for ID:', req.params.id, 'with body:', req.body);
  if (!Promotion) {
    console.error('--- DEBUG: [CONTROLLER] updatePromotion - Promotion model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Promotion model not loaded.' });
  }
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No update data provided.' });
    }
    if (req.body.type && !['banner', 'card'].includes(req.body.type)) {
        return res.status(400).json({ message: 'Invalid promotion type. Must be "banner" or "card".' });
    }

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!promotion) {
      console.log('--- DEBUG: [CONTROLLER] updatePromotion - Promotion not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Promotion not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] updatePromotion - Promotion updated:', promotion.title);
    res.json(promotion);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in updatePromotion:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Promotion not found (invalid ID format)' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while updating promotion' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.updatePromotion. Type:', typeof exports.updatePromotion);

// Delete a promotion by ID
exports.deletePromotion = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] deletePromotion - Handler called for ID:', req.params.id);
  if (!Promotion) {
    console.error('--- DEBUG: [CONTROLLER] deletePromotion - Promotion model is not available!');
    return res.status(500).json({ message: 'Server configuration error: Promotion model not loaded.' });
  }
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      console.log('--- DEBUG: [CONTROLLER] deletePromotion - Promotion not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Promotion not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] deletePromotion - Promotion deleted:', promotion.title);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in deletePromotion:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Promotion not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting promotion' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.deletePromotion. Type:', typeof exports.deletePromotion);


// At the very end of the file
console.log('--- DEBUG: [CONTROLLER] promotionController.js - END ---');
console.log('--- DEBUG: [CONTROLLER] Final module.exports keys for promotionController:', Object.keys(module.exports));
console.log('--- DEBUG: [CONTROLLER] module.exports itself for promotionController:', module.exports);
