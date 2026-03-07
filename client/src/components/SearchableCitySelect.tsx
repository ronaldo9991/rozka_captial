import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCitiesForCountry } from "@/utils/countryCities";

const OTHER_OPTION = "Other";

interface SearchableCitySelectProps {
  value: string;
  onChange: (value: string) => void;
  country: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function SearchableCitySelect({
  value,
  onChange,
  country,
  placeholder = "Select your city...",
  disabled = false,
  className,
  id,
}: SearchableCitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [otherCityValue, setOtherCityValue] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const cities = useMemo(() => {
    if (!country) return [];
    return getCitiesForCountry(country);
  }, [country]);

  // Check if current value is "Other" or a custom city not in the list
  useEffect(() => {
    if (value && value !== OTHER_OPTION && !cities.includes(value)) {
      setIsOtherSelected(true);
      setOtherCityValue(value);
    } else if (value === OTHER_OPTION) {
      setIsOtherSelected(true);
      setOtherCityValue("");
    } else {
      setIsOtherSelected(false);
      setOtherCityValue("");
    }
  }, [value, cities]);

  const filteredCities = useMemo(() => {
    const allOptions = [...cities, OTHER_OPTION];
    if (!searchTerm) return allOptions;
    const search = searchTerm.toLowerCase();
    return allOptions.filter((city) =>
      city.toLowerCase().includes(search)
    );
  }, [searchTerm, cities]);

  const selectedCity = cities.find((c) => c === value) || (isOtherSelected ? OTHER_OPTION : null);

  const handleCitySelect = (selectedValue: string) => {
    if (selectedValue === OTHER_OPTION) {
      setIsOtherSelected(true);
      onChange(OTHER_OPTION);
      setOtherCityValue("");
    } else {
      setIsOtherSelected(false);
      onChange(selectedValue);
      setOtherCityValue("");
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleOtherCityChange = (newValue: string) => {
    setOtherCityValue(newValue);
    onChange(newValue || OTHER_OPTION);
  };

  if (!country) {
    return (
      <div className={cn("flex w-full items-center justify-between rounded-md border border-primary/20 bg-black/40 px-3 py-2 text-sm text-muted-foreground", className || "h-10")}>
        <span>Please select a country first</span>
      </div>
    );
  }

  // Show input field when "Other" is selected
  if (isOtherSelected) {
    return (
      <div className="space-y-1.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-md border border-primary/20 bg-black/40 px-3 py-2 text-sm text-foreground ring-offset-background transition-all mb-2",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-primary/30",
              className || "h-10"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-primary font-semibold">{OTHER_OPTION}</span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} />
          </button>
          <Input
            type="text"
            placeholder="Enter your city name"
            value={otherCityValue}
            onChange={(e) => handleOtherCityChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "h-10 text-sm border-primary/30 bg-black/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all",
              className
            )}
            required
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-primary/20 bg-black/40 px-3 py-2 text-sm text-foreground ring-offset-background transition-all",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-primary/30",
          className || "h-10"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className={cn(
            "truncate",
            !selectedCity && "text-muted-foreground"
          )}>
            {selectedCity || placeholder}
          </span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-1 w-full rounded-md border border-primary/20 bg-black/95 shadow-lg backdrop-blur-xl">
            <div className="p-2 border-b border-primary/10">
              <Input
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 bg-black/40 border-primary/20 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                    setSearchTerm("");
                  }
                }}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filteredCities.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                  {cities.length === 0
                    ? "No preset cities for this country. Select \"Other\" to type your city."
                    : "No cities match your search. Clear the search or select \"Other\" to type your city."}
                </div>
              ) : (
                filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-left transition-colors",
                      "hover:bg-primary/20 hover:text-primary",
                      "focus:bg-primary/20 focus:text-primary focus:outline-none",
                      (value === city || (city === OTHER_OPTION && isOtherSelected)) && "bg-primary/10 text-primary"
                    )}
                  >
                    {(value === city || (city === OTHER_OPTION && isOtherSelected)) && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                    <span className={cn(
                      (value === city || (city === OTHER_OPTION && isOtherSelected)) && "font-semibold"
                    )}>
                      {city}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

