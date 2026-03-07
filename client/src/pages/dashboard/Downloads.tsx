import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Monitor, Smartphone, Tablet, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Downloads() {
  const downloads = [
    {
      id: "windows",
      title: "MT5 for Windows",
      description: "Download MetaTrader 5 for Windows desktop. Full-featured trading platform with advanced charting and analysis tools.",
      icon: Monitor,
      downloadUrl: "https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe",
      fileSize: "~50 MB",
      version: "Latest",
      features: ["Advanced charting", "Multiple timeframes", "Technical indicators", "Expert Advisors", "Mobile trading"],
    },
    {
      id: "android",
      title: "MT5 for Android",
      description: "Trade on the go with MetaTrader 5 for Android. Access your accounts, monitor markets, and execute trades from your mobile device.",
      icon: Smartphone,
      downloadUrl: "https://download.mql5.com/cdn/mobile/mt5/android.apk",
      fileSize: "~30 MB",
      version: "Latest",
      features: ["Mobile trading", "Real-time quotes", "Chart analysis", "Push notifications", "One-click trading"],
    },
    {
      id: "ios",
      title: "MT5 for iOS",
      description: "MetaTrader 5 for iPhone and iPad. Professional trading platform optimized for iOS devices with intuitive interface.",
      icon: Tablet,
      downloadUrl: "https://apps.apple.com/app/metatrader-5/id413251709",
      fileSize: "~40 MB",
      version: "Latest",
      features: ["iOS optimized", "Touch-friendly", "Secure trading", "Real-time data", "Portfolio management"],
    },
  ];

  const handleDownload = (url: string, title: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Downloads
        </h1>
        <p className="text-muted-foreground">
          Download MetaTrader 5 for your preferred platform and start trading
        </p>
      </motion.div>

      {/* Download Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloads.map((download, index) => (
          <motion.div
            key={download.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl overflow-hidden hover:border-primary/50 transition-all group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <download.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-foreground mb-2">{download.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{download.description}</p>

                {/* Info */}
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <span>Size: {download.fileSize}</span>
                  <span>•</span>
                  <span>Version: {download.version}</span>
                </div>

                {/* Features */}
                <div className="mb-4 space-y-2">
                  {download.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Download Button */}
                <Button
                  onClick={() => handleDownload(download.downloadUrl, download.title)}
                  className="bg-gradient-to-r from-primary via-primary/95 to-primary hover:from-primary/90 hover:via-primary/85 hover:to-primary/90 text-black font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Now
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 border-primary/20 bg-black/40">
          <h3 className="text-lg font-semibold text-foreground mb-3">System Requirements</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Windows</h4>
              <ul className="space-y-1">
                <li>• Windows 7 or later</li>
                <li>• 1 GB RAM minimum</li>
                <li>• 100 MB free disk space</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Android</h4>
              <ul className="space-y-1">
                <li>• Android 5.0 or later</li>
                <li>• 50 MB free space</li>
                <li>• Internet connection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">iOS</h4>
              <ul className="space-y-1">
                <li>• iOS 12.0 or later</li>
                <li>• iPhone/iPad compatible</li>
                <li>• Internet connection</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

