import express from "express";
import { login, register } from "../controllers/authController";
import {
  loginValidator,
  registerValidator,
  validate,
} from "../validators/authValidators";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account (NOT PWD verification)
 * @access  Public
 */
router.post("/register", registerValidator, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post("/login", loginValidator, validate, login);

export default router;
