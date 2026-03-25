import Logo from "./Logo";
import { BRAND_TITLE } from "@/lib/brand";
import { Link } from "wouter";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Philosophy", href: "/about#philosophy" },
  { label: "Contact", href: "/contact" },
  { label: "Downloads", href: "/#downloads" },
];

const tradingLinks = [
  { label: "Open Live Account", href: "/signup" },
  { label: "Demo Account", href: "/signup?demo=true" },
  { label: "Introducing Broker", href: "/introducing-broker" },
  { label: "Trading Contest", href: "/trading-contest" },
  { label: "Deposits & Withdrawals", href: "/deposits-withdrawals" },
  { label: "Trading Platforms", href: "/#trading-platforms" },
];

const forexLinks = [
  { label: "Forex Overview", href: "/forex" },
  { label: "What is Forex?", href: "/forex#what-is-forex" },
  { label: "Benefits of Forex", href: "/forex#benefits" },
  { label: "Forexpedia", href: "/forexpedia" },
  { label: "Deposits & Withdrawals", href: "/forex#deposits" },
];

const legalLinks = [
  { label: "Risk Warning", href: "/risk_disclosure_and_warning_notice.pdf", external: true },
  { label: "Anti Money Laundering", href: "/anti_money_laundering.pdf", external: true },
  { label: "Privacy Policy", href: "/privacy_agreement.pdf", external: true },
  { label: "Terms & Conditions", href: "/terms_conditions.pdf", external: true },
  { label: "Complaints", href: "/complaints" },
];

export default function Footer() {
  const renderLink = (
    link: { label: string; href: string; external?: boolean },
    index: number,
  ) => {
    const baseClasses =
      "inline-flex items-center gap-1 text-sm text-muted-foreground transition-all duration-300 group hover:text-primary";

    if (link.external) {
      return (
        <a
          key={index}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className={baseClasses}
        >
          {link.label}
          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      );
    }

    // For in-app links with hash targets (e.g. /forex#what-is-forex),
    // use a regular anchor so browser hash navigation works consistently.
    if (link.href.includes("#")) {
      return (
        <a key={index} href={link.href} className={baseClasses}>
          {link.label}
        </a>
      );
    }

    return (
      <Link key={index} href={link.href} className={baseClasses}>
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="relative border-t border-primary/20 bg-gradient-to-b from-background to-black py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-[0.08]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 blur-[220px]"></div>

      <div className="container mx-auto max-w-[1280px] relative z-10">
        <div className="grid gap-12 xl:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="space-y-6">
            <Logo />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Empowering traders worldwide with precision, transparency, and cutting-edge technology.
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-[0.3em]">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse-glow"></span>
              <span className="font-semibold text-primary">100K+ Active Traders</span>
            </div>
            <p className="text-xs text-muted-foreground/80">Registration No: 2024-00682</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-5 text-gradient-gold text-glow-gold">Company</h4>
            <div className="space-y-3">
              {companyLinks.map((link, index) => (
                <div key={link.label}>{renderLink(link, index)}</div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-5 text-gradient-gold text-glow-gold">Trading</h4>
            <div className="space-y-3">
              {tradingLinks.map((link, index) => (
                <div key={link.label}>{renderLink(link, index)}</div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-5 text-gradient-gold text-glow-gold">Forex Education</h4>
            <div className="space-y-3">
              {forexLinks.map((link, index) => (
                <div key={link.label}>{renderLink(link, index)}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
          <div className="glass-morphism-strong border border-primary/25 rounded-3xl p-8 backdrop-blur-xl">
            <h5 className="text-sm uppercase tracking-[0.4em] text-primary/80 mb-4">Legal & Compliance</h5>
            <div className="grid md:grid-cols-2 gap-8 text-xs text-muted-foreground leading-relaxed">
              <div className="space-y-3">
                <p>
                  This website is operated by <span className="text-primary font-medium">{BRAND_TITLE} Limited</span> Registration No:
                  <span className="text-primary font-medium"> 2024-00682</span>.
                </p>
                <p>
                  <span className="font-medium text-foreground">Registered address:</span> Rozka Capitals Limited, Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet Saint Lucia.
                </p>
                <p>
                  <span className="font-medium text-foreground">Physical office:</span> Office No. 3118, 3rd Floor, 107 Kievskaia Street, Bishkek, Kyrgyzstan.
                </p>
              </div>
              <div className="space-y-3">
                <p>
                  <span className="font-medium text-foreground">Risk Warning:</span> Trading Forex and leveraged financial instruments involves significant risk and may result in the loss of your invested capital.
                </p>
                <p>
                  <span className="font-medium text-foreground">Restricted Regions:</span> Rozka Capitals does not offer services to residents of jurisdictions including USA, Canada, Japan, Iran, Labuan Malaysia, Cuba, Sudan, Syria, and North Korea.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {legalLinks.map((link, index) => (
                <div key={link.label}>{renderLink(link, index)}</div>
              ))}
            </div>
          </div>

          <div className="glass-morphism border border-primary/20 rounded-3xl p-8 space-y-6">
            <h4 className="text-lg font-semibold text-gradient-gold text-glow-gold">Contact Us</h4>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <a href="mailto:support@rozkacapitals.com" className="text-white font-medium hover:text-white/80 transition-colors">
                  support@rozkacapitals.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Rozka+Capitals+Limited+Ground+Floor+The+Sotheby+Building+Rodney+Village+Rodney+Bay+Gros-Islet+Saint+Lucia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white leading-relaxed hover:text-white/80 transition-colors cursor-pointer"
                >
                  <span className="text-primary/90 text-xs uppercase tracking-wider block mb-1">Registered</span>
                  Rozka Capitals Limited
                  <br /> Ground Floor, The Sotheby Building,
                  <br /> Rodney Village, Rodney Bay, Gros-Islet Saint Lucia.
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Office+3118+107+Kievskaia+Street+Bishkek+Kyrgyzstan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white leading-relaxed hover:text-white/80 transition-colors cursor-pointer"
                >
                  <span className="text-primary/90 text-xs uppercase tracking-wider block mb-1">Physical office</span>
                  Office No. 3118, 3rd Floor,
                  <br /> 107 Kievskaia Street,
                  <br /> Bishkek, Kyrgyzstan
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-primary/20 pt-6 text-center text-xs text-muted-foreground space-y-2">
          <p className="text-primary font-semibold tracking-[0.4em] uppercase">© 2025 {BRAND_TITLE} Limited. All Rights Reserved.</p>
          <p>Your trusted partner in forex trading excellence.</p>
        </div>
      </div>
    </footer>
  );
}
