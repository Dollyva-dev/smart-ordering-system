"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
const router = express_1.default.Router();
// Configure storage for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(__dirname, '../../public/uploads');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
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
        const items = await MenuItem_1.default.find();
        res.json(items);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Create a menu item
router.post('/', async (req, res) => {
    const item = new MenuItem_1.default({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        imageUrl: req.body.imageUrl,
        customizationGroups: req.body.customizationGroups || []
    });
    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Update a menu item
router.patch('/:id', async (req, res) => {
    try {
        const updatedItem = await MenuItem_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json(updatedItem);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Delete a menu item
router.delete('/:id', async (req, res) => {
    try {
        const item = await MenuItem_1.default.findByIdAndDelete(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json({ message: 'Deleted menu item' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=menu.js.map