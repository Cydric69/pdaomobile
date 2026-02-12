// Development configuration
const Config = {
  // Your backend API URL - Use your local IP for mobile/device testing
  API_URL: "http://192.168.1.83:5000/api",
  // For local development (emulator/simulator):
  // API_URL: "http://localhost:5000/api",
  // For Android emulator:
  // API_URL: "http://10.0.2.2:5000/api",

  // Development flags
  IS_DEV: true,

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
    },
    USER: {
      PROFILE: "/users/profile",
    },
  },

  // Default headers for API requests
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 15000,

  // Validation patterns (ADD THESE)
  VALIDATION: {
    PHONE_REGEX: /^09\d{9}$/, // 11 digits starting with 09
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    DATE_REGEX: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
  },
};

export default Config;
