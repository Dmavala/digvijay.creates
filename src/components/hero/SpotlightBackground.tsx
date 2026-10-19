import React, { useEffect, useState } from 'react';

export const SpotlightBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 15 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position for subtle spotlight tracking
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({
        x: 45 + (x - 50) * 0.1, // Subtle dampened shift
        y: 10 + (y - 50) * 0.08,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Base Dark Concrete/Slate Surface */}
      <div className="absolute inset-0 bg-[#141518]" />

      {/* Blueprint Wall Grid */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-60" />

      {/* Dynamic Overhead Studio Spotlight */}
      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(ellipse 70% 60% at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 35%, rgba(18, 19, 23, 0.7) 65%, rgba(12, 13, 15, 0.98) 100%)`,
        }}
      />

      {/* Overhead Spotlight Fixture Glow Source */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-white/15 blur-3xl rounded-full"
      />

      {/* Fine Stipple / Film Grain Overlay */}
      <div className="absolute inset-0 stipple-texture opacity-35 mix-blend-overlay" />

      {/* Vignette Edge Shading */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
    </div>
  );
};
