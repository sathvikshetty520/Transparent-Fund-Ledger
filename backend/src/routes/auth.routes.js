const express = require("express");
const { z } = require("zod");

const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(120, "Name must not exceed 120 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),

  role: z.enum(["CONTRIBUTOR", "ORGANIZER"])
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(1, "Password is required")
});

router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(authController.me)
);

module.exports = router;