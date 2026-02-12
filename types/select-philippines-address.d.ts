declare module "select-philippines-address" {
  export interface Region {
    region_code: string;
    region_name: string;
  }

  export interface Province {
    province_code: string;
    province_name: string;
    region: string;
  }

  export interface City {
    city_code: string;
    city_name: string;
    province: string;
  }

  export interface Barangay {
    brgy_code: string;
    brgy_name: string;
    city: string;
  }

  // ============ ACTUAL PACKAGE API ============
  // These are the functions that actually exist in the package
  // Your AddressPicker component correctly uses these

  export function regions(): Promise<Region[]>;
  export function provinces(regionCode: string): Promise<Province[]>;
  export function cities(provinceCode: string): Promise<City[]>;
  export function barangays(cityCode: string): Promise<Barangay[]>;

  // ============ UTILITY FUNCTIONS ============
  // Additional functions the package exports

  export function regionByCode(code: string): Promise<Region | null>;
  export function provinceByName(name: string): Promise<Province[]>;
  export function provincesByCode(code: string): Promise<Province[]>;
  export function cityByName(name: string): Promise<City[]>;
  export function citiesByCode(code: string): Promise<City[]>;
  export function barangayByName(name: string): Promise<Barangay[]>;
  export function barangaysByCode(code: string): Promise<Barangay[]>;

  // ============ DEPRECATED / NON-EXISTENT ============
  // These functions DO NOT exist in the package
  // Commented out to prevent TypeScript errors

  // export function getRegions(): Promise<Region[]>; ❌ DOES NOT EXIST
  // export function getProvinces(regionCode: string): Promise<Province[]>; ❌ DOES NOT EXIST
  // export function getCities(provinceCode: string): Promise<City[]>; ❌ DOES NOT EXIST
  // export function getBarangays(cityCode: string): Promise<Barangay[]>; ❌ DOES NOT EXIST
  // export function getProvincesByRegion(regionCode: string): Promise<Province[]>; ❌ DOES NOT EXIST
  // export function getCitiesByProvince(provinceCode: string): Promise<City[]>; ❌ DOES NOT EXIST
  // export function getBarangaysByCity(cityCode: string): Promise<Barangay[]>; ❌ DOES NOT EXIST
}

// ============ ADDITIONAL HELPER TYPES ============
// Export these for use in your components

export type PhilippineRegion = {
  code: string;
  name: string;
};

export type PhilippineProvince = {
  code: string;
  name: string;
  regionCode: string;
};

export type PhilippineCity = {
  code: string;
  name: string;
  provinceCode: string;
};

export type PhilippineBarangay = {
  code: string;
  name: string;
  cityCode: string;
};
