import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, QrCode, Globe } from "lucide-react";

// Logo Components - Using local images from public folder
const WindowsLogo = () => {
  const imagePath = `${import.meta.env.BASE_URL || ''}videos/windows-10-icon-seeklogo.png`;
  return (
    <img 
      src={imagePath}
      alt="Windows Logo" 
      className="w-7 h-7 object-contain"
      style={{ display: 'block', width: '28px', height: '28px', maxWidth: '100%' }}
      loading="eager"
    />
  );
};

const AppleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#A6B1BB"/>
  </svg>
);

const LinuxLogo = () => {
  const imagePath = `${import.meta.env.BASE_URL || ''}videos/ubuntu-linux-seeklogo.png`;
  return (
    <img 
      src={imagePath}
      alt="Linux Logo" 
      className="w-7 h-7 object-contain"
      style={{ display: 'block', width: '28px', height: '28px', maxWidth: '100%' }}
      loading="eager"
    />
  );
};

const downloadOptions = [
  {
    title: "MetaTrader 5 for Windows",
    href: "https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe",
    cta: "Download .exe",
    icon: WindowsLogo,
    description: "Full-featured desktop terminal with advanced charting and algorithmic trading support.",
  },
  {
    title: "MetaTrader 5 for macOS",
    href: `${import.meta.env.BASE_URL || ''}MetaTrader5.pkg.zip`,
    cta: "Download .pkg.zip",
    icon: AppleLogo,
    description: "Optimized MT5 build for macOS with hedging/netting accounts and MQL5 marketplace access.",
    download: true,
  },
  {
    title: "MetaTrader 5 for Linux",
    href: "https://www.mql5.com/en/articles/625",
    cta: "Linux install guide",
    icon: LinuxLogo,
    description: "Cross-platform install package for Ubuntu and other Linux distributions.",
  },
  {
    title: "MetaTrader 5 Mobile Apps",
    href: "#downloads-mobile-apps",
    cta: "Get Mobile Apps",
    icon: Smartphone,
    description: "Trade on iOS, Android and Huawei devices with real-time quotes, alerts and push notifications.",
  },
  {
    title: "Launch Web Terminal",
    href: "https://trade.mql5.com/trade",
    cta: "Open WebTrader",
    icon: Globe,
    description: "Browser-based platform for instant access without installs. Ideal for quick checks and secure devices.",
  },
];

const qrCodes = [
  {
    title: "Download on the App Store",
      image:
      "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fapps.apple.com%2Fapp%2Fmetatrader-5%2Fid413251709",
    description: "Scan to install from App Store",
  },
  {
    title: "Get it on Google Play",
      image:
      "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dnet.metaquotes.metatrader5",
    description: "Scan to install from Google Play",
  },
  {
    title: "Explore it on AppGallery",
      image:
      "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fappgallery.huawei.com%2Fapp%2FC103801551",
    description: "Scan to install from Huawei AppGallery",
  },
];

export default function DownloadsSection() {
  const handleInternalScroll = (href: string) => {
    if (!href.startsWith("#")) return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="downloads"
      className="py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 cyber-grid opacity-[0.06]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>

      <div className="container mx-auto max-w-[1280px] relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trading Platform <span className="text-gradient-gold text-glow-gold">Downloads</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Install Binofox MetaTrader 5 across desktop, web, and mobile. Choose your device below or scan the QR codes to download instantly.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 max-w-7xl mx-auto">
          {downloadOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <Card className="glass-morphism-strong border border-primary/20 rounded-3xl p-6 flex flex-col gap-6 h-full shadow-[0_0_40px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_-5px_rgba(212,175,55,0.6)] transition-shadow duration-500">
                <div className="flex items-start justify-between gap-4 flex-1">
                  <div className="text-left space-y-2 flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-foreground leading-tight">{option.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30 flex-shrink-0 shadow-lg">
                    <option.icon />
                  </div>
                </div>
                <div className="flex justify-center">
                  {option.href.startsWith("http") || option.href.endsWith(".pkg.zip") || option.href.endsWith(".dmg") || option.href.endsWith(".exe") || option.href.endsWith(".tar.gz") ? (
                    <Button asChild className="neon-gold text-base font-semibold">
                      <a
                        href={option.href}
                        download={option.download || option.href.endsWith(".pkg.zip") || option.href.endsWith(".dmg") || option.href.endsWith(".exe") || option.href.endsWith(".tar.gz")}
                        // For direct installer files, open in the same tab to avoid popup blockers
                        target={
                          option.href.endsWith(".dmg") ||
                          option.href.endsWith(".tar.gz") ||
                          option.href.endsWith(".pkg.zip")
                            ? "_self"
                            : "_blank"
                        }
                        rel="noreferrer"
                      >
                        {option.cta}
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="neon-gold text-base font-semibold"
                      type="button"
                      onClick={() => handleInternalScroll(option.href)}
                    >
                      {option.cta}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          id="downloads-mobile-apps"
          className="mt-12 md:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gradient-gold text-glow-gold inline-block pb-2">
              Scan to Download Mobile Apps
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {qrCodes.map((qr, index) => (
              <motion.div
                key={qr.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -8 }}
              >
                <Card className="glass-morphism border border-primary/20 rounded-3xl p-6 flex flex-col gap-4 items-center text-center h-full shadow-[0_0_40px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_-5px_rgba(212,175,55,0.6)] transition-shadow duration-500">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold uppercase tracking-wider text-primary">
                    <QrCode className="w-4 h-4" />
                    {qr.title}
                  </div>
                  <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <img src={qr.image} alt={qr.description} className="w-36 h-36 object-contain" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {qr.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

