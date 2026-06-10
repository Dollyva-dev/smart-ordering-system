import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-change-me';

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: admin.username });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update settings route (change username/password)
router.put('/settings', async (req, res) => {
  // In a real app we'd use middleware to extract token and verify it.
  // For simplicity, we'll verify the token from the Authorization header manually here.
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { newUsername, newPassword, currentPassword } = req.body;

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Incorrect current password' });
      return;
    }

    if (newUsername) {
      admin.username = newUsername;
    }
    
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      admin.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await admin.save();
    
    // Generate new token if username changed
    const newToken = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Settings updated', token: newToken, username: admin.username });
  } catch (err: any) {
    res.status(401).json({ message: 'Invalid token or update failed' });
  }
});

export default router;
