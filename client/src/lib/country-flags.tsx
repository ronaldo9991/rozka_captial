// Country name to flag emoji mapping
// Using ISO 3166-1 alpha-2 country codes for flag emojis
const COUNTRY_TO_FLAG: Record<string, string> = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Italy": "🇮🇹",
  "Spain": "🇪🇸",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Austria": "🇦🇹",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "Denmark": "🇩🇰",
  "Finland": "🇫🇮",
  "Poland": "🇵🇱",
  "Portugal": "🇵🇹",
  "Greece": "🇬🇷",
  "Ireland": "🇮🇪",
  "Czech Republic": "🇨🇿",
  "Romania": "🇷🇴",
  "Hungary": "🇭🇺",
  "Bulgaria": "🇧🇬",
  "Croatia": "🇭🇷",
  "Slovakia": "🇸🇰",
  "Slovenia": "🇸🇮",
  "Estonia": "🇪🇪",
  "Latvia": "🇱🇻",
  "Lithuania": "🇱🇹",
  "Luxembourg": "🇱🇺",
  "Malta": "🇲🇹",
  "Cyprus": "🇨🇾",
  "Japan": "🇯🇵",
  "China": "🇨🇳",
  "India": "🇮🇳",
  "South Korea": "🇰🇷",
  "Singapore": "🇸🇬",
  "Malaysia": "🇲🇾",
  "Thailand": "🇹🇭",
  "Indonesia": "🇮🇩",
  "Philippines": "🇵🇭",
  "Vietnam": "🇻🇳",
  "Hong Kong": "🇭🇰",
  "Taiwan": "🇹🇼",
  "New Zealand": "🇳🇿",
  "South Africa": "🇿🇦",
  "Egypt": "🇪🇬",
  "Nigeria": "🇳🇬",
  "Kenya": "🇰🇪",
  "Morocco": "🇲🇦",
  "Ghana": "🇬🇭",
  "United Arab Emirates": "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  "Israel": "🇮🇱",
  "Turkey": "🇹🇷",
  "Brazil": "🇧🇷",
  "Mexico": "🇲🇽",
  "Argentina": "🇦🇷",
  "Chile": "🇨🇱",
  "Colombia": "🇨🇴",
  "Peru": "🇵🇪",
  "Venezuela": "🇻🇪",
  "Russia": "🇷🇺",
  "Ukraine": "🇺🇦",
  "Kazakhstan": "🇰🇿",
  "Belarus": "🇧🇾",
  "Georgia": "🇬🇪",
  "Armenia": "🇦🇲",
  "Azerbaijan": "🇦🇿",
  "Bangladesh": "🇧🇩",
  "Pakistan": "🇵🇰",
  "Sri Lanka": "🇱🇰",
  "Nepal": "🇳🇵",
  "Myanmar": "🇲🇲",
  "Cambodia": "🇰🇭",
  "Laos": "🇱🇦",
  "Mongolia": "🇲🇳",
  "Afghanistan": "🇦🇫",
  "Iraq": "🇮🇶",
  "Iran": "🇮🇷",
  "Jordan": "🇯🇴",
  "Lebanon": "🇱🇧",
  "Qatar": "🇶🇦",
  "Kuwait": "🇰🇼",
  "Bahrain": "🇧🇭",
  "Oman": "🇴🇲",
  "Yemen": "🇾🇪",
  "Tunisia": "🇹🇳",
  "Algeria": "🇩🇿",
  "Libya": "🇱🇾",
  "Sudan": "🇸🇩",
  "Ethiopia": "🇪🇹",
  "Tanzania": "🇹🇿",
  "Uganda": "🇺🇬",
  "Rwanda": "🇷🇼",
  "Zimbabwe": "🇿🇼",
  "Botswana": "🇧🇼",
  "Namibia": "🇳🇦",
  "Mozambique": "🇲🇿",
  "Angola": "🇦🇴",
  "Zambia": "🇿🇲",
  "Malawi": "🇲🇼",
  "Madagascar": "🇲🇬",
  "Mauritius": "🇲🇺",
  "Seychelles": "🇸🇨",
  "Albania": "🇦🇱",
  "Other": "🌍",
  "Unknown": "🌍",
};

/**
 * Normalize country name by removing country code prefix (e.g., "DZ Algeria" -> "Algeria")
 * @param countryName - The country name, possibly with country code prefix
 * @returns Normalized country name
 */
function normalizeCountryName(countryName: string): string {
  if (!countryName) return "";
  
  // Remove country code prefix (2-3 letter codes followed by space)
  // Examples: "DZ Algeria" -> "Algeria", "US United States" -> "United States", "PK Pakistan" -> "Pakistan"
  const codePrefixMatch = countryName.match(/^[A-Z]{2,3}\s+(.+)$/i);
  if (codePrefixMatch) {
    return codePrefixMatch[1].trim();
  }
  
  // Also handle formats like "DZAlgeria" (no space)
  const noSpaceMatch = countryName.match(/^[A-Z]{2,3}(.+)$/i);
  if (noSpaceMatch) {
    return noSpaceMatch[1].trim();
  }
  
  return countryName.trim();
}

/**
 * Get flag emoji for a country name
 * @param countryName - The name of the country (may include country code prefix)
 * @returns Flag emoji string or 🌍 as fallback
 */
export function getCountryFlag(countryName: string | null | undefined): string {
  if (!countryName) return "🌍";
  
  // Normalize the country name first
  const normalized = normalizeCountryName(countryName);
  
  // Try exact match first (case-sensitive)
  if (COUNTRY_TO_FLAG[normalized]) {
    return COUNTRY_TO_FLAG[normalized];
  }
  
  // Try case-insensitive match
  const normalizedLower = normalized.toLowerCase();
  const matchingKey = Object.keys(COUNTRY_TO_FLAG).find(
    key => key.toLowerCase() === normalizedLower
  );
  if (matchingKey) {
    return COUNTRY_TO_FLAG[matchingKey];
  }
  
  // Try original name in case it's already normalized (case-sensitive)
  if (COUNTRY_TO_FLAG[countryName]) {
    return COUNTRY_TO_FLAG[countryName];
  }
  
  // Try original name case-insensitive
  const originalLower = countryName.toLowerCase();
  const originalMatchingKey = Object.keys(COUNTRY_TO_FLAG).find(
    key => key.toLowerCase() === originalLower
  );
  if (originalMatchingKey) {
    return COUNTRY_TO_FLAG[originalMatchingKey];
  }
  
  // Fallback to globe emoji
  return "🌍";
}

import React from "react";

/**
 * CountryFlag component props
 */
export interface CountryFlagProps {
  country: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * CountryFlag component to display country flag emoji
 */
export function CountryFlag({ country, className = "", size = "md" }: CountryFlagProps) {
  const flag = getCountryFlag(country);
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`} role="img" aria-label={`Flag of ${country || "Unknown"}`}>
      {flag}
    </span>
  );
}

