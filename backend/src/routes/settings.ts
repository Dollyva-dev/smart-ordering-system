import express from 'express';
import Setting from '../models/Setting';
import { verifyToken } from './auth';

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ taxPercentage: 0, serviceChargePercentage: 0 });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// Update settings
router.put('/', verifyToken, async (req, res) => {
  try {
    const { taxPercentage, serviceChargePercentage } = req.body;
    let setting = await Setting.findOne();
    
    if (!setting) {
      setting = await Setting.create({ taxPercentage, serviceChargePercentage });
    } else {
      if (taxPercentage !== undefined) setting.taxPercentage = taxPercentage;
      if (serviceChargePercentage !== undefined) setting.serviceChargePercentage = serviceChargePercentage;
      await setting.save();
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

export default router;
