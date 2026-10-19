"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const vertexShaderGLSL = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderGLSL = `
precision highp float;
varying vec2 vUv;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_grain;
uniform vec3  u_colors[3];

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float ratio = u_resolution.x / u_resolution.y;
  vec2 p = uv * vec2(ratio, 1.0);
  float t = u_time * 0.2;

  float n1 = snoise(p * 0.5 + t);
  float n2 = snoise(p * 0.9 - t * 0.5 + n1);
  
  float light = pow(abs(n2), 2.5) * 0.5; 

  vec3 col = vec3(0.02, 0.01, 0.01); 

  col += u_colors[0] * smoothstep(0.1, 1.0, n1) * 0.5;
  col += u_colors[1] * light;

  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
  col += (grain - 0.5) * u_grain * 0.5;

  float dist = length(uv - 0.5);
  col *= smoothstep(1.2, 0.2, dist);

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface AuralisProps {
  colors?: string[];
  speed?: number;
  grain?: number;
  height?: string;
  className?: string;
  interactive?: boolean;
}

const DEFAULT_COLORS = ["#ef4444", "#dc2626", "#b91c1c"];

const Auralis = ({
  colors = DEFAULT_COLORS,
  speed = 0.3,
  grain = 0.6,
  height = "100vh",
  className,
  interactive = false,
}: AuralisProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const colorsRef = useRef(colors);
  colorsRef.current = colors;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const grainRef = useRef(grain);
  grainRef.current = grain;

  const currentSpeedRef = useRef(speed);
  const currentGrainRef = useRef(grain);

  const hexToRgb = (hex: string): [number, number, number] => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) return;

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderGLSL));
    gl.attachShader(
      program,
      createShader(gl.FRAGMENT_SHADER, fragmentShaderGLSL),
    );
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const locs = {
      res: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      grain: gl.getUniformLocation(program, "u_grain"),
      colors: gl.getUniformLocation(program, "u_colors"),
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = container.getBoundingClientRect();
      const w = container.clientWidth || rect.width || window.innerWidth * 0.5;
      const h = container.clientHeight || rect.height || window.innerHeight;
      if (w > 0 && h > 0) {
        const targetW = Math.floor(w * dpr);
        const targetH = Math.floor(h * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
          gl.viewport(0, 0, targetW, targetH);
        }
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastMouseTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastMouseTime);
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mouseSpeed = dist / dt;

      currentSpeedRef.current = Math.min(2.8, currentSpeedRef.current + mouseSpeed * 0.12);
      currentGrainRef.current = Math.min(1.0, currentGrainRef.current + mouseSpeed * 0.04);

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      lastMouseTime = now;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!interactive) return;
      const wheelIntensity = Math.min(2.0, Math.abs(e.deltaY) * 0.005);
      currentSpeedRef.current = Math.min(3.2, currentSpeedRef.current + wheelIntensity * 0.7);
      currentGrainRef.current = Math.min(1.0, currentGrainRef.current + wheelIntensity * 0.15);
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("wheel", handleWheel, { passive: true });
    }

    let raf: number;
    let accumulatedTime = 0;
    let lastFrameTime = performance.now();

    const render = (now: number) => {
      resize();
      const dt = (now - lastFrameTime) * 0.001;
      lastFrameTime = now;

      // Smoothly ease interactive speed and grain back to target
      currentSpeedRef.current += (speedRef.current - currentSpeedRef.current) * 0.06;
      currentGrainRef.current += (grainRef.current - currentGrainRef.current) * 0.06;

      accumulatedTime += dt * currentSpeedRef.current;

      gl.uniform2f(locs.res, canvas.width, canvas.height);
      gl.uniform1f(locs.time, accumulatedTime);
      gl.uniform1f(locs.grain, currentGrainRef.current);

      const flat = new Float32Array(colorsRef.current.slice(0, 3).flatMap(hexToRgb));
      gl.uniform3fv(locs.colors, flat);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      ro.disconnect();
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("wheel", handleWheel);
      }
      cancelAnimationFrame(raf);
      gl.deleteProgram(program);
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={cn("relative w-full overflow-hidden bg-[#010103]", className)}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center" />
    </div>
  );
};

export default Auralis;
