"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const menu_1 = __importDefault(require("./routes/menu"));
const orders_1 = __importDefault(require("./routes/orders"));
const tables_1 = __importDefault(require("./routes/tables"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const auth_1 = __importDefault(require("./routes/auth"));
const Admin_1 = __importDefault(require("./models/Admin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Setup Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // For development, allow all origins
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});
const path_1 = __importDefault(require("path"));
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Make io accessible to routes
app.set('io', io);
// Routes
app.use('/api/menu', menu_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/tables', tables_1.default);
app.use('/api/auth', auth_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.send('Smart Ordering System API is running');
});
// Socket.IO Connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
// Seed default admin
const seedAdmin = async () => {
    try {
        const adminCount = await Admin_1.default.countDocuments();
        if (adminCount === 0) {
            const salt = await bcryptjs_1.default.genSalt(10);
            const passwordHash = await bcryptjs_1.default.hash('admin123', salt);
            await Admin_1.default.create({ username: 'admin', passwordHash });
            console.log('Default admin created (admin / admin123)');
        }
    }
    catch (err) {
        console.error('Failed to seed admin:', err);
    }
};
// MongoDB Connection and Server Start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-ordering';
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    seedAdmin();
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});
//# sourceMappingURL=index.js.map