import React, { useRef, useEffect } from 'react';

interface ProjectsRoomCanvasProps {
  isActive: boolean;
}

export const ProjectsRoomCanvas: React.FC<ProjectsRoomCanvasProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const animFrameRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize and manage video playback
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/dancing_dancer_cropped.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    // Create offscreen canvas for high-performance chroma-keying
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 200;
    offCanvas.height = 190;
    offscreenCanvasRef.current = offCanvas;
    videoRef.current = video;

    if (isActive) {
      video.play().catch(() => {});
    }

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      videoRef.current = null;
      offscreenCanvasRef.current = null;
    };
  }, []);

  // Control play/pause based on section active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offCanvas?.getContext('2d', { willReadFrequently: true });
    const video = videoRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Camera State for Handheld & Zoom Simulation
    const cameraState = {
      zoom: 1.0,
      targetZoom: 1.0,
      zoomVelocity: 0,
      camX: 0,
      camY: 0,
      targetCamX: 0,
      targetCamY: 0,
      shakeAmp: 0,
      blur: 0,
      phase: 'wide' as 'wide' | 'zooming_in' | 'zoomed' | 'zooming_out',
      nextPhaseTime: performance.now() + 2800 + Math.random() * 2000,
    };

    let t = 0;

    const render = () => {
      const now = performance.now();
      t += 0.025;

      // Smooth lerp mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      // -------------------------------------------------------------
      // 1. Camera Director AI: Random Zoom-in / Zoom-out State Machine
      // -------------------------------------------------------------
      if (now >= cameraState.nextPhaseTime) {
        if (cameraState.phase === 'wide') {
          // Trigger sudden crash zoom in!
          cameraState.phase = 'zooming_in';
          // Random punchy focal length between 1.55x and 2.15x
          cameraState.targetZoom = 1.55 + Math.random() * 0.6;
          // Hold zoomed shot for 2.2 to 4.2 seconds
          cameraState.nextPhaseTime = now + 2200 + Math.random() * 2000;
        } else if (cameraState.phase === 'zoomed') {
          // Snap zoom back out to wide shot!
          cameraState.phase = 'zooming_out';
          cameraState.targetZoom = 1.0;
          // Hold wide shot for 3.5 to 6.0 seconds
          cameraState.nextPhaseTime = now + 3500 + Math.random() * 2500;
        }
      }

      // Smooth fast spring lerp for zoom
      const prevZoom = cameraState.zoom;
      const zoomDiff = cameraState.targetZoom - cameraState.zoom;
      cameraState.zoom += zoomDiff * 0.12;
      const zoomSpeed = Math.abs(cameraState.zoom - prevZoom);

      // Transition phase completions
      if (cameraState.phase === 'zooming_in' && Math.abs(zoomDiff) < 0.02) {
        cameraState.phase = 'zoomed';
      } else if (cameraState.phase === 'zooming_out' && Math.abs(zoomDiff) < 0.02) {
        cameraState.phase = 'wide';
      }

      // -------------------------------------------------------------
      // 2. Dynamic Zoom Shake & Optical Zoom Blur
      // -------------------------------------------------------------
      const isZooming = cameraState.phase === 'zooming_in' || cameraState.phase === 'zooming_out';
      const targetShakeAmp = isZooming ? Math.min(22, zoomSpeed * 180 + 8) : 0;
      cameraState.shakeAmp += (targetShakeAmp - cameraState.shakeAmp) * 0.28;

      // High-frequency mechanical camera hand vibration during zoom
      const zoomShakeX = cameraState.shakeAmp > 0.4 
        ? (Math.sin(t * 44) * 0.6 + (Math.random() - 0.5) * 0.8) * cameraState.shakeAmp 
        : 0;
      const zoomShakeY = cameraState.shakeAmp > 0.4 
        ? (Math.cos(t * 39) * 0.6 + (Math.random() - 0.5) * 0.8) * cameraState.shakeAmp 
        : 0;

      // Optical zoom streak blur during fast focal changes
      const targetBlur = Math.min(6.5, zoomSpeed * 110 + cameraState.shakeAmp * 0.18);
      cameraState.blur += (targetBlur - cameraState.blur) * 0.22;
      const currentBlur = cameraState.blur < 0.25 ? 0 : Number(cameraState.blur.toFixed(1));

      // -------------------------------------------------------------
      // 3. Realistic Handheld Camera Sway (Organic Jitter & Breathing)
      // -------------------------------------------------------------
      // Human postural sway + breathing + micro hand tremors
      const handheldX = Math.sin(t * 1.3) * 4.5 + Math.cos(t * 2.7) * 2.4 + Math.sin(t * 6.3) * 0.9;
      const handheldY = Math.cos(t * 1.1) * 3.6 + Math.sin(t * 2.1) * 1.8 + Math.cos(t * 5.7) * 0.8;
      const handheldRot = (Math.sin(t * 0.85) * 0.45 + Math.cos(t * 1.9) * 0.22) * (Math.PI / 180);
      const handheldBreathe = 1.0 + Math.sin(t * 0.75) * 0.008;

      const totalZoom = cameraState.zoom * handheldBreathe;

      // -------------------------------------------------------------
      // 4. Camera Framing & Target Tracking
      // -------------------------------------------------------------
      // Default horizon line at ~75% of height
      const tiltY = (mouseRef.current.y - 0.5) * 12;
      const horizonY = h * 0.75 + tiltY;

      // Dancer dimensions & position
      const dancerH = Math.min(135, Math.max(85, h * 0.16));
      const dancerW = dancerH * (200 / 190);
      const dancerBaseX = w * 0.5 - dancerW * 0.5 + (mouseRef.current.x - 0.5) * 22;
      const dancerFeetY = horizonY + dancerH * 0.20;
      const dancerY = dancerFeetY - dancerH;

      // When zoomed in, camera pans slightly towards the dancing figure
      const wideCamX = w * 0.5;
      const wideCamY = h * 0.58;
      const zoomedCamX = dancerBaseX + dancerW * 0.5;
      const zoomedCamY = dancerY + dancerH * 0.5;

      const zoomFactor = Math.max(0, Math.min(1, (cameraState.zoom - 1.0) / 0.8));
      cameraState.targetCamX = wideCamX + (zoomedCamX - wideCamX) * zoomFactor;
      cameraState.targetCamY = wideCamY + (zoomedCamY - wideCamY) * zoomFactor;

      cameraState.camX += (cameraState.targetCamX - cameraState.camX) * 0.12;
      cameraState.camY += (cameraState.targetCamY - cameraState.camY) * 0.12;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Apply dynamic optical zoom blur filter if moving fast
      if (currentBlur > 0) {
        ctx.filter = `blur(${currentBlur}px)`;
      } else {
        ctx.filter = 'none';
      }

      // Apply Handheld Cinema Camera Transform (Pivoted around optical center)
      ctx.translate(w * 0.5 + zoomShakeX + handheldX, h * 0.5 + zoomShakeY + handheldY);
      ctx.rotate(handheldRot);
      ctx.scale(totalZoom, totalZoom);
      ctx.translate(-cameraState.camX, -cameraState.camY);

      // Overscan padding to prevent background gaps during shake, tilt & zoom
      const overscan = Math.max(w, h) * 0.6;

      // 1. Red Room Ceiling & Upper Wall
      const wallGrad = ctx.createLinearGradient(0, -overscan, 0, horizonY);
      wallGrad.addColorStop(0, '#eb0000');
      wallGrad.addColorStop(0.6, '#ff0000');
      wallGrad.addColorStop(1, '#ff0000');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(-overscan, -overscan, w + overscan * 2, horizonY + overscan);

      // 2. Horizon Glow Seam
      const horizonGlow = ctx.createLinearGradient(0, horizonY - 14, 0, horizonY + 6);
      horizonGlow.addColorStop(0, 'rgba(255, 0, 0, 0)');
      horizonGlow.addColorStop(0.7, 'rgba(255, 190, 190, 0.75)');
      horizonGlow.addColorStop(1, 'rgba(255, 255, 255, 1)');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(-overscan, horizonY - 14, w + overscan * 2, 20);

      // 3. Glowing White Floor
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h + overscan);
      floorGrad.addColorStop(0, '#ffffff');
      floorGrad.addColorStop(0.4, '#ffffff');
      floorGrad.addColorStop(1, '#fcf0f0');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(-overscan, horizonY, w + overscan * 2, h - horizonY + overscan * 2);

      // 4. White Glowing Dancing Figure on Floor at a Distance
      if (video && offCanvas && offCtx && video.readyState >= 2 && !video.paused) {
        offCtx.drawImage(video, 0, 0, 200, 190);
        const imgData = offCtx.getImageData(0, 0, 200, 190);
        const data = imgData.data;
        const len = data.length;

        // Real-time chroma keying: remove green background and make dancer pure white
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (g > 125 && g - r > 28 && g - b > 28) {
            data[i + 3] = 0; // Transparent background
          } else {
            // Completely solid white
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
          }
        }
        offCtx.putImageData(imgData, 0, 0);

        ctx.save();
        // Radiant White Glow layers
        ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowBlur = 24;
        ctx.drawImage(offCanvas, dancerBaseX, dancerY, dancerW, dancerH);

        // Core bright pass
        ctx.shadowBlur = 8;
        ctx.drawImage(offCanvas, dancerBaseX, dancerY, dancerW, dancerH);

        // Soft white/crimson ambient contact glow puddle on the floor
        const puddleW = dancerW * 0.7;
        const contactGlow = ctx.createRadialGradient(
          dancerBaseX + dancerW * 0.5,
          dancerFeetY - 2,
          1,
          dancerBaseX + dancerW * 0.5,
          dancerFeetY - 2,
          puddleW * 0.55
        );
        contactGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        contactGlow.addColorStop(0.5, 'rgba(255, 210, 210, 0.4)');
        contactGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = contactGlow;
        ctx.beginPath();
        ctx.ellipse(dancerBaseX + dancerW * 0.5, dancerFeetY - 2, puddleW * 0.5, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

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
    <div className="w-full h-full relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-default select-none"
      />
    </div>
  );
};
