import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import PhilippineAddressPicker from "../components/PhilippinesAddressPicker";
import Config from "../config";
import { useAuthStore } from "../stores/authStore";

const { width } = Dimensions.get("window");

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: any;
  errors?: Array<{ field: string; message: string }>;
  field?: string;
}

const PDaoLoginPage: React.FC = () => {
  const router = useRouter();
  const auth = useAuthStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [sex, setSex] = useState<"Male" | "Female" | "Other">("Other");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Address fields - using Philippine address picker
  const [street, setStreet] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Modals
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [isAddressPickerLoading, setIsAddressPickerLoading] = useState(false);

  useEffect(() => {
    auth.clearError();
    setFieldErrors({});
  }, []);

  // Clear field errors when switching modes
  useEffect(() => {
    setFieldErrors({});
  }, [isRegistering]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateDate = (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  };

  const handleLogin = async () => {
    // Clear previous errors
    setFieldErrors({});
    auth.clearError();

    // Validate required fields
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    auth.setLoading(true);

    try {
      const loginData = {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      };

      console.log("📤 Sending login data:", {
        ...loginData,
        password: "********",
      });

      const response = await fetch(`${Config.API_URL}/auth/login`, {
        method: "POST",
        headers: Config.DEFAULT_HEADERS,
        body: JSON.stringify(loginData),
      });

      const data: ApiResponse<any> = await response.json();
      console.log("📥 Login response:", {
        ...data,
        token: data.token ? "***" : undefined,
      });

      if (!response.ok || !data.success) {
        // Handle field-specific errors
        if (data.field) {
          setFieldErrors({ [data.field]: data.message });
          Alert.alert("Login Failed", data.message);
        } else if (data.errors) {
          const errors: Record<string, string> = {};
          data.errors.forEach((err: any) => {
            if (err.field) errors[err.field] = err.message;
          });
          setFieldErrors(errors);
          Alert.alert("Login Failed", data.message || "Invalid credentials");
        } else {
          Alert.alert(
            "Login Failed",
            data.message || "Invalid email or password",
          );
        }
        return;
      }

      if (data.data?.user && data.data?.token) {
        await auth.login(data.data.user, data.data.token);
        Alert.alert("Success", "Login successful!");
        router.replace("/home");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      const errorMessage = error.message || "An error occurred during login";
      auth.setError(errorMessage);
      Alert.alert("Login Failed", errorMessage);
    } finally {
      auth.setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Clear previous errors
    setFieldErrors({});
    auth.clearError();

    // Validate required fields
    const requiredFields = [
      { field: firstName, name: "First name" },
      { field: lastName, name: "Last name" },
      { field: email, name: "Email" },
      { field: password, name: "Password" },
      { field: confirmPassword, name: "Confirm password" },
      { field: contactNumber, name: "Contact number" },
      { field: dateOfBirth, name: "Date of birth" },
      { field: street, name: "Street address" },
      { field: selectedRegion, name: "Region" },
      { field: selectedProvince, name: "Province" },
      { field: selectedCity, name: "City" },
      { field: selectedBarangay, name: "Barangay" },
    ];

    const missingFields = requiredFields.filter((f) => !f.field?.trim());
    if (missingFields.length > 0) {
      Alert.alert("Required", "Please fill in all required fields");
      return;
    }

    // Email validation
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 8) {
      Alert.alert("Password Error", "Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match");
      return;
    }

    // Date validation
    if (!validateDate(dateOfBirth)) {
      Alert.alert(
        "Date Error",
        "Please use YYYY-MM-DD format for date of birth",
      );
      return;
    }

    // Age validation (must be at least 18 years old)
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      Alert.alert("Age Error", "You must be at least 18 years old to register");
      return;
    }

    // Phone validation
    if (!validatePhone(contactNumber)) {
      Alert.alert(
        "Phone Error",
        "Please enter a valid 11-digit Philippine mobile number\n\nFormat: 09XXXXXXXXX\nExample: 09171234567",
      );
      return;
    }

    auth.setLoading(true);

    try {
      // Format data according to backend schema
      // IMPORTANT: form_id is intentionally NOT included
      // It will default to null in the database and will only be set
      // when the user submits a PWD verification form after login
      const registerData = {
        first_name: firstName.trim(),
        middle_name: middleName.trim() || "",
        last_name: lastName.trim(),
        suffix: suffix || "",
        sex,
        date_of_birth: dateOfBirth.trim(),
        address: {
          street: street.trim(),
          barangay: selectedBarangay.trim(),
          city_municipality: selectedCity.trim(),
          province: selectedProvince.trim(),
          region: selectedRegion.trim(),
          zip_code: zipCode.trim() || "",
          country: "Philippines",
          type: "Permanent" as const,
        },
        contact_number: contactNumber.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        // form_id is NOT sent - it will be null in the database
      };

      console.log("📤 Sending registration data:", {
        ...registerData,
        password: "********",
        // Confirm form_id is not being sent
        form_id: "NOT SENT (will default to null)",
      });

      const response = await fetch(`${Config.API_URL}/auth/register`, {
        method: "POST",
        headers: Config.DEFAULT_HEADERS,
        body: JSON.stringify(registerData),
      });

      const data: ApiResponse<any> = await response.json();
      console.log("📥 Registration response:", data);

      if (!response.ok || !data.success) {
        // Handle field-specific errors (like duplicate email, contact number)
        if (data.field) {
          setFieldErrors({ [data.field]: data.message });
          Alert.alert("Registration Failed", data.message);
        } else if (data.errors && Array.isArray(data.errors)) {
          const errors: Record<string, string> = {};
          data.errors.forEach((err: any) => {
            if (err.field) errors[err.field] = err.message;
          });
          setFieldErrors(errors);
          Alert.alert(
            "Validation Error",
            data.errors[0]?.message || "Please check your inputs",
          );
        } else {
          Alert.alert(
            "Registration Failed",
            data.message || "Registration failed",
          );
        }
        return;
      }

      // SUCCESS: Show message and switch to login
      Alert.alert(
        "🎉 Registration Successful!",
        "Your account has been created successfully.\n\n" +
          "📧 Please check your email for verification instructions.\n" +
          "📝 After verification, you can submit your PWD application form.",
        [
          {
            text: "OK",
            onPress: () => {
              setIsRegistering(false);
              clearRegistrationFields();
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setFieldErrors({});
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      const errorMessage =
        error.message || "An error occurred during registration";
      auth.setError(errorMessage);

      if (!errorMessage.includes("already registered")) {
        Alert.alert("Registration Failed", errorMessage);
      }
    } finally {
      auth.setLoading(false);
    }
  };

  const clearRegistrationFields = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSuffix("");
    setSex("Other");
    setDateOfBirth("");
    setContactNumber("");
    setConfirmPassword("");
    setStreet("");
    setSelectedRegion("");
    setSelectedProvince("");
    setSelectedCity("");
    setSelectedBarangay("");
    setZipCode("");
  };

  const handleSubmit = async () => {
    if (isRegistering) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      setDateOfBirth(`${year}-${month}-${day}`);

      // Clear date error if exists
      if (fieldErrors.date_of_birth) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.date_of_birth;
          return newErrors;
        });
      }
    }
  };

  const formatContactNumber = (text: string) => {
    // Remove all non-digit characters
    let cleaned = text.replace(/\D/g, "");

    // If it doesn't start with 0, add 0
    if (cleaned.length > 0 && !cleaned.startsWith("0")) {
      cleaned = "0" + cleaned;
    }

    // Remove country code if present
    if (cleaned.startsWith("63") && cleaned.length >= 12) {
      cleaned = "0" + cleaned.substring(2);
    }

    // Limit to 11 digits for 09 format
    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }

    setContactNumber(cleaned);

    // Clear field error for contact number when user starts typing
    if (fieldErrors.contact_number) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.contact_number;
        return newErrors;
      });
    }
  };

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleAddressSelect = (address: {
    region: string;
    province: string;
    city: string;
    barangay: string;
  }) => {
    setSelectedRegion(address.region);
    setSelectedProvince(address.province);
    setSelectedCity(address.city);
    setSelectedBarangay(address.barangay);

    // Clear any address-related errors
    const addressFields = [
      "address.region",
      "address.province",
      "address.city",
      "address.barangay",
    ];

    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      addressFields.forEach((field) => {
        delete newErrors[field];
      });
      return newErrors;
    });
  };

  const getSelectedAddressText = () => {
    if (!selectedRegion) return "No address selected";

    const parts = [];
    if (selectedBarangay) parts.push(selectedBarangay);
    if (selectedCity) parts.push(selectedCity);
    if (selectedProvince) parts.push(selectedProvince);
    if (selectedRegion) parts.push(selectedRegion);

    return parts.join(", ");
  };

  const age = calculateAge(dateOfBirth);
  const { isLoading, error } = auth;
  const hasAddress =
    selectedRegion && selectedProvince && selectedCity && selectedBarangay;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  backgroundColor: "#0056A6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: "#0056A6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <FontAwesome5 name="handshake" size={40} color="#FFFFFF" />
              </View>

              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: "#1A365D",
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                {isRegistering ? "Create Account" : "PDAO Portal"}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#4A5568",
                  textAlign: "center",
                  lineHeight: 20,
                  fontWeight: "500",
                }}
              >
                Persons with Disabilities Affairs Office
              </Text>

              {!isRegistering && (
                <Text
                  style={{
                    fontSize: 13,
                    color: "#718096",
                    textAlign: "center",
                    marginTop: 8,
                    fontStyle: "italic",
                  }}
                >
                  PWD verification available after login
                </Text>
              )}
            </View>

            {/* Form Card */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 4,
              }}
            >
              {/* Error Display */}
              {error && (
                <View
                  style={{
                    backgroundColor: "#FED7D7",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: "#E53E3E",
                  }}
                >
                  <Text style={{ color: "#9B2C2C", fontSize: 14 }}>
                    {error}
                  </Text>
                </View>
              )}

              {isRegistering ? (
                <>
                  {/* Registration Form */}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#1A365D",
                      marginBottom: 16,
                    }}
                  >
                    Personal Information
                  </Text>

                  {/* First Name */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      First Name *
                    </Text>
                    <TextInput
                      style={[
                        {
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: fieldErrors.first_name
                            ? "#E53E3E"
                            : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          fontSize: 15,
                          color: "#2D3748",
                        },
                      ]}
                      placeholder="Enter first name"
                      placeholderTextColor="#A0AEC0"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (fieldErrors.first_name) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.first_name;
                            return newErrors;
                          });
                        }
                      }}
                    />
                    {fieldErrors.first_name && (
                      <Text
                        style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}
                      >
                        {fieldErrors.first_name}
                      </Text>
                    )}
                  </View>

                  {/* Middle Name */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Middle Name (Optional)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#F7FAFC",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        fontSize: 15,
                        color: "#2D3748",
                      }}
                      placeholder="Enter middle name"
                      placeholderTextColor="#A0AEC0"
                      value={middleName}
                      onChangeText={setMiddleName}
                    />
                  </View>

                  {/* Last Name */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Last Name *
                    </Text>
                    <TextInput
                      style={[
                        {
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: fieldErrors.last_name
                            ? "#E53E3E"
                            : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          fontSize: 15,
                          color: "#2D3748",
                        },
                      ]}
                      placeholder="Enter last name"
                      placeholderTextColor="#A0AEC0"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (fieldErrors.last_name) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.last_name;
                            return newErrors;
                          });
                        }
                      }}
                    />
                    {fieldErrors.last_name && (
                      <Text
                        style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}
                      >
                        {fieldErrors.last_name}
                      </Text>
                    )}
                  </View>

                  {/* Suffix */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Suffix (Optional)
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {["", "Jr.", "Sr.", "II", "III", "IV", "V"].map(
                        (option) => (
                          <TouchableOpacity
                            key={option}
                            onPress={() => setSuffix(option)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              backgroundColor:
                                suffix === option ? "#0056A6" : "#F7FAFC",
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor:
                                suffix === option ? "#0056A6" : "#E2E8F0",
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  suffix === option ? "#FFFFFF" : "#2D3748",
                                fontWeight: "600",
                                fontSize: 14,
                              }}
                            >
                              {option || "None"}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  </View>

                  {/* Sex */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Sex *
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {(["Male", "Female", "Other"] as const).map((option) => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => setSex(option)}
                          style={{
                            flex: 1,
                            backgroundColor:
                              sex === option ? "#0056A6" : "#F7FAFC",
                            borderRadius: 10,
                            paddingVertical: 10,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: sex === option ? "#0056A6" : "#E2E8F0",
                          }}
                        >
                          <Text
                            style={{
                              color: sex === option ? "#FFFFFF" : "#2D3748",
                              fontWeight: "600",
                              fontSize: 14,
                            }}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Date of Birth */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Date of Birth *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      style={{
                        backgroundColor: "#F7FAFC",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: fieldErrors.date_of_birth
                          ? "#E53E3E"
                          : "#E2E8F0",
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: dateOfBirth ? "#2D3748" : "#A0AEC0",
                        }}
                      >
                        {dateOfBirth || "Select date"}
                      </Text>
                      <MaterialIcons
                        name="calendar-today"
                        size={20}
                        color="#4A5568"
                      />
                    </TouchableOpacity>
                    {dateOfBirth && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 4,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#718096" }}>
                          Age: {age} years
                        </Text>
                        {age < 18 && (
                          <Text style={{ fontSize: 12, color: "#E53E3E" }}>
                            Must be 18+
                          </Text>
                        )}
                      </View>
                    )}
                    {fieldErrors.date_of_birth && (
                      <Text
                        style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}
                      >
                        {fieldErrors.date_of_birth}
                      </Text>
                    )}
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={
                        dateOfBirth
                          ? new Date(dateOfBirth)
                          : new Date(2000, 0, 1)
                      }
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  )}

                  {/* Contact Number */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Contact Number *
                    </Text>
                    <TextInput
                      style={[
                        {
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: fieldErrors.contact_number
                            ? "#E53E3E"
                            : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          fontSize: 15,
                          color: "#2D3748",
                        },
                      ]}
                      placeholder="09171234567"
                      placeholderTextColor="#A0AEC0"
                      value={contactNumber}
                      onChangeText={formatContactNumber}
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                    <Text
                      style={{ fontSize: 12, color: "#718096", marginTop: 4 }}
                    >
                      Format: 09XXXXXXXXX (11 digits total)
                    </Text>
                    {contactNumber.length > 0 && (
                      <Text
                        style={{
                          fontSize: 12,
                          color:
                            contactNumber.length === 11 ? "#38A169" : "#E53E3E",
                          marginTop: 2,
                        }}
                      >
                        {contactNumber.length}/11 characters
                      </Text>
                    )}
                    {fieldErrors.contact_number && (
                      <Text
                        style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}
                      >
                        {fieldErrors.contact_number}
                      </Text>
                    )}
                  </View>

                  {/* Address Information */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 12,
                      }}
                    >
                      Address Information *
                    </Text>

                    {/* Street */}
                    <View style={{ marginBottom: 16 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: "#2D3748",
                          marginBottom: 8,
                        }}
                      >
                        Street/Subdivision/House No. *
                      </Text>
                      <TextInput
                        style={[
                          {
                            backgroundColor: "#F7FAFC",
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: fieldErrors["address.street"]
                              ? "#E53E3E"
                              : "#E2E8F0",
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            fontSize: 15,
                            color: "#2D3748",
                          },
                        ]}
                        placeholder="e.g., 123 Main St, Sunshine Village"
                        placeholderTextColor="#A0AEC0"
                        value={street}
                        onChangeText={(text) => {
                          setStreet(text);
                          if (fieldErrors["address.street"]) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors["address.street"];
                              return newErrors;
                            });
                          }
                        }}
                      />
                      {fieldErrors["address.street"] && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#E53E3E",
                            marginTop: 4,
                          }}
                        >
                          {fieldErrors["address.street"]}
                        </Text>
                      )}
                    </View>

                    {/* Philippine Address Picker */}
                    <View style={{ marginBottom: 16 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: "#2D3748",
                          marginBottom: 8,
                        }}
                      >
                        Location *
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowAddressPicker(true)}
                        disabled={isAddressPickerLoading}
                        style={{
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: hasAddress ? "#38A169" : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          minHeight: 60,
                          justifyContent: "center",
                          opacity: isAddressPickerLoading ? 0.7 : 1,
                        }}
                      >
                        {isAddressPickerLoading ? (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <ActivityIndicator size="small" color="#0056A6" />
                            <Text style={{ marginLeft: 10, color: "#4A5568" }}>
                              Loading address data...
                            </Text>
                          </View>
                        ) : hasAddress ? (
                          <View>
                            <Text
                              style={{
                                color: "#276749",
                                fontSize: 14,
                                fontWeight: "600",
                                marginBottom: 4,
                              }}
                            >
                              ✓ Address Selected
                            </Text>
                            <Text
                              style={{
                                color: "#2D3748",
                                fontSize: 13,
                                lineHeight: 18,
                              }}
                            >
                              {getSelectedAddressText()}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <MaterialIcons
                              name="location-on"
                              size={20}
                              color="#A0AEC0"
                              style={{ marginRight: 10 }}
                            />
                            <Text
                              style={{
                                color: "#A0AEC0",
                                fontSize: 15,
                                flex: 1,
                              }}
                            >
                              Tap to select Region, Province, City, and Barangay
                            </Text>
                            <MaterialIcons
                              name="chevron-right"
                              size={20}
                              color="#A0AEC0"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* ZIP Code */}
                    <View style={{ marginBottom: 20 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: "#2D3748",
                          marginBottom: 8,
                        }}
                      >
                        ZIP Code (Optional)
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          fontSize: 15,
                          color: "#2D3748",
                        }}
                        placeholder="Enter 4-digit ZIP code"
                        placeholderTextColor="#A0AEC0"
                        value={zipCode}
                        onChangeText={setZipCode}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Email Address *
                    </Text>
                    <TextInput
                      style={[
                        {
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: fieldErrors.email
                            ? "#E53E3E"
                            : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          fontSize: 15,
                          color: "#2D3748",
                        },
                      ]}
                      placeholder="your.email@example.com"
                      placeholderTextColor="#A0AEC0"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.email;
                            return newErrors;
                          });
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {fieldErrors.email && (
                      <Text
                        style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}
                      >
                        {fieldErrors.email}
                      </Text>
                    )}
                  </View>

                  {/* Password */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Password *
                    </Text>
                    <View
                      style={[
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: fieldErrors.password
                            ? "#E53E3E"
                            : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                        },
                      ]}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: "#2D3748",
                        }}
                        placeholder="Minimum 8 characters"
                        placeholderTextColor="#A0AEC0"
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.password;
                              return newErrors;
                            });
                          }
                        }}
                        secureTextEntry={!showPassword}
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ padding: 4 }}
                      >
                        <MaterialIcons
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#4A5568"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={{ fontSize: 12, color: "#718096", marginTop: 4 }}
                    >
                      Password must be at least 8 characters
                    </Text>
                    {fieldErrors.password && (
                      <Text
                        style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}
                      >
                        {fieldErrors.password}
                      </Text>
                    )}
                  </View>

                  {/* Confirm Password */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Confirm Password *
                    </Text>
                    <View
                      style={[
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor:
                            password !== confirmPassword &&
                            confirmPassword.length > 0
                              ? "#E53E3E"
                              : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                        },
                      ]}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: "#2D3748",
                        }}
                        placeholder="Re-enter password"
                        placeholderTextColor="#A0AEC0"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={{ padding: 4 }}
                      >
                        <MaterialIcons
                          name={
                            showConfirmPassword
                              ? "visibility-off"
                              : "visibility"
                          }
                          size={20}
                          color="#4A5568"
                        />
                      </TouchableOpacity>
                    </View>
                    {password !== confirmPassword &&
                      confirmPassword.length > 0 && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#E53E3E",
                            marginTop: 4,
                          }}
                        >
                          Passwords do not match
                        </Text>
                      )}
                  </View>
                </>
              ) : (
                <>
                  {/* Login Form */}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#1A365D",
                      marginBottom: 20,
                    }}
                  >
                    Welcome Back
                  </Text>

                  {/* Email */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Email Address *
                    </Text>
                    <TextInput
                      style={[
                        {
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: fieldErrors.email
                            ? "#E53E3E"
                            : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          fontSize: 15,
                          color: "#2D3748",
                        },
                      ]}
                      placeholder="your.email@example.com"
                      placeholderTextColor="#A0AEC0"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.email;
                            return newErrors;
                          });
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {fieldErrors.email && (
                      <Text
                        style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}
                      >
                        {fieldErrors.email}
                      </Text>
                    )}
                  </View>

                  {/* Password */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#2D3748",
                        marginBottom: 8,
                      }}
                    >
                      Password *
                    </Text>
                    <View
                      style={[
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F7FAFC",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: fieldErrors.password
                            ? "#E53E3E"
                            : "#E2E8F0",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                        },
                      ]}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: "#2D3748",
                        }}
                        placeholder="Enter your password"
                        placeholderTextColor="#A0AEC0"
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.password;
                              return newErrors;
                            });
                          }
                        }}
                        secureTextEntry={!showPassword}
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ padding: 4 }}
                      >
                        <MaterialIcons
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={20}
                          color="#4A5568"
                        />
                      </TouchableOpacity>
                    </View>
                    {fieldErrors.password && (
                      <Text
                        style={{ fontSize: 12, color: "#E53E3E", marginTop: 4 }}
                      >
                        {fieldErrors.password}
                      </Text>
                    )}
                  </View>
                </>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={
                  isLoading || (isRegistering && password !== confirmPassword)
                }
                style={{
                  backgroundColor: "#0056A6",
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginTop: 8,
                  shadowColor: "#0056A6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  opacity:
                    isLoading || (isRegistering && password !== confirmPassword)
                      ? 0.7
                      : 1,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons
                      name={isRegistering ? "person-add" : "login"}
                      size={20}
                      color="#FFFFFF"
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      {isRegistering ? "Create Account" : "Sign In"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Toggle Register/Login */}
              <TouchableOpacity
                onPress={() => {
                  setIsRegistering(!isRegistering);
                  auth.clearError();
                  setFieldErrors({});
                  if (isRegistering) {
                    clearRegistrationFields();
                  }
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                style={{
                  marginTop: 20,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
                disabled={isLoading}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#0056A6",
                    textAlign: "center",
                  }}
                >
                  {isRegistering
                    ? "Already have an account? Sign In"
                    : "Need an account? Register Here"}
                </Text>
              </TouchableOpacity>

              {/* Connection Info (for debugging) */}
              {Config.IS_DEV && (
                <View
                  style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: "#EDF2F7",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#4A5568",
                      textAlign: "center",
                    }}
                  >
                    Backend: {Config.API_URL}
                  </Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={{ alignItems: "center", marginTop: 30 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#A0AEC0",
                  textAlign: "center",
                }}
              >
                © 2024 Persons with Disabilities Affairs Office
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Philippine Address Picker Modal */}
        <PhilippineAddressPicker
          visible={showAddressPicker}
          onClose={() => setShowAddressPicker(false)}
          onSelect={handleAddressSelect}
          initialAddress={
            selectedRegion
              ? {
                  region: selectedRegion,
                  province: selectedProvince,
                  city: selectedCity,
                  barangay: selectedBarangay,
                }
              : undefined
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default PDaoLoginPage;
