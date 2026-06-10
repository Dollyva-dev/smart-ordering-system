"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Table_1 = __importDefault(require("../models/Table"));
const router = express_1.default.Router();
// Get all tables
router.get('/', async (req, res) => {
    try {
        const tables = await Table_1.default.find().sort({ tableNumber: 1 });
        res.json(tables);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Add a new table
router.post('/', async (req, res) => {
    try {
        // Check if table already exists
        const existingTable = await Table_1.default.findOne({ tableNumber: req.body.tableNumber });
        if (existingTable) {
            res.status(400).json({ message: 'Table number already exists' });
            return;
        }
        const table = new Table_1.default({
            tableNumber: req.body.tableNumber,
            // For simplicity, we store the full URL path as the QR code data.
            qrCodeUrl: `http://localhost:3000/table/${req.body.tableNumber}`,
        });
        const newTable = await table.save();
        res.status(201).json(newTable);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Delete a table
router.delete('/:id', async (req, res) => {
    try {
        const table = await Table_1.default.findByIdAndDelete(req.params.id);
        if (!table) {
            res.status(404).json({ message: 'Table not found' });
            return;
        }
        res.json({ message: 'Deleted table' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=tables.js.map