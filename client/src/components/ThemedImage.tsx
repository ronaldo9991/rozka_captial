import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemedImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: "gold" | "black" | "gradient" | "none";
  glow?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  aspectRatio?: "square" | "video" | "wide" | "tall" | "auto";
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill";
}

export default function ThemedImage({
  src,
  alt,
  className,
  overlay = "gradient",
  glow = true,
  rounded = "xl",
  aspectRatio = "auto",
  priority = false,
  objectFit = "cover",
}: ThemedImageProps) {
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    tall: "aspect-[9/16]",
    auto: "",
  };

  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const overlayClasses = {
    gold: "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
    black: "bg-gradient-to-br from-black/60 via-black/40 to-transparent",
    gradient: "bg-gradient-to-br from-black/50 via-primary/20 to-transparent",
    none: "",
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden",
        aspectRatioClasses[aspectRatio],
        roundedClasses[rounded],
        glow && "shadow-[0_0_30px_rgba(212,175,55,0.25),0_0_60px_rgba(212,175,55,0.15)]",
        className
      )}
      whileHover={glow ? { scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full transition-transform duration-700 ease-out",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          glow && "hover:scale-110"
        )}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
      {overlay !== "none" && (
        <div className={cn("absolute inset-0", overlayClasses[overlay])} />
      )}
      {glow && (
        <div className="absolute inset-0 border border-primary/20 pointer-events-none" />
      )}
    </motion.div>
  );
}


