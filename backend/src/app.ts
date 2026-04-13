import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import userRouter from './routes/user.route';
import authRouter from './routes/auth.route';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';
import adminRouter from './routes/admin.route';
import cartRouter from './routes/cart.route';
import orderRouter from './routes/order.route';
import reviewRouter from './routes/review.route';
import taxonomyRouter from './routes/taxonomy.route';
import { authMiddleware } from './middleware/auth.middleware';
import { adminMiddleware } from './middleware/admin.middleware';
import { getImage } from './controllers/product.controller';
import geastRouter from './routes/geast.routes';

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigin = ["http://localhost:4200"];

const corsOption = {
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-type', 'Authorization'],
  credentials: true
}

const ratelimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
})

app.use(ratelimit);
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/uploads/images/:image', getImage);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/geast', geastRouter);
app.use('/api/user', authMiddleware, userRouter);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRouter);
app.use('/api/taxonomy', taxonomyRouter);
app.use('/api/cart', authMiddleware, cartRouter);
app.use('/api/order', authMiddleware, orderRouter);
app.use('/api/review', authMiddleware, reviewRouter);

app.get('/uploads/images/:image', getImage);

app.use(notFoundHandler);

// Global Error Handler (Must be last)
app.use(globalErrorHandler);

export default app;
