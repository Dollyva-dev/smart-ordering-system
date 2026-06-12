import express from 'express';
import FloorPlan from '../models/FloorPlan';
import Table from '../models/Table';

const router = express.Router();

// Get all floor plans
router.get('/', async (req, res) => {
  try {
    const floorPlans = await FloorPlan.find().sort({ createdAt: 1 });
    res.json(floorPlans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new floor plan
router.post('/', async (req, res) => {
  try {
    const { name, elements } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Floor name is required' });
    }
    
    const newFloorPlan = new FloorPlan({
      name,
      elements: elements || []
    });
    
    await newFloorPlan.save();
    res.status(201).json(newFloorPlan);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update a specific floor plan
router.put('/:id', async (req, res) => {
  try {
    const { name, elements } = req.body;
    const floorPlan = await FloorPlan.findById(req.params.id);
    
    if (!floorPlan) {
      return res.status(404).json({ message: 'Floor plan not found' });
    }
    
    if (name) floorPlan.name = name;
    if (elements) floorPlan.elements = elements;
    
    await floorPlan.save();
    res.json(floorPlan);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a floor plan and its tables
router.delete('/:id', async (req, res) => {
  try {
    const floorPlan = await FloorPlan.findById(req.params.id);
    if (!floorPlan) {
      return res.status(404).json({ message: 'Floor plan not found' });
    }

    // Find all table labels on this floor to delete them from the Table collection
    const tableLabels = floorPlan.elements
      .filter(el => el.isTable && el.label)
      .map(el => el.label);

    if (tableLabels.length > 0) {
      await Table.deleteMany({ tableNumber: { $in: tableLabels } });
    }

    await FloorPlan.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Floor plan and associated tables deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
