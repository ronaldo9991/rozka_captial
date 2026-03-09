import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function PublicHeader() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [forexDropdownOpen, setForexDropdownOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const forexLinks = [
    { label: "What is Forex", href: "/what-is-forex" },
    { label: "Advantages of Trading Forex", href: "/forex-advantages" },
    { label: "ForexPedia", href: "/forexpedia" },
    { label: "Deposits & Withdrawals", href: "/deposits-withdrawals" },
    { label: "Deposit Bonus", href: "/deposit-bonus" },
    { label: "No Deposit Bonus", href: "/no-deposit-bonus" },
    { label: "Trading Contest", href: "/trading-contest" },
    { label: "Introducing Broker", href: "/introducing-broker" },
  ];

  const isActive = (href: string) => location === href;
  const isForexActive =
    location === "/forex" ||
    forexLinks.some((link) => location.startsWith(link.href));

  const navLinkBase =
    "text-foreground/90 hover:text-primary transition-all duration-300 font-medium text-[15px] relative group py-2 px-1 rounded-lg hover:bg-primary/10";

  // Handle dropdown with delay to prevent accidental closes
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setForexDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Add a delay before closing to allow time to move to dropdown
    closeTimeoutRef.current = setTimeout(() => {
      setForexDropdownOpen(false);
    }, 150); // 150ms delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] safe-area-top">
      <div className="w-full">
        <div 
          className="bg-gradient-to-r from-black/95 via-black/90 to-black/95 backdrop-blur-[24px] backdrop-saturate-[200%] border-b border-primary/20"
          style={{ 
            boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
            paddingTop: 'env(safe-area-inset-top)'
          }}
        >
          <div className="container mx-auto max-w-[1280px] flex items-center justify-between h-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="lg" />
          </Link>

          {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-8">
                <Link
                  href="/"
                  className={cn(navLinkBase, isActive("/") && "text-primary")}
                  aria-current={isActive("/") ? "page" : undefined}
                >
                  Home
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300",
                      isActive("/") && "w-full"
                    )}
                  ></span>
                </Link>
                <Link
                  href="/about"
                  className={cn(navLinkBase, isActive("/about") && "text-primary")}
                  aria-current={isActive("/about") ? "page" : undefined}
                >
                  About
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300",
                      isActive("/about") && "w-full"
                    )}
                  ></span>
                </Link>
                
                {/* Forex Dropdown */}
                <div 
                  ref={dropdownRef}
                  className="relative group"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href="/forex"
                    className={cn(
                      navLinkBase,
                      "flex items-center gap-1",
                      isForexActive && "text-primary"
                    )}
                    aria-current={isForexActive ? "page" : undefined}
                  >
                    Forex
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        (forexDropdownOpen || isForexActive) && "rotate-180"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300",
                        isForexActive && "w-full"
                      )}
                    ></span>
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {forexDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-80 bg-gradient-to-br from-black/95 to-black/90 backdrop-blur-[24px] backdrop-saturate-[200%] rounded-xl py-2 z-50 border border-primary/20 shadow-2xl"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {forexLinks.map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          className="block px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 relative group/item"
                        >
                          {link.label}
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-primary group-hover/item:w-2 transition-all duration-200"></span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                <Link
                  href="/contact"
                  className={cn(navLinkBase, isActive("/contact") && "text-primary")}
                  aria-current={isActive("/contact") ? "page" : undefined}
                >
                  Contact
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300",
                      isActive("/contact") && "w-full"
                    )}
                  ></span>
                </Link>
              </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <Link href="/signin">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-foreground/80 hover:text-primary hover:bg-primary/15 h-10 px-6 text-[14px] font-medium border border-primary/20 hover:border-primary/40 rounded-lg transition-all duration-300" 
                data-testid="button-signin"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-black font-semibold h-10 px-6 text-[14px] rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105" 
                data-testid="button-signup"
              >
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - Always Visible and Clickable */}
          <button
            type="button"
            className="lg:hidden p-3 hover:bg-primary/15 rounded-xl transition-all duration-300 ease-in-out relative flex-shrink-0 cursor-pointer touch-manipulation active:scale-95 z-[120] pointer-events-auto border border-primary/20 hover:border-primary/40"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            data-testid="button-mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            style={{ WebkitTapHighlightColor: 'transparent', position: 'relative' }}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-primary transition-all duration-300 ease-in-out" />
            ) : (
              <Menu className="w-6 h-6 text-primary transition-all duration-300 ease-in-out" />
            )}
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Outside header for proper z-index */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed z-[99] pointer-events-none"
          style={{
            top: 'calc(6rem + env(safe-area-inset-top))',
            left: 0,
            right: 0,
            bottom: 0,
            animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Backdrop */}
          <div 
            className="fixed bg-black/50 backdrop-blur-md pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
            style={{ 
              top: 'calc(6rem + env(safe-area-inset-top))',
              left: 0,
              right: 0,
              bottom: 0,
              animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          
          {/* Mobile Menu Panel - Semi-transparent background */}
          <div 
            className="fixed bg-black/70 backdrop-blur-xl flex flex-col pointer-events-auto"
            style={{ 
              top: 'calc(6rem + env(safe-area-inset-top))',
              left: 0,
              right: 0,
              bottom: 0,
              animation: 'slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={(e) => {
              // Only close if clicking on the panel itself, not on links
              if (e.target === e.currentTarget) {
                setMobileMenuOpen(false);
              }
            }}
          >
                {/* Mobile Menu Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <div className="container mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 py-6">
                    <nav className="flex flex-col gap-1">
                      <Link 
                        href="/" 
                        className={cn(
                          "text-white hover:text-primary transition-all duration-300 ease-in-out px-3 sm:px-4 py-3.5 rounded-lg font-medium text-base relative transform hover:translate-x-2 active:scale-95",
                          isActive("/") && "text-primary bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive("/") ? "page" : undefined}
                        style={{ animationDelay: '0.05s', animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                      >
                        Home
                      </Link>
                      <Link 
                        href="/about" 
                        className={cn(
                          "text-white hover:text-primary transition-all duration-300 ease-in-out px-3 sm:px-4 py-3.5 rounded-lg font-medium text-base relative transform hover:translate-x-2 active:scale-95",
                          isActive("/about") && "text-primary bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive("/about") ? "page" : undefined}
                        style={{ animationDelay: '0.1s', animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                      >
                        About
                      </Link>
                      
                      {/* Forex with submenu */}
                      <div className="space-y-1">
                        <Link 
                          href="/forex" 
                          className={cn(
                            "text-white hover:text-primary transition-all duration-300 ease-in-out px-3 sm:px-4 py-3.5 rounded-lg font-medium text-base block relative transform hover:translate-x-2 active:scale-95",
                            isForexActive && "text-primary bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={isForexActive ? "page" : undefined}
                          style={{ animationDelay: '0.15s', animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                        >
                          Forex
                        </Link>
                        <div className="pl-4 sm:pl-6 pr-3 sm:pr-4 space-y-0.5 mt-1">
                          {forexLinks.map((link, index) => (
                            <Link 
                              key={index}
                              href={link.href}
                              className={cn(
                                "text-gray-300 hover:text-primary transition-all duration-300 ease-in-out px-3 sm:px-4 py-2.5 rounded-lg text-sm block transform hover:translate-x-2 active:scale-95",
                                isActive(link.href) && "text-primary bg-primary/5"
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                              aria-current={isActive(link.href) ? "page" : undefined}
                              style={{ animationDelay: `${0.2 + index * 0.05}s`, animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      
                      <Link 
                        href="/contact" 
                        className={cn(
                          "text-white hover:text-primary transition-all duration-300 ease-in-out px-3 sm:px-4 py-3.5 rounded-lg font-medium text-base relative transform hover:translate-x-2 active:scale-95",
                          isActive("/contact") && "text-primary bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive("/contact") ? "page" : undefined}
                        style={{ animationDelay: '0.5s', animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                      >
                        Contact
                      </Link>
                    </nav>
                  </div>
                </div>

                {/* Mobile CTA Buttons - Always visible at bottom */}
                <div 
                  className="flex flex-col gap-3 px-3 sm:px-4 md:px-6 py-4 border-t border-gray-800 bg-black/90"
                  style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
                >
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 border-primary/30 text-white hover:bg-primary/10 hover:border-primary text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                      data-testid="button-signin-mobile"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button 
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-semibold text-base transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-primary/50"
                      data-testid="button-signup-mobile"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
        </div>
      )}
    </header>
  );
}
