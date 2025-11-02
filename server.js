import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import http from 'http';
import dotenv from 'dotenv';

import connectDB from './src/config/database.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

// Import routes
import productRoutes from './src/routes/productsRoute.js';
import userRoutes from './src/routes/userRoute.js';
import orderRoutes from './src/routes/orderRoute.js';
import authRoutes from './src/routes/authRoute.js';
import cartRoutes from './src/routes/cartRoute.js'
import reviewRoutes from "./src/routes/reviewRoutes.js"
import wishlistRoute from './src/routes/whishlistRoute.js'
import adminRoutes from './src/routes/adminRoutes.js'

// import paymentRoutes from './routes/payments.js';


dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());           // ✅ required to parse JSON
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/review', reviewRoutes)
app.use('/api/wishlist', wishlistRoute)
app.use('/api/admin', adminRoutes)


// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Optics E-commerce Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// // WebSocket
// const wsServer = new WebSocketServer(server);
// global.wsServer = wsServer;

// Error handlers
app.use('*', notFound);
app.use(errorHandler);




server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
});
