"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Order_1 = __importDefault(require("../models/Order"));
const router = express_1.default.Router();
// Get all orders (for admin dashboard)
router.get('/', async (req, res) => {
    try {
        const orders = await Order_1.default.find().sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Create a new order (from customer app)
router.post('/', async (req, res) => {
    const order = new Order_1.default({
        tableNumber: req.body.tableNumber,
        items: req.body.items,
        totalAmount: req.body.totalAmount,
    });
    try {
        const newOrder = await order.save();
        // Emit new order event to socket connected clients (e.g. admin dashboard)
        const io = req.app.get('io');
        if (io) {
            io.emit('new-order', newOrder);
        }
        res.status(201).json(newOrder);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Update order status (from admin dashboard)
router.patch('/:id/status', async (req, res) => {
    try {
        const order = await Order_1.default.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        // Emit order update event
        const io = req.app.get('io');
        if (io) {
            io.emit('order-updated', order);
        }
        res.json(order);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map