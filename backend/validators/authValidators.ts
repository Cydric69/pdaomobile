import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

// Register validation - UPDATED for 11-digit phone only (09XXXXXXXXX)
// This is ONLY for user account registration, NOT PWD verification
export const registerValidator = [
  body("first_name")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be 1-50 characters")
    .trim()
    .escape(),

  body("middle_name")
    .optional()
    .default("")
    .isLength({ max: 50 })
    .withMessage("Middle name cannot exceed 50 characters")
    .trim()
    .escape(),

  body("last_name")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be 1-50 characters")
    .trim()
    .escape(),

  body("suffix")
    .optional()
    .default("")
    .isIn(["Jr.", "Sr.", "II", "III", "IV", "V", ""])
    .withMessage("Invalid suffix format")
    .trim()
    .escape(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail()
    .toLowerCase()
    .trim(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 100 })
    .withMessage("Password cannot exceed 100 characters"),

  body("date_of_birth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Must be a valid date (YYYY-MM-DD)")
    .custom((value) => {
      const dob = new Date(value);
      if (dob > new Date()) {
        throw new Error("Date of birth cannot be in the future");
      }
      return true;
    }),

  body("sex")
    .notEmpty()
    .withMessage("Sex is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid sex value"),

  // Phone validation - 09XXXXXXXXX format only
  body("contact_number")
    .notEmpty()
    .withMessage("Contact number is required")
    .matches(/^09\d{9}$/)
    .withMessage(
      "Phone number must be exactly 11 digits starting with 09 (09XXXXXXXXX)",
    )
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number must be exactly 11 characters")
    .trim(),

  // Address validation
  body("address.street")
    .notEmpty()
    .withMessage("Street is required")
    .isLength({ max: 200 })
    .withMessage("Street cannot exceed 200 characters")
    .trim()
    .escape(),

  body("address.barangay")
    .notEmpty()
    .withMessage("Barangay is required")
    .isLength({ max: 100 })
    .withMessage("Barangay cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address.city_municipality")
    .notEmpty()
    .withMessage("City/Municipality is required")
    .isLength({ max: 100 })
    .withMessage("City/Municipality cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address.province")
    .notEmpty()
    .withMessage("Province is required")
    .isLength({ max: 100 })
    .withMessage("Province cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address.region")
    .notEmpty()
    .withMessage("Region is required")
    .isLength({ max: 100 })
    .withMessage("Region cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address.zip_code")
    .optional()
    .default("")
    .matches(/^\d{4}$/)
    .withMessage("ZIP code must be 4 digits")
    .trim(),

  body("address.country").optional().default("Philippines").trim(),

  body("address.type")
    .optional()
    .default("Permanent")
    .isIn(["Permanent", "Temporary", "Present"])
    .withMessage("Address type must be Permanent, Temporary, or Present"),

  // Explicitly disallow form_id in registration
  body("form_id")
    .optional()
    .custom(() => {
      throw new Error("form_id cannot be set during registration");
    }),
];

// Login validation
export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail()
    .toLowerCase()
    .trim(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Update profile validation
export const updateProfileValidator = [
  body("first_name")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be 1-50 characters")
    .trim()
    .escape(),

  body("middle_name")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Middle name cannot exceed 50 characters")
    .trim()
    .escape(),

  body("last_name")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be 1-50 characters")
    .trim()
    .escape(),

  body("suffix")
    .optional()
    .isIn(["Jr.", "Sr.", "II", "III", "IV", "V", ""])
    .withMessage("Invalid suffix format")
    .trim()
    .escape(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail()
    .toLowerCase()
    .trim(),

  body("contact_number")
    .optional()
    .matches(/^09\d{9}$/)
    .withMessage(
      "Phone number must be exactly 11 digits starting with 09 (09XXXXXXXXX)",
    )
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number must be exactly 11 characters")
    .trim(),

  body("date_of_birth")
    .optional()
    .isISO8601()
    .withMessage("Must be a valid date (YYYY-MM-DD)")
    .custom((value) => {
      const dob = new Date(value);
      if (dob > new Date()) {
        throw new Error("Date of birth cannot be in the future");
      }
      return true;
    }),

  body("sex")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid sex value"),

  // Address fields - all optional for updates
  body("address.street")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Street cannot exceed 200 characters")
    .trim()
    .escape(),

  body("address.barangay")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Barangay cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address.city_municipality")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City/Municipality cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address.province")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Province cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address.region")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Region cannot exceed 100 characters")
    .trim()
    .escape(),

  body("address.zip_code")
    .optional()
    .matches(/^\d{4}$/)
    .withMessage("ZIP code must be 4 digits")
    .trim(),

  body("address.type")
    .optional()
    .isIn(["Permanent", "Temporary", "Present"])
    .withMessage("Address type must be Permanent, Temporary, or Present"),

  body("avatar_url")
    .optional()
    .isURL()
    .withMessage("Invalid URL format")
    .trim(),
];

// Change password validation
export const changePasswordValidator = [
  body("current_password")
    .notEmpty()
    .withMessage("Current password is required"),

  body("new_password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .isLength({ max: 100 })
    .withMessage("New password cannot exceed 100 characters")
    .custom((value, { req }) => {
      if (value === req.body.current_password) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),

  body("confirm_password")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// PWD Verification Form Validator - For when users submit PWD verification
export const pwdVerificationValidator = [
  body("disability_type")
    .notEmpty()
    .withMessage("Disability type is required")
    .isLength({ max: 100 })
    .withMessage("Disability type cannot exceed 100 characters")
    .trim()
    .escape(),

  body("disability_certificate_url")
    .optional()
    .isURL()
    .withMessage("Invalid certificate URL format"),

  body("physician_name")
    .notEmpty()
    .withMessage("Physician name is required")
    .isLength({ max: 100 })
    .withMessage("Physician name cannot exceed 100 characters")
    .trim()
    .escape(),

  body("physician_license")
    .notEmpty()
    .withMessage("Physician license is required")
    .isLength({ max: 50 })
    .withMessage("Physician license cannot exceed 50 characters")
    .trim()
    .escape(),

  body("hospital_clinic")
    .notEmpty()
    .withMessage("Hospital/Clinic is required")
    .isLength({ max: 200 })
    .withMessage("Hospital/Clinic cannot exceed 200 characters")
    .trim()
    .escape(),

  body("diagnosis_date")
    .notEmpty()
    .withMessage("Diagnosis date is required")
    .isISO8601()
    .withMessage("Must be a valid date (YYYY-MM-DD)")
    .custom((value) => {
      const diagnosisDate = new Date(value);
      if (diagnosisDate > new Date()) {
        throw new Error("Diagnosis date cannot be in the future");
      }
      return true;
    }),
];

// Validation middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Check if the error is about form_id
    const hasFormIdError = errors
      .array()
      .some((err) => err.type === "field" && err.path === "form_id");

    if (hasFormIdError) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: [
          {
            field: "form_id",
            message:
              "form_id is automatically generated and cannot be provided",
          },
        ],
      });
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? err.path : err.type,
        message: err.msg,
      })),
    });
  }

  next();
};
