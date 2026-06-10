import express from 'express';
import Table from '../models/Table';

const router = express.Router();

// Get all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new table
router.post('/', async (req, res) => {
  try {
    // Check if table already exists
    const existingTable = await Table.findOne({ tableNumber: req.body.tableNumber });
    if (existingTable) {
      res.status(400).json({ message: 'Table number already exists' });
      return;
    }

    const table = new Table({
      tableNumber: req.body.tableNumber,
      // For simplicity, we store the full URL path as the QR code data.
      qrCodeUrl: `http://localhost:3000/table/${req.body.tableNumber}`,
    });

    const newTable = await table.save();
    res.status(201).json(newTable);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a table
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }
    res.json({ message: 'Deleted table' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
