import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Italy", "Spain",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland",
  "Poland", "Portugal", "Greece", "Ireland", "Czech Republic", "Romania", "Hungary", "Bulgaria",
  "Croatia", "Slovakia", "Slovenia", "Estonia", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Cyprus", "Japan", "China", "India", "South Korea", "Singapore", "Malaysia", "Thailand",
  "Indonesia", "Philippines", "Vietnam", "Hong Kong", "Taiwan", "New Zealand", "South Africa",
  "Egypt", "Nigeria", "Kenya", "Morocco", "Ghana", "United Arab Emirates", "Saudi Arabia",
  "Israel", "Turkey", "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru", "Venezuela",
  "Russia", "Ukraine", "Kazakhstan", "Belarus", "Georgia", "Armenia", "Azerbaijan", "Bangladesh",
  "Pakistan", "Sri Lanka", "Nepal", "Myanmar", "Cambodia", "Laos", "Mongolia", "Afghanistan",
  "Iraq", "Iran", "Jordan", "Lebanon", "Qatar", "Kuwait", "Bahrain", "Oman", "Yemen",
  "Tunisia", "Algeria", "Libya", "Sudan", "Ethiopia", "Tanzania", "Uganda", "Rwanda",
  "Zimbabwe", "Botswana", "Namibia", "Mozambique", "Angola", "Zambia", "Malawi", "Madagascar",
  "Mauritius", "Seychelles", "Other"
].sort();

interface CountryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
  required?: boolean;
}

export default function CountryMultiSelect({
  value = [],
  onChange,
  placeholder = "Select countries...",
  disabled = false,
  className,
  id,
  label,
  required = false,
}: CountryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return COUNTRIES;
    const search = searchTerm.toLowerCase();
    return COUNTRIES.filter((country) =>
      country.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  const handleToggleCountry = (country: string) => {
    if (value.includes(country)) {
      onChange(value.filter((c) => c !== country));
    } else {
      onChange([...value, country]);
    }
  };

  const handleRemoveCountry = (country: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((c) => c !== country));
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </Label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex w-full min-h-[2.5rem] items-center justify-between rounded-md border border-primary/20 bg-black/40 px-3 py-2 text-sm text-foreground ring-offset-background transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-primary/30",
            className || "h-auto"
          )}
        >
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((country) => (
                <Badge
                  key={country}
                  variant="secondary"
                  className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1"
                >
                  {country}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => handleRemoveCountry(country, e)}
                  />
                </Badge>
              ))
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform ml-2",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm("");
              }}
            />
            <div className="absolute z-50 w-full mt-1 rounded-md border border-primary/30 bg-black/95 backdrop-blur-xl shadow-lg">
              <div className="p-2 border-b border-primary/20">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-black/40 border-primary/20"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsOpen(false);
                        setSearchTerm("");
                      }
                    }}
                  />
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-1">
                {filteredCountries.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                    No countries found
                  </div>
                ) : (
                  filteredCountries.map((country) => {
                    const isSelected = value.includes(country);
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => handleToggleCountry(country)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-left transition-colors",
                          "hover:bg-primary/20 hover:text-primary",
                          "focus:bg-primary/20 focus:text-primary focus:outline-none",
                          isSelected && "bg-primary/10 text-primary"
                        )}
                      >
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                        <span className={cn(
                          isSelected && "font-semibold"
                        )}>
                          {country}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
              {value.length > 0 && (
                <div className="p-2 border-t border-primary/20 text-xs text-muted-foreground">
                  {value.length} {value.length === 1 ? "country" : "countries"} selected
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {required && value.length === 0 && (
        <p className="text-xs text-destructive">At least one country is required</p>
      )}
    </div>
  );
}

