import express from 'express';
import Order from '../models/Order';
import { Server } from 'socket.io';

const router = express.Router();

// Get all orders (for admin dashboard, or filtered by table number)
router.get('/', async (req, res) => {
  try {
    const { tableNumber } = req.query;
    const filter = tableNumber ? { tableNumber: String(tableNumber) } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new order (from customer app)
router.post('/', async (req, res) => {
  const order = new Order({
    tableNumber: req.body.tableNumber,
    items: req.body.items,
    totalAmount: req.body.totalAmount,
  });

  try {
    const newOrder = await order.save();
    
    // Emit new order event to socket connected clients (e.g. admin dashboard)
    const io: Server = req.app.get('io');
    if (io) {
      io.emit('new-order', newOrder);
    }
    
    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Update order status (from admin dashboard)
router.patch('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) {
       res.status(404).json({ message: 'Order not found' });
       return;
    }
    
    // Emit order update event
    const io: Server = req.app.get('io');
    if (io) {
      io.emit('order-updated', order);
    }

    res.json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
