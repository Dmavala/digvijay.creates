import React, { useEffect, useRef } from 'react';

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smoothing
    let mouse = { x: width * 0.5, y: height * 0.35, targetX: width * 0.5, targetY: height * 0.35 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Floating glowing orbs
    const orbs = [
      { x: width * 0.45, y: height * 0.3, radius: 280, color: 'rgba(99, 102, 241, 0.12)', vx: 0.2, vy: 0.15 },
      { x: width * 0.55, y: height * 0.4, radius: 240, color: 'rgba(168, 85, 247, 0.08)', vx: -0.15, vy: 0.2 },
      { x: width * 0.5, y: height * 0.2, radius: 200, color: 'rgba(56, 189, 248, 0.06)', vx: 0.1, vy: -0.12 },
    ];

    const render = () => {
      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Render orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce within boundaries
        if (orb.x < width * 0.2 || orb.x > width * 0.8) orb.vx *= -1;
        if (orb.y < height * 0.1 || orb.y > height * 0.6) orb.vy *= -1;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(8, 8, 10, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Interactive mouse highlight glow
      const mouseGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        320
      );
      mouseGrad.addColorStop(0, 'rgba(129, 140, 248, 0.09)');
      mouseGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)');
      mouseGrad.addColorStop(1, 'rgba(8, 8, 10, 0)');

      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 320, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Delicate Architectural Grid Overlay */}
      <div 
        className="absolute inset-0 bg-grid-subtle opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
      />
    </div>
  );
};
