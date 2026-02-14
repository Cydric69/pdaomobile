import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";

// ============ ZOD SCHEMAS ============

// Address Zod Schema
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
    .optional()
    .default(""),
  country: z.string().default("Philippines"),
  type: z.enum(["Permanent", "Temporary", "Present"]).default("Permanent"),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
});

// Main User Zod Schema
export const UserSchema = z.object({
  // MongoDB _id will be auto-generated
  _id: z.any().optional(),

  // Unique identifiers
  user_id: z
    .string()
    .regex(/^PDAO-\d{8}-[A-Z0-9]{5}$/, "Invalid user ID format")
    .optional()
    .default(() => {
      const date = new Date();
      const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      return `PDAO-${dateStr}-${random}`;
    }),

  // form_id - OPTIONAL and NOT UNIQUE
  // This allows multiple users to have null form_id
  // Only set when PWD verification form is submitted
  form_id: z
    .string()
    .regex(/^FORM-\d{8}-[A-Z0-9]{5}$/, "Invalid form ID format")
    .optional()
    .nullable()
    .default(null),

  // Personal information
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
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((date) => {
      const dob = new Date(date);
      return dob <= new Date();
    }, "Date of birth cannot be in the future"),

  // Address
  address: AddressSchema,

  // Contact information
  contact_number: z
    .string()
    .min(11, "Phone number must be 11 characters (09XXXXXXXXX)")
    .max(11, "Phone number must be 11 characters (09XXXXXXXXX)")
    .regex(
      /^09\d{9}$/,
      "Phone number must start with 09 and have 11 digits total",
    ),

  avatar_url: z
    .string()
    .url("Invalid URL format")
    .optional()
    .nullable()
    .default(null),

  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),

  // User status and roles
  role: z.enum(["User", "Admin", "Supervisor", "Staff"]).default("User"),

  status: z
    .enum(["Active", "Inactive", "Suspended", "Pending"])
    .default("Pending"),

  // Verification status
  is_verified: z.boolean().default(false), // PWD verified status
  is_email_verified: z.boolean().default(false),
  // is_phone_verified: z.boolean().default(false), // REMOVED - Phone verification not needed

  // Metadata
  created_by: z.string().optional().nullable().default(null),
  updated_by: z.string().optional().nullable().default(null),
});

// Registration Schema - Explicitly excludes form_id
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
});

// PWD Verification Form Schema - For submitting PWD verification
export const PWDVerificationSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  form_id: z
    .string()
    .regex(/^FORM-\d{8}-[A-Z0-9]{5}$/, "Invalid form ID format")
    .default(() => {
      const date = new Date();
      const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      return `FORM-${dateStr}-${random}`;
    }),
  disability_type: z.string().min(1, "Disability type is required"),
  disability_certificate_url: z.string().url().optional().nullable(),
  physician_name: z.string().min(1, "Physician name is required"),
  physician_license: z.string().min(1, "Physician license is required"),
  hospital_clinic: z.string().min(1, "Hospital/Clinic is required"),
  diagnosis_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
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

export const UserPublicSchema = UserSchema.omit({
  password: true,
  created_by: true,
  updated_by: true,
}).extend({
  full_name: z.string().optional(),
  age_display: z.string().optional(),
  is_pwd_verified: z.boolean().optional(),
});

// ============ TYPES ============
export type User = z.infer<typeof UserSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type PWDVerification = z.infer<typeof PWDVerificationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type Address = z.infer<typeof AddressSchema>;

// ============ MONGOOSE SCHEMA ============
export interface IUser extends Document {
  user_id: string;
  form_id?: string | null; // Optional and nullable, NOT UNIQUE
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  sex: "Male" | "Female" | "Other";
  age: number;
  date_of_birth: Date;
  address: {
    street: string;
    barangay: string;
    city_municipality: string;
    province: string;
    region: string;
    zip_code?: string;
    country: string;
    type: "Permanent" | "Temporary" | "Present";
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact_number: string;
  avatar_url?: string | null;
  email: string;
  password: string;
  role: "User" | "Admin" | "Supervisor" | "Staff";
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  is_verified: boolean;
  is_email_verified: boolean;
  // is_phone_verified: boolean; // REMOVED - Phone verification not needed
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: Date;
  updated_at?: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserMongooseSchema = new Schema<IUser>(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        const date = new Date();
        const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `PDAO-${dateStr}-${random}`;
      },
    },

    // form_id - OPTIONAL, NOT UNIQUE
    // Multiple users can have null form_id
    // Only set when PWD verification form is submitted
    form_id: {
      type: String,
      required: false,
      unique: false, // IMPORTANT: Not unique to allow multiple nulls
      sparse: false, // No need for sparse since it's not unique
      default: null,
      index: false, // No index needed unless you query by form_id often
    },

    first_name: {
      type: String,
      required: [true, "First name is required"],
    },

    middle_name: {
      type: String,
      default: "",
    },

    last_name: {
      type: String,
      required: [true, "Last name is required"],
    },

    suffix: {
      type: String,
      enum: ["Jr.", "Sr.", "II", "III", "IV", "V", ""],
      default: "",
    },

    sex: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },

    age: {
      type: Number,
      default: 0,
    },

    date_of_birth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },

    address: {
      street: { type: String, required: [true, "Street is required"] },
      barangay: { type: String, required: [true, "Barangay is required"] },
      city_municipality: {
        type: String,
        required: [true, "City/Municipality is required"],
      },
      province: { type: String, required: [true, "Province is required"] },
      region: { type: String, required: [true, "Region is required"] },
      zip_code: { type: String, default: "" },
      country: { type: String, default: "Philippines" },
      type: {
        type: String,
        enum: ["Permanent", "Temporary", "Present"],
        default: "Permanent",
      },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    contact_number: {
      type: String,
      required: [true, "Contact number is required"],
      unique: true, // This should be unique
      validate: {
        validator: function (v: string) {
          return /^09\d{9}$/.test(v) && v.length === 11;
        },
        message: "Phone number must start with 09 and have 11 digits total",
      },
    },

    avatar_url: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // This should be unique
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["User", "Admin", "Supervisor", "Staff"],
      default: "User",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended", "Pending"],
      default: "Pending",
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    is_email_verified: {
      type: Boolean,
      default: false,
    },

    // is_phone_verified: { // REMOVED - Phone verification not needed
    //   type: Boolean,
    //   default: false,
    // },

    created_by: {
      type: String,
      default: null,
    },

    updated_by: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// Hash password before saving
UserMongooseSchema.pre<IUser>("save", async function () {
  const user = this as IUser & { isModified: (field: string) => boolean };

  if (!user.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Transform data before saving
UserMongooseSchema.pre<IUser>("save", function () {
  const user = this as IUser;

  // Calculate age from date_of_birth
  if (user.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(user.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    user.age = age;
  }

  // Convert date_of_birth string to Date if needed
  if (user.date_of_birth && typeof user.date_of_birth === "string") {
    user.date_of_birth = new Date(user.date_of_birth);
  }

  // Ensure contact_number is exactly 11 characters and starts with 09
  if (user.contact_number) {
    let cleaned = user.contact_number.replace(/\D/g, "");
    if (!cleaned.startsWith("0") && !cleaned.startsWith("63")) {
      cleaned = "0" + cleaned;
    }
    if (cleaned.startsWith("63") && cleaned.length >= 12) {
      cleaned = "0" + cleaned.substring(2);
    }
    if (cleaned.length > 11) {
      cleaned = cleaned.substring(0, 11);
    }
    user.contact_number = cleaned;
  }
});

// Compare password method
UserMongooseSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
UserMongooseSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Create and export Mongoose model
export const UserModel = mongoose.model<IUser>("User", UserMongooseSchema);

// ============ HELPER FUNCTIONS ============
export const validateUser = (data: unknown): User => {
  return UserSchema.parse(data);
};

export const validateUserRegister = (data: unknown): UserRegister => {
  return UserRegisterSchema.parse(data);
};

export const validatePWDVerification = (data: unknown): PWDVerification => {
  return PWDVerificationSchema.parse(data);
};

export const validateUserUpdate = (data: unknown): UserUpdate => {
  return UserUpdateSchema.parse(data);
};

export const validateUserLogin = (data: unknown): UserLogin => {
  return UserLoginSchema.parse(data);
};

export const sanitizeUserForPublic = (user: any): UserPublic => {
  const publicUser = UserPublicSchema.parse(user);

  let age = 0;
  let fullName = "";

  if (user.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(user.date_of_birth);
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  }

  fullName = `${user.first_name || ""} ${
    user.middle_name ? user.middle_name + " " : ""
  }${user.last_name || ""}${user.suffix ? " " + user.suffix : ""}`;

  return {
    ...publicUser,
    age_display: `${age} years`,
    full_name: fullName.trim(),
    is_pwd_verified: user.is_verified,
  };
};

// Utility function to transform Zod data to Mongoose-compatible data
export const transformForMongoose = (data: any): any => {
  const transformed = { ...data };

  // Remove form_id if it exists in registration data (should never be sent)
  if (transformed.form_id) {
    delete transformed.form_id;
  }

  // Ensure form_id is explicitly set to null for new registrations
  transformed.form_id = null;

  // Convert string dates to Date objects
  if (
    transformed.date_of_birth &&
    typeof transformed.date_of_birth === "string"
  ) {
    transformed.date_of_birth = new Date(transformed.date_of_birth);
  }

  // Ensure contact_number is 11 digits
  if (transformed.contact_number) {
    let phone = transformed.contact_number.replace(/\D/g, "");
    if (phone.startsWith("63") && phone.length >= 12) {
      phone = "0" + phone.substring(2);
    }
    if (!phone.startsWith("0") && phone.length === 10) {
      phone = "0" + phone;
    }
    transformed.contact_number = phone.substring(0, 11);
  }

  return transformed;
};
