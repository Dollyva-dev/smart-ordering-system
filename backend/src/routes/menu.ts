import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import MenuItem from '../models/MenuItem';

const router = express.Router();

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// File upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
     res.status(400).json({ message: 'No file uploaded' });
     return;
  }
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl: fileUrl });
});

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
    customizationGroups: req.body.customizationGroups || [],
    isFeatured: req.body.isFeatured || false,
    featuredPosition: req.body.featuredPosition || null,
    featuredBadge: req.body.featuredBadge || null,
    discountPercent: req.body.discountPercent || 0,
    dietaryPreferences: req.body.dietaryPreferences || []
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

