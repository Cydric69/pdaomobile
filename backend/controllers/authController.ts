import { Request, Response } from "express";
import { generateToken } from "../middleware/auth";
import {
  transformForMongoose,
  UserLoginSchema,
  UserModel,
  validateUserRegister,
} from "../models/User";

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, any>;
  keyValue?: Record<string, any>;
}

interface MongooseValidationError extends Error {
  errors?: Record<string, any>;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 REGISTER REQUEST RECEIVED");
    console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

    // Validate request body with Zod
    const userData = validateUserRegister(req.body);
    console.log("✅ Zod validation passed");

    // Check if user exists
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      console.log("⚠️ User already exists:", existingUser.email);
      res.status(400).json({
        success: false,
        message:
          "This email is already registered. Please use a different email or try logging in.",
        field: "email",
      });
      return;
    }

    // Check if contact number already exists
    const existingContact = await UserModel.findOne({
      contact_number: userData.contact_number,
    });
    if (existingContact) {
      console.log(
        "⚠️ Contact number already exists:",
        existingContact.contact_number,
      );
      res.status(400).json({
        success: false,
        message:
          "This contact number is already registered. Please use a different number.",
        field: "contact_number",
      });
      return;
    }

    // Transform data for Mongoose (convert dates, format phone)
    const mongooseData = transformForMongoose(userData);

    // Ensure form_id is not set during registration
    mongooseData.form_id = null;
    mongooseData.is_verified = false;
    mongooseData.is_email_verified = false;
    // is_phone_verified removed - not needed
    mongooseData.status = "Pending";
    mongooseData.role = "User";

    console.log("📦 Data transformed for Mongoose");

    // Create user
    console.log("🔄 Creating user in database...");
    const user = await UserModel.create(mongooseData);
    console.log("✅ User created successfully:", {
      id: user._id,
      user_id: user.user_id,
      email: user.email,
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Prepare user response (exclude sensitive data)
    const userResponse = {
      _id: user._id,
      user_id: user.user_id,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      suffix: user.suffix,
      sex: user.sex,
      age: user.age,
      date_of_birth: user.date_of_birth,
      address: user.address,
      contact_number: user.contact_number,
      email: user.email,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
      is_email_verified: user.is_email_verified,
      // is_phone_verified removed - not needed
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    // Send response
    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email for verification instructions.",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error: unknown) {
    console.error("❌ Registration error:", error);

    // Handle MongoDB duplicate key error (11000)
    if (error && typeof error === "object" && "code" in error) {
      const mongoError = error as MongoError;
      if (mongoError.code === 11000) {
        // Determine which field caused the duplicate key error
        const keyPattern = mongoError.keyPattern || {};
        const keyValue = mongoError.keyValue || {};

        console.log("⚠️ Duplicate key error:", { keyPattern, keyValue });

        if (keyPattern.email) {
          res.status(400).json({
            success: false,
            message:
              "This email is already registered. Please use a different email or try logging in.",
            field: "email",
          });
          return;
        }

        if (keyPattern.contact_number) {
          res.status(400).json({
            success: false,
            message:
              "This contact number is already registered. Please use a different number.",
            field: "contact_number",
          });
          return;
        }

        if (keyPattern.user_id) {
          // This should rarely happen, but handle it just in case
          res.status(400).json({
            success: false,
            message: "Registration failed. Please try again.",
            field: "user_id",
          });
          return;
        }

        // Generic duplicate error
        res.status(400).json({
          success: false,
          message:
            "Registration failed. This information is already registered.",
        });
        return;
      }
    }

    // Handle Zod validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    // Handle Mongoose validation errors
    if (error && typeof error === "object" && "name" in error) {
      const mongooseError = error as MongooseValidationError;
      if (mongooseError.name === "ValidationError" && mongooseError.errors) {
        const errors = Object.entries(mongooseError.errors).map(
          ([field, err]: [string, any]) => ({
            field,
            message: err.message,
          }),
        );
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 LOGIN REQUEST RECEIVED");
    console.log("📦 Request body:", req.body);

    // Validate with Zod
    const loginData = UserLoginSchema.parse(req.body);
    console.log("✅ Zod validation passed");

    // Find user
    const user = await UserModel.findOne({ email: loginData.email });
    if (!user) {
      console.log("⚠️ User not found:", loginData.email);
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        field: "email",
      });
      return;
    }

    // Check account status
    if (user.status === "Suspended") {
      console.log("⚠️ Account suspended:", user.email);
      res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
      return;
    }

    if (user.status === "Inactive") {
      console.log("⚠️ Account inactive:", user.email);
      res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
      return;
    }

    // Verify password
    const isMatch = await user.comparePassword(loginData.password);
    if (!isMatch) {
      console.log("⚠️ Invalid password for user:", user.email);
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        field: "password",
      });
      return;
    }

    // Update user status to Active on successful login
    if (user.status === "Pending") {
      user.status = "Active";
    }
    user.updated_at = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Prepare user response
    const userResponse = {
      _id: user._id,
      user_id: user.user_id,
      form_id: user.form_id,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      suffix: user.suffix,
      sex: user.sex,
      age: user.age,
      date_of_birth: user.date_of_birth,
      address: user.address,
      contact_number: user.contact_number,
      email: user.email,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
      is_email_verified: user.is_email_verified,
      // is_phone_verified removed - not needed
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    console.log("✅ Login successful for:", user.email);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error: unknown) {
    console.error("❌ Login error:", error);

    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};
