import { Router } from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import { validateRequest } from "../middleware/validate-request";
import { authRateLimiter } from "../middleware/rate-limit";
import type {
  LoginRequestBody,
  LoginResponseBody,
  RegisterRequestBody,
  RegisterResponseBody
} from "../types/auth";

const router = Router();
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}

const emailValidator = body("email")
  .isEmail()
  .withMessage("Email must be valid")
  .normalizeEmail();

const passwordValidator = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters");

router.post(
  "/register",
  authRateLimiter,
  [emailValidator, passwordValidator],
  validateRequest,
  async (req, res, next) => {
    try {
      const { email, password } = req.body as RegisterRequestBody;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        next({ status: 409, message: "Email already in use" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, passwordHash }
      });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: "7d" }
      );

      const payload: RegisterResponseBody = { token };
      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  authRateLimiter,
  [emailValidator, passwordValidator],
  validateRequest,
  async (req, res, next) => {
    try {
      const { email, password } = req.body as LoginRequestBody;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        next({ status: 401, message: "Invalid credentials" });
        return;
      }

      const matches = await bcrypt.compare(password, user.passwordHash);
      if (!matches) {
        next({ status: 401, message: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: "7d" }
      );

      const payload: LoginResponseBody = { token };
      res.status(200).json(payload);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
