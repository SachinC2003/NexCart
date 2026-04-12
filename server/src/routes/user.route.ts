import express, { Request, Response } from 'express';
import { changePassword, getProfile, updateProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const userRouter = express.Router();

userRouter.get('/', authMiddleware ,getProfile);
userRouter.get('/profile', authMiddleware, getProfile);
userRouter.put('/', authMiddleware, updateProfile)
userRouter.put('/profile', authMiddleware, updateProfile)

userRouter.post('/change-password', authMiddleware, changePassword)

export default userRouter;
