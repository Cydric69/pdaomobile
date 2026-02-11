import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ==================== Main Login Page ====================
const PDaoLoginPage: React.FC = () => {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please fill in all fields");
      return;
    }

    if (isRegistering && !fullName) {
      Alert.alert("Required", "Please enter your full name");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Welcome",
        isRegistering ? "Account created successfully!" : "Login successful!",
      );
    }, 1200);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 25,
                backgroundColor: "#0056A6",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
                shadowColor: "#0056A6",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <FontAwesome5 name="handshake" size={48} color="#FFFFFF" />
            </View>

            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#1A365D",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              PDAO
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "#4A5568",
                textAlign: "center",
                lineHeight: 24,
                fontWeight: "500",
              }}
            >
              Persons with Disabilities Affairs Office
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            {/* Registration Field */}
            {isRegistering && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#2D3748",
                    marginBottom: 8,
                  }}
                >
                  <MaterialIcons name="person" size={16} color="#4A5568" /> Full
                  Name
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F7FAFC",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#2D3748",
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A0AEC0"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#2D3748",
                  marginBottom: 8,
                }}
              >
                <MaterialIcons name="email" size={16} color="#4A5568" /> Email
                Address
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F7FAFC",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: "#2D3748",
                  }}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#2D3748",
                  marginBottom: 8,
                }}
              >
                <MaterialIcons name="lock" size={16} color="#4A5568" /> Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F7FAFC",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: "#2D3748",
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
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
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: "#0056A6",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 8,
                shadowColor: "#0056A6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
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
              onPress={() => setIsRegistering(!isRegistering)}
              style={{
                marginTop: 24,
                paddingVertical: 12,
                alignItems: "center",
              }}
              disabled={loading}
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

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#E2E8F0",
                marginVertical: 24,
              }}
            />

            {/* Footer */}
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <MaterialIcons name="security" size={16} color="#718096" />
                <Text
                  style={{
                    fontSize: 13,
                    color: "#718096",
                    marginLeft: 6,
                    fontWeight: "500",
                  }}
                >
                  Secure & Confidential
                </Text>
              </View>
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default PDaoLoginPage;
