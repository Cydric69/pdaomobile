import { Request, Response } from "express";
import {
  sanitizeUserForPublic,
  UserLogin,
  UserRegister,
  UserUpdate,
  validateUserLogin,
  validateUserRegister,
  validateUserUpdate,
} from "../models/User";

export const registerUser = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    const userData: UserRegister = validateUserRegister(req.body);

    // Here you would:
    // 1. Hash the password
    // 2. Save to database
    // 3. Generate JWT token

    const sanitizedUser = sanitizeUserForPublic(userData as any);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: sanitizedUser,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const loginData: UserLogin = validateUserLogin(req.body);

    // Validate credentials against database
    // Generate JWT token

    res.json({
      success: true,
      message: "Login successful",
      token: "jwt_token_here",
      user: {
        email: loginData.email,
        // ... other user data
      },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(401).json({
      success: false,
      message: "Invalid credentials",
      error: error.message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updateData: UserUpdate = validateUserUpdate(req.body);
    const userId = req.params.id;

    // Update user in database
    // Handle password update if provided

    res.json({
      success: true,
      message: "User updated successfully",
      data: updateData,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};
