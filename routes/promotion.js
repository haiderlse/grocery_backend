
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotioncontroller');

// GET all promotions (can include query param for type)
// /api/promotions?type=banner
router.get('/', promotionController.getAllPromotions);

// GET a single promotion by ID
router.get('/:id', promotionController.getPromotionById);

// POST create a new promotion
router.post('/', promotionController.createPromotion);

// PUT update a promotion by ID
router.put('/:id', promotionController.updatePromotion);

// DELETE a promotion by ID
router.delete('/:id', promotionController.deletePromotion);

module.exports = router;
