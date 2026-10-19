import React, { useRef, useEffect } from 'react';

interface HomeTunnelCanvasProps {
  isActive: boolean;
}

export const HomeTunnelCanvas: React.FC<HomeTunnelCanvasProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let t = 0;

    const render = () => {
      t += 0.035;
      // Smooth lerp mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Vanishing point influenced by mouse
      const vx = w * 0.5 + (mouseRef.current.x - 0.5) * (w * 0.12);
      const vy = h * 0.50 + (mouseRef.current.y - 0.5) * (h * 0.10);

      // Tunnel dimensions matching Roman's site
      const innerW = w * 0.28;
      const innerH = h * 0.22;
      const x0 = vx - innerW * 0.5;
      const y0 = vy - innerH * 0.5;
      const x1 = vx + innerW * 0.5;
      const y1 = vy + innerH * 0.5;

      // 1. Perspective Walls
      // Ceiling (Top)
      const gradTop = ctx.createLinearGradient(w * 0.5, 0, vx, y0);
      gradTop.addColorStop(0, '#0a0000');
      gradTop.addColorStop(0.5, '#450000');
      gradTop.addColorStop(1, '#ff0000');
      ctx.fillStyle = gradTop;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(x1, y0);
      ctx.lineTo(x0, y0);
      ctx.closePath();
      ctx.fill();

      // Floor (Bottom)
      const gradBottom = ctx.createLinearGradient(w * 0.5, h, vx, y1);
      gradBottom.addColorStop(0, '#0d0000');
      gradBottom.addColorStop(0.5, '#550000');
      gradBottom.addColorStop(1, '#ff0000');
      ctx.fillStyle = gradBottom;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, h);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x0, y1);
      ctx.closePath();
      ctx.fill();

      // Left Wall
      const gradLeft = ctx.createLinearGradient(0, h * 0.5, x0, vy);
      gradLeft.addColorStop(0, '#080000');
      gradLeft.addColorStop(0.5, '#4a0000');
      gradLeft.addColorStop(1, '#ff0000');
      ctx.fillStyle = gradLeft;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x0, y0);
      ctx.lineTo(x0, y1);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Right Wall
      const gradRight = ctx.createLinearGradient(w, h * 0.5, x1, vy);
      gradRight.addColorStop(0, '#080000');
      gradRight.addColorStop(0.5, '#4a0000');
      gradRight.addColorStop(1, '#ff0000');
      ctx.fillStyle = gradRight;
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(x1, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // 2. Center Glowing Back Wall
      const gradCenter = ctx.createRadialGradient(
        vx,
        vy,
        innerH * 0.1,
        vx,
        vy,
        innerW * 0.65
      );
      gradCenter.addColorStop(0, '#ff1a1a');
      gradCenter.addColorStop(0.5, '#f50000');
      gradCenter.addColorStop(0.9, '#c40000');
      gradCenter.addColorStop(1, '#8b0000');
      ctx.fillStyle = gradCenter;
      ctx.fillRect(x0, y0, innerW, innerH);

      // Atmospheric red glow bloom in center
      const bloom = ctx.createRadialGradient(vx, vy, 5, vx, vy, innerW * 1.1);
      bloom.addColorStop(0, 'rgba(255, 60, 60, 0.4)');
      bloom.addColorStop(0.4, 'rgba(255, 0, 0, 0.18)');
      bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);



      // 4. Subtle Outer Vignette around tunnel edges to blend into black
      const vigGrad = ctx.createLinearGradient(0, 0, 0, h);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
      vigGrad.addColorStop(0.12, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(0.88, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  return (
    <div className="w-full h-[64vh] min-h-[320px] relative overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-default select-none"
      />
    </div>
  );
};
