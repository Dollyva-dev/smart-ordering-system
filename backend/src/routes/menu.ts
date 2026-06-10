import express from 'express';
import MenuItem from '../models/MenuItem';

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create a menu item
router.post('/', async (req, res) => {
  const item = new MenuItem({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    imageUrl: req.body.imageUrl,
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Update a menu item
router.patch('/:id', async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
       res.status(404).json({ message: 'Item not found' });
       return;
    }
    res.json(updatedItem);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a menu item
router.delete('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
       res.status(404).json({ message: 'Item not found' });
       return;
    }
    res.json({ message: 'Deleted menu item' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
