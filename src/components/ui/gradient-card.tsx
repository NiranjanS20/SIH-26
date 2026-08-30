import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export interface GradientCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientColor1?: string;
  gradientColor2?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className = "",
  gradientColor1 = "rgba(0, 36, 82, 0.4)",
  gradientColor2 = "rgba(245, 158, 11, 0.35)",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Handle mouse movement for subtle 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Max 4 degrees tilt for executive elegance
      const rotateX = -(y / rect.height) * 4;
      const rotateY = (x / rect.width) * 4;

      setRotation({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full">
      <motion.div
        ref={cardRef}
        className={`relative rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md border border-[#C4C6D0]/60 shadow-xl ${className}`}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? "0 20px 40px -10px rgba(0, 36, 82, 0.15), 0 0 25px 2px rgba(245, 158, 11, 0.15)"
            : "0 10px 30px -10px rgba(0, 36, 82, 0.08)",
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
          damping: 25,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Top Gradient Highlight Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#002452] via-[#1B3A6B] to-[#F59E0B] z-30" />

        {/* Ambient Gradient Glow at Bottom/Sides */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 transition-opacity duration-500"
          style={{
            background: `
              radial-gradient(ellipse at bottom right, ${gradientColor2} 0%, transparent 65%),
              radial-gradient(ellipse at bottom left, ${gradientColor1} 0%, transparent 65%)
            `,
            filter: "blur(30px)",
          }}
          animate={{
            opacity: isHovered ? 0.75 : 0.45,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Subtle Glass Reflection Overlay */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 70%, rgba(245,158,11,0.08) 100%)",
          }}
          animate={{
            opacity: isHovered ? 0.8 : 0.5,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Card Content Container */}
        <div className="relative z-20">{children}</div>
      </motion.div>
    </div>
  );
};
