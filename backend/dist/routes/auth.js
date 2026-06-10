"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../models/Admin"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-change-me';
// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin_1.default.findOne({ username });
        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, admin.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, username: admin.username });
    }
    catch (err) {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const { newUsername, newPassword, currentPassword } = req.body;
        const admin = await Admin_1.default.findById(decoded.id);
        if (!admin) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, admin.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Incorrect current password' });
            return;
        }
        if (newUsername) {
            admin.username = newUsername;
        }
        if (newPassword) {
            const salt = await bcryptjs_1.default.genSalt(10);
            admin.passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
        }
        await admin.save();
        // Generate new token if username changed
        const newToken = jsonwebtoken_1.default.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Settings updated', token: newToken, username: admin.username });
    }
    catch (err) {
        res.status(401).json({ message: 'Invalid token or update failed' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map