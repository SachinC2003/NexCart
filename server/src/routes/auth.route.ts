import { Router } from "express";
import {
  forgotPassword,
  getMySessions,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  revokeOtherSessions,
  revokeSession,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, registerSchema } from "../validation/auth.validation";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), registerUser);
authRouter.post("/login", validate(loginSchema), loginUser);
authRouter.post("/refresh", refreshAccessToken);
authRouter.post("/logout", logoutUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:newToken", resetPassword);
authRouter.get("/sessions", authMiddleware, getMySessions);
authRouter.delete("/sessions/others", authMiddleware, revokeOtherSessions);
authRouter.delete("/sessions/:sessionId", authMiddleware, revokeSession);

export default authRouter;
