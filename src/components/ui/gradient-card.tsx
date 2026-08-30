import React, { useRef, useState, useImperativeHandle } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "relative flex flex-col justify-between h-full w-full overflow-hidden rounded-2xl p-6 transition-all duration-300 select-none",
  {
    variants: {
      gradient: {
        orange: "bg-gradient-to-br from-orange-100 to-amber-200/50 text-slate-900",
        gray: "bg-gradient-to-br from-slate-100 to-slate-200/50 text-slate-900",
        purple: "bg-gradient-to-br from-purple-100 to-indigo-200/50 text-slate-900",
        green: "bg-gradient-to-br from-emerald-100 to-teal-200/50 text-slate-900",
        darkOrange: "bg-gradient-to-br from-[#20242D] via-[#2A1E17] to-[#20242D] border border-amber-500/40 text-white shadow-amber-900/10",
        darkBlue: "bg-gradient-to-br from-[#20242D] via-[#16243E] to-[#20242D] border border-indigo-400/40 text-white shadow-indigo-900/10",
        darkTeal: "bg-gradient-to-br from-[#20242D] via-[#14292B] to-[#20242D] border border-teal-500/40 text-white shadow-teal-900/10",
        darkRed: "bg-gradient-to-br from-[#20242D] via-[#2D1B1B] to-[#20242D] border border-red-500/40 text-white shadow-red-900/10",
      },
    },
    defaultVariants: {
      gradient: "darkOrange",
    },
  }
);

export interface GradientCardProps
  extends Omit<HTMLMotionProps<"div">, "gradient" | "children">,
    VariantProps<typeof cardVariants> {
  children?: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  imageUrl?: string;
  glowColor?: "red" | "amber" | "teal" | "blue" | "purple";
  enable3dTilt?: boolean;
}

const GLOW_CONFIG = {
  red: {
    primary: "rgba(176, 58, 46, 0.7)",
    secondary: "rgba(239, 68, 68, 0.6)",
    glowBox: "0 0 25px 4px rgba(176, 58, 46, 0.8), 0 0 35px 6px rgba(239, 68, 68, 0.5)",
  },
  amber: {
    primary: "rgba(217, 119, 6, 0.7)",
    secondary: "rgba(245, 158, 11, 0.6)",
    glowBox: "0 0 25px 4px rgba(217, 119, 6, 0.8), 0 0 35px 6px rgba(245, 158, 11, 0.5)",
  },
  teal: {
    primary: "rgba(14, 124, 123, 0.7)",
    secondary: "rgba(20, 184, 166, 0.6)",
    glowBox: "0 0 25px 4px rgba(14, 124, 123, 0.8), 0 0 35px 6px rgba(20, 184, 166, 0.5)",
  },
  blue: {
    primary: "rgba(79, 70, 229, 0.7)",
    secondary: "rgba(56, 189, 248, 0.6)",
    glowBox: "0 0 25px 4px rgba(79, 70, 229, 0.8), 0 0 35px 6px rgba(56, 189, 248, 0.5)",
  },
  purple: {
    primary: "rgba(161, 58, 229, 0.7)",
    secondary: "rgba(138, 58, 185, 0.6)",
    glowBox: "0 0 25px 4px rgba(161, 58, 229, 0.8), 0 0 35px 6px rgba(138, 58, 185, 0.5)",
  },
};

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  (
    {
      className,
      gradient = "darkOrange",
      badgeText,
      badgeColor = "#F59E0B",
      title,
      description,
      ctaText,
      ctaHref,
      imageUrl,
      glowColor = "amber",
      enable3dTilt = true,
      children,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

    const [isHovered, setIsHovered] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const glow = GLOW_CONFIG[glowColor] || GLOW_CONFIG.amber;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onMouseMove) onMouseMove(e);
      if (!enable3dTilt) return;
      const target = cardRef.current;
      if (target) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = -(y / rect.height) * 6; // Max 6 deg rotation
        const rotateY = (x / rect.width) * 6;

        setRotation({ x: rotateX, y: rotateY });
      }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onMouseEnter) onMouseEnter(e);
      setIsHovered(true);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onMouseLeave) onMouseLeave(e);
      setIsHovered(false);
      setRotation({ x: 0, y: 0 });
    };

    return (
      <motion.div
        ref={cardRef}
        className={cn("relative group rounded-2xl overflow-hidden cursor-pointer", className)}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? `${glow.glowBox}, 0 10px 30px -5px rgba(0,0,0,0.5)`
            : "0 4px 15px -2px rgba(0, 0, 0, 0.3)",
        }}
        initial={{ y: 0 }}
        animate={{
          y: isHovered ? -4 : 0,
          rotateX: rotation.x,
          rotateY: rotation.y,
          perspective: 1000,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 22,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {/* Subtle glass reflection overlay */}
        <motion.div
          className="absolute inset-0 z-35 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(2px)",
          }}
          animate={{
            opacity: isHovered ? 0.7 : 0.4,
            rotateX: -rotation.x * 0.2,
            rotateY: -rotation.y * 0.2,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Base card container styling */}
        <div className={cn(cardVariants({ gradient }), "h-full w-full relative z-10")}>
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay z-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Glowing bottom gradient backlight */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1/2 z-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at bottom, ${glow.primary} -20%, transparent 75%)`,
              filter: "blur(25px)",
            }}
            animate={{
              opacity: isHovered ? 0.85 : 0.45,
              y: isHovered ? rotation.x * 0.3 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Bottom Glowing Border Highlight */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] z-20 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${glow.secondary} 50%, transparent 100%)`,
            }}
            animate={{
              opacity: isHovered ? 1 : 0.6,
              boxShadow: isHovered ? glow.glowBox : "none",
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Decorative background image */}
          {imageUrl && (
            <motion.img
              src={imageUrl}
              alt={`${title || "card"} background graphic`}
              className="absolute -right-1/4 -bottom-1/4 w-3/4 opacity-80 pointer-events-none dark:opacity-30"
              animate={{
                scale: isHovered ? 1.08 : 1,
                rotate: isHovered ? 2 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          )}

          {/* Card content wrapper */}
          <div className="relative z-30 flex flex-col h-full">
            {children ? (
              children
            ) : (
              <div className="flex flex-col h-full justify-between">
                <div>
                  {badgeText && (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/30 dark:bg-white/10 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md w-fit border border-white/15">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: badgeColor }}
                      />
                      {badgeText}
                    </div>
                  )}

                  {title && (
                    <h3 className="text-xl font-headline font-bold text-white mb-2 tracking-tight">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
                  )}
                </div>

                {ctaText && ctaHref && (
                  <a
                    href={ctaHref}
                    className="group mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white hover:text-amber-400 transition-colors"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

GradientCard.displayName = "GradientCard";

export { GradientCard, cardVariants };
