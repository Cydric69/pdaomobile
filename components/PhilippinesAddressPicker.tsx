import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Use require instead of import - it works better with this package
const phAddress = require("select-philippines-address");

interface PhilippineAddressPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: {
    region: string;
    province: string;
    city: string;
    barangay: string;
  }) => void;
  initialAddress?: {
    region: string;
    province: string;
    city: string;
    barangay: string;
  };
}

interface AddressItem {
  id: string;
  name: string;
}

const PhilippineAddressPicker: React.FC<PhilippineAddressPickerProps> = ({
  visible,
  onClose,
  onSelect,
  initialAddress,
}) => {
  const [step, setStep] = useState<"region" | "province" | "city" | "barangay">(
    "region",
  );
  const [selectedRegion, setSelectedRegion] = useState<AddressItem | null>(
    null,
  );
  const [selectedProvince, setSelectedProvince] = useState<AddressItem | null>(
    null,
  );
  const [selectedCity, setSelectedCity] = useState<AddressItem | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<AddressItem | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [regions, setRegions] = useState<AddressItem[]>([]);
  const [provinces, setProvinces] = useState<AddressItem[]>([]);
  const [cities, setCities] = useState<AddressItem[]>([]);
  const [barangays, setBarangays] = useState<AddressItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if package is available
  const isPackageAvailable =
    phAddress && typeof phAddress.regions === "function";

  // Load regions on mount
  useEffect(() => {
    if (visible) {
      loadRegions();
    }
  }, [visible]);

  // Load provinces when region is selected
  useEffect(() => {
    if (selectedRegion && visible) {
      loadProvinces(selectedRegion.id);
    }
  }, [selectedRegion, visible]);

  // Load cities when province is selected
  useEffect(() => {
    if (selectedProvince && visible) {
      loadCities(selectedProvince.id);
    }
  }, [selectedProvince, visible]);

  // Load barangays when city is selected
  useEffect(() => {
    if (selectedCity && visible) {
      loadBarangays(selectedCity.id);
    }
  }, [selectedCity, visible]);

  const loadRegions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📦 Loading regions from package...");
      console.log("Package available:", isPackageAvailable);

      if (!isPackageAvailable) {
        throw new Error("Package not properly initialized");
      }

      // Use phAddress.regions() - NOT getRegions()
      const regionsData = await phAddress.regions();
      console.log("✅ Regions loaded:", regionsData?.length || 0, "regions");

      if (!Array.isArray(regionsData)) {
        throw new Error("Regions data is not an array");
      }

      const formattedRegions = regionsData.map((region: any) => ({
        id: region.region_code,
        name: region.region_name,
      }));

      console.log("✅ Formatted regions:", formattedRegions.length);
      setRegions(formattedRegions);
    } catch (error: any) {
      console.error("❌ Error loading regions:", error.message);
      setError("Failed to load regions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProvinces = async (regionCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📦 Loading provinces for region:", regionCode);

      if (!phAddress || typeof phAddress.provinces !== "function") {
        throw new Error("Package not properly initialized");
      }

      // Use phAddress.provinces() - NOT getProvinces()
      const provincesData = await phAddress.provinces(regionCode);
      console.log("✅ Provinces loaded:", provincesData?.length || 0);

      if (!Array.isArray(provincesData)) {
        throw new Error("Provinces data is not an array");
      }

      const formattedProvinces = provincesData.map((province: any) => ({
        id: province.province_code,
        name: province.province_name,
      }));

      setProvinces(formattedProvinces);
    } catch (error: any) {
      console.error("❌ Error loading provinces:", error.message);
      setError("Failed to load provinces. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCities = async (provinceCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📦 Loading cities for province:", provinceCode);

      if (!phAddress || typeof phAddress.cities !== "function") {
        throw new Error("Package not properly initialized");
      }

      // Use phAddress.cities() - NOT getCities()
      const citiesData = await phAddress.cities(provinceCode);
      console.log("✅ Cities loaded:", citiesData?.length || 0);

      if (!Array.isArray(citiesData)) {
        throw new Error("Cities data is not an array");
      }

      const formattedCities = citiesData.map((city: any) => ({
        id: city.city_code,
        name: city.city_name,
      }));

      setCities(formattedCities);
    } catch (error: any) {
      console.error("❌ Error loading cities:", error.message);
      setError("Failed to load cities. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBarangays = async (cityCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📦 Loading barangays for city:", cityCode);

      if (!phAddress || typeof phAddress.barangays !== "function") {
        throw new Error("Package not properly initialized");
      }

      // Use phAddress.barangays() - NOT getBarangays()
      const barangaysData = await phAddress.barangays(cityCode);
      console.log("✅ Barangays loaded:", barangaysData?.length || 0);

      if (!Array.isArray(barangaysData)) {
        throw new Error("Barangays data is not an array");
      }

      const formattedBarangays = barangaysData.map((barangay: any) => ({
        id: barangay.brgy_code,
        name: barangay.brgy_name,
      }));

      setBarangays(formattedBarangays);
    } catch (error: any) {
      console.error("❌ Error loading barangays:", error.message);
      setError("Failed to load barangays. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search query
  const getFilteredData = () => {
    let data: AddressItem[] = [];

    switch (step) {
      case "region":
        data = regions;
        break;
      case "province":
        data = provinces;
        break;
      case "city":
        data = cities;
        break;
      case "barangay":
        data = barangays;
        break;
    }

    if (searchQuery.trim() === "") {
      return data;
    }

    return data.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const handleRegionSelect = (region: AddressItem) => {
    setSelectedRegion(region);
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    setSearchQuery("");
    setStep("province");
  };

  const handleProvinceSelect = (province: AddressItem) => {
    setSelectedProvince(province);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setCities([]);
    setBarangays([]);
    setSearchQuery("");
    setStep("city");
  };

  const handleCitySelect = (city: AddressItem) => {
    setSelectedCity(city);
    setSelectedBarangay(null);
    setBarangays([]);
    setSearchQuery("");
    setStep("barangay");
  };

  const handleBarangaySelect = (barangay: AddressItem) => {
    setSelectedBarangay(barangay);

    if (selectedRegion && selectedProvince && selectedCity) {
      onSelect({
        region: selectedRegion.name,
        province: selectedProvince.name,
        city: selectedCity.name,
        barangay: barangay.name,
      });
      onClose();
    }
  };

  const goBack = () => {
    if (step === "barangay") {
      setStep("city");
    } else if (step === "city") {
      setStep("province");
    } else if (step === "province") {
      setStep("region");
    }
    setSearchQuery("");
  };

  const resetSelection = () => {
    setSelectedRegion(null);
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    setStep("region");
    setSearchQuery("");
    setError(null);
  };

  const getTitle = () => {
    switch (step) {
      case "region":
        return "Select Region";
      case "province":
        return `Select Province`;
      case "city":
        return `Select City/Municipality`;
      case "barangay":
        return `Select Barangay`;
      default:
        return "Select Address";
    }
  };

  const renderItem = ({ item }: { item: AddressItem }) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => {
          if (step === "region") {
            handleRegionSelect(item);
          } else if (step === "province") {
            handleProvinceSelect(item);
          } else if (step === "city") {
            handleCitySelect(item);
          } else if (step === "barangay") {
            handleBarangaySelect(item);
          }
        }}
      >
        <Text style={styles.listItemText}>{item.name}</Text>
        <MaterialIcons name="chevron-right" size={20} color="#718096" />
      </TouchableOpacity>
    );
  };

  const filteredData = getFilteredData();

  // Set initial values when regions load
  useEffect(() => {
    if (initialAddress && regions.length > 0) {
      const region = regions.find(
        (r) => r.name.toLowerCase() === initialAddress.region.toLowerCase(),
      );
      if (region) {
        setSelectedRegion(region);
      }
    }
  }, [initialAddress, regions]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {step !== "region" && (
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={24} color="#4A5568" />
                </TouchableOpacity>
              )}
              <Text style={styles.title}>{getTitle()}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#4A5568" />
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={20} color="#E53E3E" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#A0AEC0" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${step}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A0AEC0"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialIcons name="clear" size={20} color="#A0AEC0" />
              </TouchableOpacity>
            )}
          </View>

          {/* Breadcrumb */}
          <View style={styles.breadcrumbContainer}>
            <View style={styles.breadcrumb}>
              <TouchableOpacity
                onPress={() => {
                  setStep("region");
                  setSearchQuery("");
                }}
                style={[
                  styles.breadcrumbItem,
                  step === "region" && styles.breadcrumbItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.breadcrumbText,
                    step === "region" && styles.breadcrumbTextActive,
                  ]}
                >
                  Region
                </Text>
              </TouchableOpacity>

              {selectedRegion && (
                <>
                  <MaterialIcons
                    name="chevron-right"
                    size={16}
                    color="#CBD5E0"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setStep("province");
                      setSearchQuery("");
                    }}
                    style={[
                      styles.breadcrumbItem,
                      step === "province" && styles.breadcrumbItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.breadcrumbText,
                        step === "province" && styles.breadcrumbTextActive,
                      ]}
                    >
                      Province
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {selectedProvince && (
                <>
                  <MaterialIcons
                    name="chevron-right"
                    size={16}
                    color="#CBD5E0"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setStep("city");
                      setSearchQuery("");
                    }}
                    style={[
                      styles.breadcrumbItem,
                      step === "city" && styles.breadcrumbItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.breadcrumbText,
                        step === "city" && styles.breadcrumbTextActive,
                      ]}
                    >
                      City
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {selectedCity && (
                <>
                  <MaterialIcons
                    name="chevron-right"
                    size={16}
                    color="#CBD5E0"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setStep("barangay");
                      setSearchQuery("");
                    }}
                    style={[
                      styles.breadcrumbItem,
                      step === "barangay" && styles.breadcrumbItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.breadcrumbText,
                        step === "barangay" && styles.breadcrumbTextActive,
                      ]}
                    >
                      Barangay
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Selected Address Preview */}
          {(selectedRegion ||
            selectedProvince ||
            selectedCity ||
            selectedBarangay) && (
            <View style={styles.selectedPreview}>
              <Text style={styles.selectedPreviewTitle}>Selected Address:</Text>
              <Text style={styles.selectedPreviewText}>
                {[
                  selectedBarangay?.name,
                  selectedCity?.name,
                  selectedProvince?.name,
                  selectedRegion?.name,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
          )}

          {/* Loading */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0056A6" />
              <Text style={styles.loadingText}>Loading {step} data...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons
                    name="location-off"
                    size={48}
                    color="#CBD5E0"
                  />
                  <Text style={styles.emptyText}>
                    {searchQuery ? "No results found" : "No data available"}
                  </Text>
                  {searchQuery && (
                    <Text style={styles.emptySubText}>
                      Try a different search term
                    </Text>
                  )}
                </View>
              }
            />
          )}

          {/* Reset Button */}
          <TouchableOpacity onPress={resetSelection} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A365D",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FED7D7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#9B2C2C",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#2D3748",
    marginLeft: 10,
  },
  breadcrumbContainer: {
    marginBottom: 16,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  breadcrumbItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#EDF2F7",
    marginRight: 8,
  },
  breadcrumbItemActive: {
    backgroundColor: "#0056A6",
  },
  breadcrumbText: {
    fontSize: 12,
    color: "#4A5568",
    fontWeight: "500",
  },
  breadcrumbTextActive: {
    color: "#FFFFFF",
  },
  selectedPreview: {
    backgroundColor: "#F0FFF4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#38A169",
  },
  selectedPreviewTitle: {
    fontSize: 12,
    color: "#276749",
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedPreviewText: {
    fontSize: 14,
    color: "#276749",
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  listItemText: {
    fontSize: 15,
    color: "#2D3748",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4A5568",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: "#FED7D7",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  resetButtonText: {
    color: "#9B2C2C",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PhilippineAddressPicker;
