import express from 'express';
import Promotion from '../models/Promotion';

const router = express.Router();

// Get all promotions
router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('applicableItemIds', 'name imageUrl price')
      .populate('requiredItemIds', 'name imageUrl price')
      .sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching promotions' });
  }
});

// Create a promotion
router.post('/', async (req, res) => {
  try {
    const { 
      name, description, imageUrl, promoType, discountType, 
      discountValue, minOrderValue, applicableItemIds, 
      requiredItemIds, startDate, endDate, isActive,
      isFeatured, featuredPosition, featuredBadge
    } = req.body;
    
    if (!name || !promoType || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Name, promoType, discountType, and discountValue are required' });
    }

    const promotion = new Promotion({
      name,
      description,
      imageUrl,
      promoType,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      applicableItemIds: applicableItemIds || [],
      requiredItemIds: requiredItemIds || [],
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      featuredPosition,
      featuredBadge
    });

    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating promotion' });
  }
});

// Update a promotion
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const promotion = await Promotion.findByIdAndUpdate(id, updates, { new: true })
      .populate('applicableItemIds', 'name imageUrl price')
      .populate('requiredItemIds', 'name imageUrl price');
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating promotion' });
  }
});

// Delete a promotion
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByIdAndDelete(id);
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting promotion' });
  }
});

export default router;
