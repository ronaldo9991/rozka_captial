// Country to country code mapping
export const COUNTRY_CODES: Record<string, string> = {
  "United States": "+1",
  "United Kingdom": "+44",
  "Canada": "+1",
  "Australia": "+61",
  "Germany": "+49",
  "France": "+33",
  "Italy": "+39",
  "Spain": "+34",
  "Netherlands": "+31",
  "Belgium": "+32",
  "Switzerland": "+41",
  "Austria": "+43",
  "Sweden": "+46",
  "Norway": "+47",
  "Denmark": "+45",
  "Finland": "+358",
  "Poland": "+48",
  "Portugal": "+351",
  "Greece": "+30",
  "Ireland": "+353",
  "Czech Republic": "+420",
  "Romania": "+40",
  "Hungary": "+36",
  "Bulgaria": "+359",
  "Croatia": "+385",
  "Slovakia": "+421",
  "Slovenia": "+386",
  "Estonia": "+372",
  "Latvia": "+371",
  "Lithuania": "+370",
  "Luxembourg": "+352",
  "Malta": "+356",
  "Cyprus": "+357",
  "Japan": "+81",
  "China": "+86",
  "India": "+91",
  "South Korea": "+82",
  "Singapore": "+65",
  "Malaysia": "+60",
  "Thailand": "+66",
  "Indonesia": "+62",
  "Philippines": "+63",
  "Vietnam": "+84",
  "Hong Kong": "+852",
  "Taiwan": "+886",
  "New Zealand": "+64",
  "South Africa": "+27",
  "Egypt": "+20",
  "Nigeria": "+234",
  "Kenya": "+254",
  "Morocco": "+212",
  "Ghana": "+233",
  "United Arab Emirates": "+971",
  "Saudi Arabia": "+966",
  "Israel": "+972",
  "Turkey": "+90",
  "Brazil": "+55",
  "Mexico": "+52",
  "Argentina": "+54",
  "Chile": "+56",
  "Colombia": "+57",
  "Peru": "+51",
  "Venezuela": "+58",
  "Russia": "+7",
  "Ukraine": "+380",
  "Kazakhstan": "+7",
  "Belarus": "+375",
  "Georgia": "+995",
  "Armenia": "+374",
  "Azerbaijan": "+994",
  "Bangladesh": "+880",
  "Pakistan": "+92",
  "Sri Lanka": "+94",
  "Nepal": "+977",
  "Myanmar": "+95",
  "Cambodia": "+855",
  "Laos": "+856",
  "Mongolia": "+976",
  "Afghanistan": "+93",
  "Iraq": "+964",
  "Iran": "+98",
  "Jordan": "+962",
  "Lebanon": "+961",
  "Qatar": "+974",
  "Kuwait": "+965",
  "Bahrain": "+973",
  "Oman": "+968",
  "Yemen": "+967",
  "Tunisia": "+216",
  "Algeria": "+213",
  "Libya": "+218",
  "Sudan": "+249",
  "Ethiopia": "+251",
  "Tanzania": "+255",
  "Uganda": "+256",
  "Rwanda": "+250",
  "Zimbabwe": "+263",
  "Botswana": "+267",
  "Namibia": "+264",
  "Mozambique": "+258",
  "Angola": "+244",
  "Zambia": "+260",
  "Malawi": "+265",
  "Madagascar": "+261",
  "Mauritius": "+230",
  "Seychelles": "+248",
  "Other": "+1", // Default fallback
};

// Helper function to get country code
export function getCountryCode(country: string): string {
  return COUNTRY_CODES[country] || "+1";
}

// Helper function to format phone number with country code
export function formatPhoneWithCountryCode(countryCode: string, phoneNumber: string): string {
  // Remove any existing country code from phone number
  const cleaned = phoneNumber.replace(/^\+\d{1,4}\s?/, "").replace(/\D/g, "");
  return countryCode + cleaned;
}

// Helper function to extract just the number part (without country code)
export function extractPhoneNumber(fullPhone: string, countryCode: string): string {
  if (fullPhone.startsWith(countryCode)) {
    return fullPhone.slice(countryCode.length).trim();
  }
  // If it doesn't start with country code, return as is (might be user typing)
  return fullPhone.replace(/\D/g, "");
}

