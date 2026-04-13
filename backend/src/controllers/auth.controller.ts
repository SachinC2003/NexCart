import { randomUUID } from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../configs/data-sourse";
import { RefreshToken } from "../entities/RefreshToken.entity";
import { AuthRequest } from "../middleware/auth.middleware";
import { createUser, findUserByEmail, findUserById, saveUser } from "../repositories/user.Repository";
import { sendEmailToUser } from "../services/mail.Service";
import {
  clearRefreshTokenCookie,
  getCookieValue,
  getDeviceDetails,
  getRefreshCookieOptions,
  getRefreshTokenExpiryDate,
  createSessionStoreEntry,
  getSessionStoreEntry,
  revokeSessionStoreEntry,
  revokeUserSessionStoreEntries,
  updateSessionStoreEntry,
} from "../utils/session";
import { comparePasswords, generateAccessToken, generateRefreshToken, hashPassword, verifyRefreshToken } from "../utils/token";
import { asyncHandler } from "../utils/try_catch";
import { AppError } from "../utils/error";

const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

export const createSessionRecord = async (userId: number, refreshTokenValue: string, req: Request, sessionId?: string) => {
  const token = await hashPassword(refreshTokenValue);
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const device = getDeviceDetails(req);
  const activeSessionId = sessionId ?? randomUUID();
  const expiresAt = getRefreshTokenExpiryDate();

  createSessionStoreEntry(activeSessionId, userId, expiresAt, {
    deviceName: device.deviceName,
    browser: device.browser,
    os: device.os,
    userAgent: device.userAgent,
    ipAddress: device.ipAddress,
  });

  return refreshTokenRepo.create({
    sessionId: activeSessionId,
    token,
    user,
    deviceName: device.deviceName,
    browser: device.browser,
    os: device.os,
    userAgent: device.userAgent,
    ipAddress: device.ipAddress,
    expiresAt,
    revokedAt: null,
  });
};

export const setRefreshCookie = (res: Response, refreshTokenValue: string) => {
  res.cookie("refreshToken", refreshTokenValue, getRefreshCookieOptions());
};

const getStoredActiveSession = async (userId: number, sessionId: string) => {
  return refreshTokenRepo.findOne({
    where: {
      user: { id: userId },
      sessionId,
      revokedAt: null,
    },
    relations: ["user"],
  });
};

const getRefreshTokenFromCookie = (req: Request) => {
  const refreshTokenValue = getCookieValue(req, "refreshToken");

  if (!refreshTokenValue) {
    throw new AppError("Refresh token not found, Please login again.", 401);
  }

  return refreshTokenValue;
};

/*
========================
REGISTER
========================
*/
export const registerUser = asyncHandler(async(req: Request, res: Response) => {
  const { email, password, name, phoneNumber } = req.body;
  
  if (!email || !password || !phoneNumber || !name) {
    throw new AppError("All fields are required", 400);
  }

  let role = "user";

  if(email === "admin@gmail.com"){
    role = "admin";
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPass = await hashPassword(password);
  const newUser = await createUser(email, hashedPass, name, phoneNumber, role);
  const sessionId = randomUUID();
  const accessToken = generateAccessToken(newUser.id, sessionId);
  const refreshTokenValue = generateRefreshToken(newUser.id, sessionId);
  const sessionRecord = await createSessionRecord(newUser.id, refreshTokenValue, req, sessionId);

  await refreshTokenRepo.save(sessionRecord);
  setRefreshCookie(res, refreshTokenValue);

  res.status(201).json({
    message: "Register successful",
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
});

/*
========================
LOGIN
========================
*/
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated. Please contact the admin.", 403);
  }

  const isMatch = await comparePasswords(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const sessionId = randomUUID();
  const accessToken = generateAccessToken(user.id, sessionId);
  const refreshTokenValue = generateRefreshToken(user.id, sessionId);
  const sessionRecord = await createSessionRecord(user.id, refreshTokenValue, req, sessionId);

  await refreshTokenRepo.save(sessionRecord);
  await saveUser(user, user.password);
  setRefreshCookie(res, refreshTokenValue);

  res.status(200).json({
    message: "Login successful",
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
});

/*
========================
REFRESH TOKEN
========================
*/
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenValue = getRefreshTokenFromCookie(req);
  const decoded = verifyRefreshToken(refreshTokenValue);

  if(!decoded || typeof decoded === "string" || !decoded.sessionId){
    throw new AppError("Invalid refresh token, Please login again", 401);
  }

  const storedToken = await getStoredActiveSession(decoded.id, decoded.sessionId);

  if(!storedToken || storedToken.revokedAt){
    throw new AppError("Invalid refresh token, Please login again.", 401);
  }

  if (!storedToken.user?.isActive) {
    storedToken.revokedAt = new Date();
    await refreshTokenRepo.save(storedToken);
    revokeSessionStoreEntry(decoded.sessionId);
    clearRefreshTokenCookie(res);
    throw new AppError("Your account has been deactivated. Please contact the admin.", 403);
  }

  if (new Date(storedToken.expiresAt).getTime() <= Date.now()) {
    storedToken.revokedAt = new Date();
    await refreshTokenRepo.save(storedToken);
    revokeSessionStoreEntry(decoded.sessionId);
    throw new AppError("Refresh token expired", 401);
  }

  const isValid = await comparePasswords(refreshTokenValue, storedToken.token);

  if(!isValid){
    storedToken.revokedAt = new Date();
    await refreshTokenRepo.save(storedToken);
    revokeSessionStoreEntry(decoded.sessionId);
    throw new AppError("Invalid refresh token, Please login again", 401);
  }

  const accessToken = generateAccessToken(decoded.id, storedToken.sessionId);
  const newRefreshTokenValue = generateRefreshToken(decoded.id, storedToken.sessionId);
  const device = getDeviceDetails(req);

  storedToken.token = await hashPassword(newRefreshTokenValue);
  storedToken.lastUsedAt = new Date();
  storedToken.expiresAt = getRefreshTokenExpiryDate();
  storedToken.browser = device.browser;
  storedToken.os = device.os;
  storedToken.userAgent = device.userAgent;
  storedToken.ipAddress = device.ipAddress;
  storedToken.deviceName = device.deviceName || storedToken.deviceName;

  await refreshTokenRepo.save(storedToken);
  updateSessionStoreEntry(storedToken.sessionId, {
    lastUsedAt: storedToken.lastUsedAt,
    expiresAt: storedToken.expiresAt,
    browser: storedToken.browser,
    os: storedToken.os,
    userAgent: storedToken.userAgent,
    ipAddress: storedToken.ipAddress,
    deviceName: storedToken.deviceName,
  });

  setRefreshCookie(res, newRefreshTokenValue);

  res.status(200).json({
    message: "Token refreshed successfully",
    accessToken,
  });
});

/*
========================
FORGOT PASSWORD
========================
*/
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email are required", 400);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email", 401);
  }

  const secret_key = process.env.JWT_ACCESS_SECRET + user.password;
  //const newToken = generateAccessToken(user.id, secret_key);
 const newToken = jwt.sign({ id: user.id }, secret_key, { expiresIn: '15m' });
  await sendEmailToUser(email, newToken);

  res.status(200).json({
    message: "email send to user for create the new password",
  });
});

/*
========================
RESET PASSWORD
========================
*/
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const bodyToken = req.body?.token as string | undefined;
  const newToken = (req.params.newToken as string | undefined) ?? bodyToken;
  const newPassword = (req.body?.newPassword as string | undefined) ?? (req.body?.password as string | undefined);

  if (!newPassword || !newToken) {
    throw new AppError("New password and token are required", 400);
  }

  const decoded: any = jwt.decode(newToken as string);

  if (!decoded?.id) {
    throw new AppError("Invalid token", 400);
  }

  const user = await findUserById(decoded.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const secret_key = process.env.JWT_ACCESS_SECRET + user.password;
  jwt.verify(newToken as string, secret_key);

  const hashedPass = await hashPassword(newPassword);
  user.password = hashedPass;
  await saveUser(user, hashedPass);

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
  setRefreshCookie(res, refreshTokenValue);

  res.status(200).json({
    message: "Password reset successfuly",
    accessToken,
  });
});

export const logoutUser = asyncHandler(async(req: Request, res: Response)=>{
  const refreshTokenValue = getCookieValue(req, "refreshToken");

  if (refreshTokenValue) {
    const decoded = verifyRefreshToken(refreshTokenValue);

    if (decoded && typeof decoded !== "string" && decoded.sessionId) {
      const storedToken = await getStoredActiveSession(decoded.id, decoded.sessionId);

      if (storedToken) {
        await refreshTokenRepo.remove(storedToken);
      }

      revokeSessionStoreEntry(decoded.sessionId);
    }
  }

  clearRefreshTokenCookie(res);

  res.status(200).json({
    message: "Logout successful",
  });
});

export const getMySessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.userId);

  if (!userId || Number.isNaN(userId)) {
    throw new AppError("Invalid User ID provided", 400);
  }

  const currentRefreshToken = getCookieValue(req, "refreshToken");
  const currentDecoded = currentRefreshToken ? verifyRefreshToken(currentRefreshToken) : null;
  const currentSessionId =
    currentDecoded && typeof currentDecoded !== "string" ? currentDecoded.sessionId : null;

  const sessions = await refreshTokenRepo.find({
    where: {
      user: { id: userId },
      revokedAt: null,
    },
    order: {
      lastUsedAt: "DESC",
      createdAt: "DESC",
    },
  });

  res.status(200).json({
    message: "Sessions fetched successfully",
    sessions: sessions.map((session) => ({
      sessionId: session.sessionId,
      deviceName: session.deviceName,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      current: currentSessionId === session.sessionId,
    })),
  });
});

export const revokeSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.userId);
  const sessionId = String(req.params.sessionId ?? "");

  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  const session = await refreshTokenRepo.findOne({
    where: {
      user: { id: userId },
      sessionId,
      revokedAt: null,
    },
  });

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  await refreshTokenRepo.remove(session);
  revokeSessionStoreEntry(sessionId);

  const currentRefreshToken = getCookieValue(req, "refreshToken");
  const currentDecoded = currentRefreshToken ? verifyRefreshToken(currentRefreshToken) : null;

  if (currentDecoded && typeof currentDecoded !== "string" && currentDecoded.sessionId === sessionId) {
    clearRefreshTokenCookie(res);
  }

  res.status(200).json({
    message: "Session revoked successfully",
  });
});

export const revokeOtherSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.userId);
  const currentRefreshToken = getRefreshTokenFromCookie(req);
  const decoded = verifyRefreshToken(currentRefreshToken);

  if (!decoded || typeof decoded === "string" || !decoded.sessionId) {
    throw new AppError("Invalid refresh token, Please login again", 401);
  }

  const sessions = await refreshTokenRepo.find({
    where: {
      user: { id: userId },
      revokedAt: null,
    },
  });

  const sessionsToRevoke = sessions.filter((session) => session.sessionId !== decoded.sessionId);

  await Promise.all(
    sessionsToRevoke.map(async (session) => {
      await refreshTokenRepo.remove(session);
      revokeSessionStoreEntry(session.sessionId);
    })
  );

  res.status(200).json({
    message: "Other sessions revoked successfully",
  });
});
