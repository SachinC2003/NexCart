import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const generateAccessToken = (userId: number, sessionId?: string, secret?: string) => {
  const payload: { id: number; sessionId?: string } = { id: userId };

  if (sessionId) {
    payload.sessionId = sessionId;
  }

  return jwt.sign(payload, secret || process.env.JWT_SECRET as string, { expiresIn: '10h' });
}

export const generateRefreshToken = (userId: number, sessionId: string) => {
  return jwt.sign({ id: userId, sessionId }, process.env.JWT_SECRET_FOR_REFRESH_TOKEN as string, { expiresIn: '7d' });
}

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; sessionId?: string }; 
  } catch (err) {
    return null;
  } 
}

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_FOR_REFRESH_TOKEN as string) as { id: number; sessionId: string };   
  } catch (err) {
    return null;
  }
}

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
}

export const comparePasswords = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
}
