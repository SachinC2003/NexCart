import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/try_catch";
import { AppDataSource } from "../configs/data-sourse";
import { User } from "../entities/User.entity";
import { findUserById, saveUser } from "../repositories/user.Repository";
import { AppError } from "../utils/error";
import { comparePasswords, generateAccessToken, generateRefreshToken, hashPassword } from "../utils/token";
import { randomUUID } from "node:crypto";
import { createSessionRecord, setRefreshCookie } from "./auth.controller";
import { revokeUserSessionStoreEntries } from "../utils/session";
import { RefreshToken } from "../entities/RefreshToken.entity";

const userRepo = AppDataSource.getRepository(User);
const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);
    if (!userId || isNaN(userId)) {
        throw new AppError("Invalid User ID provided", 400);
    }

    const user = await userRepo.findOne({
        where: { id: userId },
        // Security: Explicitly select ONLY public fields
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            location: true,
            phoneNumber: true,
            createdAt: true,
        }
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        message: "Profile fetched successfully",
        user: user
    });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response)=>{
    const userId = Number(req.userId);

    if (!userId || isNaN(userId)) {
        throw new AppError("Invalid User ID provided", 400);
    }

    const user = await findUserById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const { name, phoneNumber, location } = req.body;
    if(name)  user.name = name;
    if(phoneNumber) user.phoneNumber = phoneNumber;
    if(location) user.location = location;

    await userRepo.update(userId, user);

    res.status(200).json({
        message: "Profile updated successfully",
        user: user
    });
})

/*
===============================================
Change Password 
===============================================
*/
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response)=>{
      const userId = Number(req.userId);
      const { currentPassword, newPassword} = req.body;

      if(!userId){
         throw new AppError("User Id is required", 400);
      }

      const user = await findUserById(userId)

      if(!user){
         throw new AppError("User not found", 400);
      }

      const isMath = await comparePasswords(currentPassword, user.password);

      if(!isMath){
            throw new AppError("Current password is incorrect", 400);
      }

      user.password = await hashPassword(newPassword);

      const activeSessions = await refreshTokenRepo.find({
        where: {
          user: { id: user.id },
          revokedAt: null,
        },
      });

      await Promise.all(
        activeSessions.map((session) =>
          refreshTokenRepo.update({ id: session.id }, { revokedAt: new Date() })
        )
      );

      revokeUserSessionStoreEntries(user.id);

      const sessionId = randomUUID();
      const accessToken = generateAccessToken(user.id, sessionId);
      const refreshTokenValue = generateRefreshToken(user.id, sessionId);
      const sessionRecord = await createSessionRecord(user.id, refreshTokenValue, req, sessionId);

      await refreshTokenRepo.save(sessionRecord);
      await saveUser(user, user.password);
      setRefreshCookie(res, refreshTokenValue);

      res.status(200).json({
        message: "Password changed successfully",
        accessToken,
        session: {
          sessionId: sessionRecord.sessionId,
          deviceName: sessionRecord.deviceName,
          browser: sessionRecord.browser,
          os: sessionRecord.os,
          lastUsedAt: sessionRecord.lastUsedAt,
          createdAt: sessionRecord.createdAt,
          expiresAt: sessionRecord.expiresAt,
        },
      });
})