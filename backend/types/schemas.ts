import { z } from "zod";

// Address Schema
export const AddressSchema = z.object({
  street: z.string().min(1, "Street is required").max(200),
  barangay: z.string().min(1, "Barangay is required").max(100),
  city_municipality: z
    .string()
    .min(1, "City/Municipality is required")
    .max(100),
  province: z.string().min(1, "Province is required").max(100),
  region: z.string().min(1, "Region is required").max(100),
  zip_code: z
    .string()
    .regex(/^\d{4}$/, "ZIP code must be 4 digits")
    .optional(),
  country: z.string().default("Philippines"),
  type: z.enum(["Permanent", "Temporary", "Present"]).default("Permanent"),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
});

// Disability Schema
export const DisabilitySchema = z.object({
  disability_type: z.string().min(1, "Disability type is required"),
  disability_level: z.enum(["Mild", "Moderate", "Severe", "Profound"]),
  diagnosis_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
    .optional(),
  medical_certificate_url: z.string().url().optional(),
  description: z.string().max(500).optional(),
});

// Accessibility Schema
export const AccessibilitySchema = z.object({
  high_contrast: z.boolean().default(false),
  large_text: z.boolean().default(false),
  screen_reader: z.boolean().default(false),
  reduced_motion: z.boolean().default(false),
  preferred_communication: z
    .enum(["Visual", "Auditory", "Text", "Sign Language"])
    .default("Text"),
});

// Main User Schema
export const UserSchema = z
  .object({
    user_id: z.string().optional(),
    form_id: z.string().optional().nullable(),

    first_name: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name cannot exceed 50 characters"),

    middle_name: z
      .string()
      .max(50, "Middle name cannot exceed 50 characters")
      .optional()
      .default(""),

    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name cannot exceed 50 characters"),

    suffix: z
      .enum(["Jr.", "Sr.", "II", "III", "IV", "V", ""])
      .optional()
      .default(""),

    sex: z.enum(["Male", "Female", "Other"]).default("Other"),

    age: z
      .number()
      .int("Age must be an integer")
      .min(0, "Age cannot be negative")
      .max(150, "Age cannot exceed 150")
      .optional()
      .default(0),

    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),

    address: AddressSchema,

    contact_number: z
      .string()
      .regex(
        /^\+63\d{10}$|^09\d{9}$/,
        "Invalid Philippine phone number format",
      ),

    avatar_url: z.string().url().optional().nullable().default(null),

    email: z
      .string()
      .email("Invalid email format")
      .max(100, "Email cannot exceed 100 characters"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password cannot exceed 100 characters"),

    role: z.enum(["User", "Admin", "Supervisor", "Staff"]).default("User"),

    status: z
      .enum(["Active", "Inactive", "Suspended", "Pending"])
      .default("Pending"),

    is_verified: z.boolean().default(false),
    is_email_verified: z.boolean().default(false),
    is_phone_verified: z.boolean().default(false),

    disability_info: z.array(DisabilitySchema).optional().default([]),

    accessibility_preferences: AccessibilitySchema.optional().default({
      high_contrast: false,
      large_text: false,
      screen_reader: false,
      reduced_motion: false,
      preferred_communication: "Text",
    }),

    created_by: z.string().optional().nullable().default(null),
    updated_by: z.string().optional().nullable().default(null),
  })
  .refine(
    (data) => {
      // Custom validation: Age should match date_of_birth
      const dob = new Date(data.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return data.age === 0 || data.age === age;
    },
    {
      message: "Age does not match date of birth",
      path: ["age"],
    },
  );

// Partial schemas
export const UserRegisterSchema = UserSchema.pick({
  first_name: true,
  middle_name: true,
  last_name: true,
  suffix: true,
  sex: true,
  date_of_birth: true,
  address: true,
  contact_number: true,
  email: true,
  password: true,
  disability_info: true,
  accessibility_preferences: true,
});

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const UserUpdateSchema = UserSchema.partial()
  .omit({ password: true, user_id: true, form_id: true })
  .extend({
    current_password: z.string().optional(),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(100, "New password cannot exceed 100 characters")
      .optional(),
  });

// Types
export type User = z.infer<typeof UserSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Disability = z.infer<typeof DisabilitySchema>;
export type Accessibility = z.infer<typeof AccessibilitySchema>;
