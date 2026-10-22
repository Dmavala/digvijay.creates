import React, { useEffect, useRef, useState } from 'react';
import { HERO_CLIPS } from '../../data/heroClips';
import { reelAudio } from '../../lib/reelAudio';
import Switch from '@/components/ui/switch';

interface FilmReelCanvasProps {
  isActive: boolean;
  isMuted?: boolean;
  isZoomed?: boolean;
  onZoomIn?: (clipIndex?: number) => void;
  onZoomOut?: () => void;
  onNavigateNext?: () => void;
}

/* ============================================================
   3D FILM REEL SPLINE CONSTANTS
   ============================================================ */
const CAM_DIST_NORMAL = 6.3;
const CAM_DIST_ZOOM = 1.38;
const CAM_TARGET_NORMAL = [0.35, -0.26, -0.6];
const PAD = 5; // blank leader frames before/after the clips
const ROUTE = [
  [-8, -4.4, 1.4],
  [-4, -2.7, 0.9],
  [-1.4, -1.3, 0.5],
  [0.6, -0.55, 0.1],
  [1.9, 0.3, -0.9],
  [2.3, 1.3, -2.6],
  [1.2, 2.0, -4.6],
  [-1.2, 2.4, -6.6],
  [-3.6, 3.0, -8.8],
  [-6.5, 4.0, -11],
];
const SMOOTH = 0.08;
const BLUR = 1.0;
const NEAR = 0.1;
const FAR = 80;
const FOV = (35 * Math.PI) / 180;
const SEG = 20;
const PITCH = 1.086;
const DS = 0.02;

/* ============================================================
   3D VECTOR & MATRIX MATH HELPERS
   ============================================================ */
const sub = (a: number[], b: number[]): number[] => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: number[], b: number[]): number[] => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: number[], k: number): number[] => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: number[], b: number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: number[], b: number[]): number[] => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: number[]): number[] => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const lerp3 = (a: number[], b: number[], t: number): number[] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const clamp = (x: number, a: number, b: number): number => Math.min(Math.max(x, a), b);

const persp = (f: number, a: number, n: number, fa: number): number[] => {
  const t = 1 / Math.tan(f / 2);
  const nf = 1 / (n - fa);
  return [
    t / a, 0, 0, 0,
    0, t, 0, 0,
    0, 0, (fa + n) * nf, -1,
    0, 0, 2 * fa * n * nf, 0,
  ];
};

const look = (e: number[], c: number[], u: number[]): number[] => {
  const z = norm(sub(e, c));
  const x = norm(cross(u, z));
  const y = cross(z, x);
  return [
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, e), -dot(y, e), -dot(z, e), 1,
  ];
};

const mmul = (a: number[], b: number[]): number[] => {
  const o = new Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
      o[i * 4 + j] = s;
    }
  }
  return o;
};

/* ============================================================
   ROUTE CALCULATION
   ============================================================ */
interface SplineSample {
  p: number[];
  b: number[];
  t: number[];
}

let P: number[][] = [];
let T: number[][] = [];
let Bv: number[][] = [];
let PLEN = 0;
let FOCUS_S = 0;

function buildRoute() {
  if (P.length > 0) return;
  const C = [ROUTE[0], ...ROUTE, ROUTE[ROUTE.length - 1]];
  const dense: number[][] = [];
  for (let i = 1; i < C.length - 2; i++) {
    for (let k = 0; k < 40; k++) {
      const t = k / 40;
      const o = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        const a = C[i - 1][c],
          b = C[i][c],
          d = C[i + 1][c],
          e = C[i + 2][c];
        o[c] = 0.5 * (2 * b + (-a + d) * t + (2 * a - 5 * b + 4 * d - e) * t * t + (-a + 3 * b - 3 * d + e) * t * t * t);
      }
      dense.push(o);
    }
  }
  dense.push(ROUTE[ROUTE.length - 1]);
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(...sub(dense[i], dense[i - 1])));
  PLEN = cum[cum.length - 1];
  const M = Math.floor(PLEN / DS);
  for (let k = 0, j = 0; k <= M; k++) {
    const s = k * DS;
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    P.push(lerp3(dense[j], dense[j + 1], (s - cum[j]) / (cum[j + 1] - cum[j] || 1)));
  }
  for (let k = 0; k < P.length; k++) T.push(norm(sub(P[Math.min(k + 1, P.length - 1)], P[Math.max(k - 1, 0)])));
  let fs = 0;
  for (let k = 0; k < P.length; k++) {
    if (P[k][0] >= 0) {
      fs = k * DS;
      break;
    }
  }
  let B = norm(cross([0, 0, 1], T[0]));
  for (let k = 0; k < P.length; k++) {
    B = norm(sub(B, mul(T[k], dot(B, T[k]))));
    const s = k * DS;
    const th = 1.15 * Math.exp(-Math.pow((s - (fs + 3.6)) / 1.5, 2));
    Bv.push(add(mul(B, Math.cos(th)), mul(cross(T[k], B), Math.sin(th))));
  }

  for (let k = 0; k < P.length; k++) {
    if (P[k][0] >= 0) {
      FOCUS_S = k * DS;
      break;
    }
  }
}
buildRoute();

function at(s: number): SplineSample {
  const f = clamp(s / DS, 0, P.length - 1.001);
  const i = f | 0;
  const t = f - i;
  return {
    p: lerp3(P[i], P[i + 1], t),
    b: norm(lerp3(Bv[i], Bv[i + 1], t)),
    t: norm(lerp3(T[i], T[i + 1], t)),
  };
}

/* ============================================================
   WEBGL2 SHADERS
   ============================================================ */
const FS_TRI = `#version 300 es
void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2)); gl_Position=vec4(p*2.-1.,0.,1.); }`;

const FS_BG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uShift;
uniform float uTheme;
out vec4 o;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes + uShift;
  float asp = uRes.x / uRes.y;
  vec2 q = (uv - vec2(.36, .30)) * vec2(asp > 1. ? 1. : 1., 1.);
  q.x *= min(asp, 1.4);
  float d = length(q * vec2(1.0, 1.25));

  vec3 cBlue = mix(vec3(.95, .96, .90), vec3(.66, .79, .86), smoothstep(0., .32, d));
  cBlue = mix(cBlue, vec3(.36, .50, .63), smoothstep(.25, .75, d));
  cBlue = mix(cBlue, vec3(.16, .25, .36), smoothstep(.65, 1.2, d));

  vec3 cRed = mix(vec3(.95, .20, .22), vec3(.68, .04, .06), smoothstep(0., .32, d));
  cRed = mix(cRed, vec3(.26, .01, .02), smoothstep(.25, .75, d));
  cRed = mix(cRed, vec3(.04, .00, .01), smoothstep(.65, 1.2, d));

  vec3 c = mix(cBlue, cRed, uTheme);
  o = vec4(c, 1.);
}`;

const VS_FILM = `#version 300 es
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
layout(location=2) in vec3 aUV;
uniform mat4 uVP;
out vec3 vN;
out vec3 vW;
out vec3 vUV;
void main(){
  vN = aN;
  vW = aP;
  vUV = aUV;
  gl_Position = uVP * vec4(aP, 1.);
}`;

const FS_FILM = `#version 300 es
precision highp float;
in vec3 vN;
in vec3 vW;
in vec3 vUV;
uniform sampler2D uVid;
uniform sampler2D uEdge;
uniform vec3 uCam;
uniform float uLen;
uniform float uBlank;
out vec4 o;
const float PITCH = 1.086;

float rbox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r;
}

void main(){
  float u = vUV.x, v = vUV.y, x = u * PITCH, y = v;
  float aa = max(fwidth(x), fwidth(y)) * 1.2 + 1e-4;
  vec3 N = normalize(vN);
  if(!gl_FrontFacing) N = -N;
  vec3 V = normalize(uCam - vW);
  vec3 L = normalize(vec3(.3, .6, .75));
  float fr = pow(1. - abs(dot(N, V)), 2.2);
  float ndl = abs(dot(N, L));

  float hx = (fract(u * 8.) - .5) * (PITCH / 8.);
  float hy = min(y, 1. - y) - .075;
  float hole = smoothstep(aa, -aa, rbox(vec2(hx, hy), vec2(.036, .040), .012));

  float win = smoothstep(-aa, aa, min(min(x - .022, PITCH - x - .022), min(y - .17, .83 - y)));
  vec2 wuv = vec2((x - .022) / (PITCH - .044), (y - .17) / .66);
  vec3 pic = texture(uVid, clamp(wuv, 0., 1.)).rgb;

  vec3 col = vec3(.035, .04, .05) * (.7 + 1.5 * ndl * ndl) + vec3(.10, .13, .16) * fr * .5;

  float vb = v < .5 ? v : 1. - v;
  float uu = v < .5 ? u : 1. - u;
  if(vb > .118 && vb < .165){
    vec4 t = texture(uEdge, vec2(uu, (vb - .118) / .047));
    col = mix(col, vec3(.93, .66, .22), t.a);
  }

  col = mix(col, pic * (.92 + .1 * ndl) + vec3(.8, .9, 1.) * fr * (.18 + .5 * uBlank), win);

  float a = mix(.97, mix(.92, .09, uBlank), win) + fr * (.05 + .4 * uBlank * win);
  a *= 1. - hole;
  a *= smoothstep(0., 1.5, vUV.z) * smoothstep(0., 1.5, uLen - vUV.z);
  if(a < .02) discard;
  o = vec4(col, a);
}`;

const FS_DOF = `#version 300 es
precision highp float;
uniform sampler2D uC;
uniform sampler2D uD;
uniform vec2 uRes;
uniform float uNear, uFar, uFocus, uA, uMax, uBg, uTime;
uniform float uMotionBlur;
uniform vec2 uZoomCenter;
out vec4 o;

float lin(float z){
  float n = 2. * z - 1.;
  return 2. * uNear * uFar / (uFar + uNear - n * (uFar - uNear));
}

float coc(vec2 uv){
  float z = texture(uD, uv).r;
  if(z > .9999) return uBg;
  return min(uMax, uA * abs(1. / uFocus - 1. / lin(z)));
}

float ign(vec2 p){
  return fract(52.9829189 * fract(dot(p, vec2(.06711056, .00583715))));
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float c0 = coc(uv);
  vec3 acc = texture(uC, uv).rgb;
  float ws = 1.;
  float rot = ign(gl_FragCoord.xy) * 6.2831;

  // Optimized Bokeh loop (18 taps with Poisson/golden angle jitter)
  if(c0 > .6){
    for(int i = 0; i < 18; i++){
      float r = sqrt((float(i) + .5) / 18.) * c0;
      float a = float(i) * 2.39996 + rot;
      vec2 off = vec2(cos(a), sin(a)) * r;
      vec2 s = uv + off / uRes;
      acc += texture(uC, s).rgb;
      ws += 1.0;
    }
  }

  vec3 c = acc / ws;

  // Cinematic Radial Motion Blur on Zoom In (Optimized 8 taps)
  if(uMotionBlur > 0.001){
    vec2 dir = uv - uZoomCenter;
    float dist = length(dir);
    vec2 blurVec = dir * uMotionBlur * (0.35 + dist * 0.75);
    float nRot = ign(gl_FragCoord.xy + uTime);
    vec3 blurCol = vec3(0.);
    float blurWeight = 0.;

    for(int j = 0; j < 8; j++){
      float t = (float(j) + nRot) / 8.;
      vec2 uvS = uv - blurVec * t;
      vec3 sampleCol = texture(uC, clamp(uvS, 0., 1.)).rgb;
      float w = 1. - t * 0.45;
      blurCol += sampleCol * w;
      blurWeight += w;
    }
    vec3 zoomedCol = blurCol / max(blurWeight, 0.001);
    c = mix(c, zoomedCol, clamp(uMotionBlur * 5.0, 0., 1.));
  }

  vec2 q = uv - .5;
  c *= 1. - .35 * smoothstep(.3, .95, length(q * vec2(1., 1.1)));
  c += (ign(gl_FragCoord.xy + uTime) - .5) * .022;
  o = vec4(c, 1.);
}`;

export const FilmReelCanvas: React.FC<FilmReelCanvasProps> = ({
  isActive,
  isMuted = true,
  isZoomed = false,
  onZoomIn,
  onZoomOut,
  onNavigateNext,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isRedTheme, setIsRedTheme] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadedClipsCount, setLoadedClipsCount] = useState(0);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);

  // Mobile Lightbox Modal Player States
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  const isMutedRef = useRef(isMuted);
  const isActiveRef = useRef(isActive);
  const isRedThemeRef = useRef(isRedTheme);
  const isZoomedRef = useRef(isZoomed);
  const zoomFactorRef = useRef(isZoomed ? 1.0 : 0.0);
  const resumeLoopRef = useRef<() => void>(() => {});

  const onZoomInRef = useRef(onZoomIn);
  const onZoomOutRef = useRef(onZoomOut);
  const onNavigateNextRef = useRef(onNavigateNext);

  const hasMountedRef = useRef(false);

  // Lock body scroll and toggle is-reel-zoomed on mobile while the expanded reel view is open
  useEffect(() => {
    if (isZoomed) {
      document.body.classList.add('is-reel-zoomed');
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.classList.remove('is-reel-zoomed');
        document.body.style.overflow = prevOverflow;
      };
    } else {
      document.body.classList.remove('is-reel-zoomed');
    }
  }, [isZoomed]);

  // Sync modal video playback and event listeners on mobile
  useEffect(() => {
    const v = modalVideoRef.current;
    if (!v) return;

    if (!isZoomed) {
      if (!v.paused) {
        v.pause();
        setIsPlaying(false);
      }
      return;
    }

    const clip = HERO_CLIPS[activeClipIndex];
    if (clip && v.src !== clip.src && !v.src.endsWith(clip.src)) {
      v.src = clip.src;
      try {
        v.currentTime = 0;
      } catch {}
    }
    v.playsInline = true;
    v.setAttribute('playsinline', 'true');
    v.setAttribute('webkit-playsinline', 'true');

    const tryPlay = () => {
      if (!v.paused) {
        setIsPlaying(true);
        return;
      }
      const p = v.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true))
          .catch(() => {
            // Guarantee playback by falling back to muted if unmuted audio was blocked
            v.muted = true;
            v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          });
      }
    };

    tryPlay();
    v.addEventListener('loadeddata', tryPlay);
    v.addEventListener('canplay', tryPlay);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (v.duration) {
        setVideoProgress((v.currentTime / v.duration) * 100);
      }
    };

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      v.removeEventListener('loadeddata', tryPlay);
      v.removeEventListener('canplay', tryPlay);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [isZoomed, activeClipIndex]);

  const handleTogglePlay = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const v = modalVideoRef.current;
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => {
          v.muted = true;
          v.play().then(() => setIsPlaying(true)).catch(() => {});
        });
      }
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleNextClip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveClipIndex((prev) => (prev + 1) % HERO_CLIPS.length);
  };

  const handlePrevClip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveClipIndex((prev) => (prev - 1 + HERO_CLIPS.length) % HERO_CLIPS.length);
  };

  const handleCloseZoom = () => {
    isZoomedRef.current = false;
    reelAudio.playZoomOut();
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      setIsPlaying(false);
    }
    if (onZoomOutRef.current) onZoomOutRef.current();
  };

  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handleModalTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dx = e.changedTouches[0].clientX - (touchStartX.current || 0);
    // Vertical swipe dismisses modal
    if (Math.abs(dy) > 55 && Math.abs(dy) > Math.abs(dx)) {
      handleCloseZoom();
    } else if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe navigates between clips!
      if (dx < 0) {
        setActiveClipIndex((prev) => (prev + 1) % HERO_CLIPS.length);
      } else {
        setActiveClipIndex((prev) => (prev - 1 + HERO_CLIPS.length) % HERO_CLIPS.length);
      }
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

  useEffect(() => {
    isMutedRef.current = isMuted;
    const wasActive = isActiveRef.current;
    isActiveRef.current = isActive;
    isRedThemeRef.current = isRedTheme;
    onZoomInRef.current = onZoomIn;
    onZoomOutRef.current = onZoomOut;
    onNavigateNextRef.current = onNavigateNext;

    if (isActive && !wasActive) {
      resumeLoopRef.current();
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      isZoomedRef.current = isZoomed;
      return;
    }

    if (isZoomed !== isZoomedRef.current) {
      isZoomedRef.current = isZoomed;
      if (isZoomed) {
        reelAudio.ensure();
        reelAudio.playZoomIn();
      } else {
        reelAudio.playZoomOut();
      }
    }
  }, [isMuted, isActive, isRedTheme, isZoomed, onZoomIn, onZoomOut, onNavigateNext]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const gl = cv.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) {
      console.error('WebGL2 is required for 3D film reel');
      return;
    }

    let isDisposed = false;

    function createProgram(vs: string, fs: string) {
      const mk = (t: number, s: string) => {
        const o = gl!.createShader(t)!;
        gl!.shaderSource(o, s);
        gl!.compileShader(o);
        if (!gl!.getShaderParameter(o, gl!.COMPILE_STATUS)) {
          const info = gl!.getShaderInfoLog(o);
          gl!.deleteShader(o);
          throw new Error(info || 'Shader compile error');
        }
        return o;
      };
      const p = gl!.createProgram()!;
      gl!.attachShader(p, mk(gl!.VERTEX_SHADER, vs));
      gl!.attachShader(p, mk(gl!.FRAGMENT_SHADER, fs));
      gl!.linkProgram(p);
      if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) {
        const info = gl!.getProgramInfoLog(p);
        gl!.deleteProgram(p);
        throw new Error(info || 'Program link error');
      }
      return p;
    }

    const pBG = createProgram(FS_TRI, FS_BG);
    const pFilm = createProgram(VS_FILM, FS_FILM);
    const pDOF = createProgram(FS_TRI, FS_DOF);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    function newTex(mips: boolean) {
      const t = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, t);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, mips ? gl!.LINEAR_MIPMAP_LINEAR : gl!.LINEAR);
      return t;
    }

    function canvasTex(c: HTMLCanvasElement, mips: boolean) {
      const t = newTex(mips);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, c);
      if (mips) gl!.generateMipmap(gl!.TEXTURE_2D);
      return t;
    }

    function edgeCanvas(n: number) {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 44;
      const g = c.getContext('2d')!;
      g.fillStyle = '#e8a838';
      g.font = 'bold 34px ui-monospace, Menlo, monospace';
      g.textBaseline = 'middle';
      g.fillText(String(n), 90, 24);
      g.fillText('\u25B7 ' + n + 'A', 560, 24);
      return c;
    }

    function placeholder(i: number) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 340;
      const g = c.getContext('2d')!;
      const h = (i * 47 + 200) % 360;
      const gr = g.createLinearGradient(0, 0, 512, 340);
      gr.addColorStop(0, `hsl(${h} 55% 52%)`);
      gr.addColorStop(1, `hsl(${h + 40} 60% 28%)`);
      g.fillStyle = gr;
      g.fillRect(0, 0, 512, 340);
      g.fillStyle = 'rgba(255,255,255,.88)';
      g.font = 'bold 46px ui-monospace, Menlo, monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('CLIP ' + String(i + 1).padStart(2, '0'), 256, 170);
      return c;
    }

    const N = HERO_CLIPS.length;
    const NF = N + 2 * PAD;
    const idxArr: number[] = [];
    for (let r = 0; r < SEG; r++) {
      const a = r * 2;
      idxArr.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }

    const blankC = document.createElement('canvas');
    blankC.width = blankC.height = 2;
    blankC.getContext('2d')!.fillStyle = '#cfe3ee';
    blankC.getContext('2d')!.fillRect(0, 0, 2, 2);
    const blankTex = canvasTex(blankC, false);

    interface FrameData {
      vao: WebGLVertexArrayObject;
      vbo: WebGLBuffer;
      data: Float32Array;
      edge: WebGLTexture;
      real: boolean;
      tex: WebGLTexture;
      video: HTMLVideoElement | null;
      playing: boolean;
      dirty: boolean;
      s: number;
      lastMeshS: number;
      pos: number[];
      dist: number;
      vis: boolean;
    }

    let localLoadedCount = 0;
    let hasCompletedLoading = false;

    const onAssetLoaded = () => {
      localLoadedCount++;
      setLoadedClipsCount(localLoadedCount);
      const computedPct = Math.round((localLoadedCount / N) * 100);
      setLoadProgress(computedPct);
      if (localLoadedCount >= N) {
        completeLoading();
      }
    };

    const completeLoading = () => {
      if (hasCompletedLoading) return;
      hasCompletedLoading = true;
      setLoadProgress(100);
      setLoadedClipsCount(N);
      window.setTimeout(() => {
        setIsLoaderExiting(true);
        window.setTimeout(() => {
          setIsLoading(false);
        }, 700);
      }, 400);
    };

    // Generous fallback timeout (30 seconds) so it never terminates early while assets are downloading
    const safetyTimeout = window.setTimeout(() => {
      completeLoading();
    }, 30000);

    const frames: FrameData[] = Array.from({ length: NF }, (_, i) => {
      const j = i - PAD;
      const real = j >= 0 && j < N;
      const clip = real ? HERO_CLIPS[j] : null;

      const vao = gl.createVertexArray()!;
      gl.bindVertexArray(vao);
      const vbo = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, (SEG + 1) * 2 * 9 * 4, gl.DYNAMIC_DRAW);
      for (let a = 0; a < 3; a++) {
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 36, a * 12);
      }
      const ib = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idxArr), gl.STATIC_DRAW);

      const f: FrameData = {
        vao,
        vbo,
        data: new Float32Array((SEG + 1) * 2 * 9),
        edge: canvasTex(edgeCanvas(((j % 36) + 36) % 36 + 1), true),
        real,
        tex: real ? canvasTex(placeholder(j), false) : blankTex,
        video: null,
        playing: false,
        dirty: false,
        s: 0,
        lastMeshS: -9999,
        pos: [0, 0, 0],
        dist: 0,
        vis: false,
      };

      if (clip && clip.src) {
        const v = document.createElement('video');
        v.src = clip.src;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.autoplay = true;
        v.preload = 'auto';
        v.crossOrigin = 'anonymous';
        v.style.position = 'fixed';
        v.style.width = '1px';
        v.style.height = '1px';
        v.style.opacity = '0';
        v.style.pointerEvents = 'none';
        v.style.zIndex = '-9999';
        if (containerRef.current) {
          containerRef.current.appendChild(v);
        }

        let isMarkedReady = false;
        const uploadInitialFrame = () => {
          if (isMarkedReady) return;
          if (v.readyState < 2) return;
          isMarkedReady = true;
          f.video = v;
          f.dirty = false;

          // Directly upload the real video frame into the WebGL texture
          try {
            gl!.bindTexture(gl!.TEXTURE_2D, f.tex);
            gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, v);
          } catch (err) {
            console.warn('Initial video frame upload:', err);
          }

          // If this is not the initial focal clip (clip 0), pause it to conserve CPU
          if (j !== 0) {
            try {
              v.pause();
            } catch {}
          }

          onAssetLoaded();
        };

        const markError = () => {
          if (isMarkedReady) return;
          isMarkedReady = true;
          f.video = null;
          onAssetLoaded();
        };

        v.addEventListener('loadeddata', uploadInitialFrame);
        v.addEventListener('canplay', uploadInitialFrame);
        v.addEventListener('timeupdate', uploadInitialFrame);
        v.addEventListener('error', markError);

        // Explicitly trigger play to initiate media decoding
        v.play().catch(() => {});
        v.load();
        if (v.readyState >= 2) {
          uploadInitialFrame();
        }
      }

      return f;
    });

    function meshFor(f: FrameData, sc: number) {
      f.lastMeshS = sc;
      const d = f.data;
      let o = 0;
      for (let r = 0; r <= SEG; r++) {
        const s = sc + (r / SEG - 0.5) * PITCH;
        const q = at(s);
        const n = norm(cross(q.t, q.b));
        for (let side = 0; side < 2; side++) {
          const p = add(q.p, mul(q.b, side ? 0.5 : -0.5));
          d[o++] = p[0];
          d[o++] = p[1];
          d[o++] = p[2];
          d[o++] = n[0];
          d[o++] = n[1];
          d[o++] = n[2];
          d[o++] = r / SEG;
          d[o++] = side;
          d[o++] = s;
        }
      }
      gl!.bindBuffer(gl!.ARRAY_BUFFER, f.vbo);
      gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, d);
      f.pos = at(sc).p;
    }

    function setPlay(f: FrameData, on: boolean, isFocal: boolean) {
      if (!f.video) return;
      // On mobile devices (<= 768px), keep WebGL canvas videos muted and let the modal handle focal audio/playback
      const isMobile = window.innerWidth <= 768;
      const shouldMute = isMobile || !isZoomedRef.current || !isActiveRef.current || !isFocal;
      if (f.video.muted !== shouldMute) {
        f.video.muted = shouldMute;
        if (!shouldMute) {
          try {
            f.video.currentTime = 0;
          } catch {}
          f.video.volume = 0.5;
          f.video.play().catch(() => {});
        }
      }
      // On mobile when zoomed in, pause background WebGL videos so the mobile device's hardware decoder isn't overwhelmed
      if (isMobile && isZoomedRef.current) {
        if (f.playing) {
          f.video.pause();
          f.playing = false;
        }
        return;
      }
      if (f.playing === on) return;
      f.playing = on;
      if (on) {
        f.video.play().catch(() => {});
      } else {
        f.video.pause();
      }
    }

    /* Render Targets */
    let msFBO: WebGLFramebuffer | null = null;
    let msC: WebGLRenderbuffer | null = null;
    let msD: WebGLRenderbuffer | null = null;
    let rsFBO: WebGLFramebuffer | null = null;
    let rsC: WebGLTexture | null = null;
    let rsD: WebGLTexture | null = null;
    let W = 0;
    let H = 0;

    function targets() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(2, Math.round(cv!.clientWidth * dpr));
      H = Math.max(2, Math.round(cv!.clientHeight * dpr));
      cv!.width = W;
      cv!.height = H;

      if (msFBO) gl!.deleteFramebuffer(msFBO);
      if (rsFBO) gl!.deleteFramebuffer(rsFBO);
      if (msC) gl!.deleteRenderbuffer(msC);
      if (msD) gl!.deleteRenderbuffer(msD);
      if (rsC) gl!.deleteTexture(rsC);
      if (rsD) gl!.deleteTexture(rsD);

      const samples = 2;

      msFBO = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, msFBO);
      msC = gl!.createRenderbuffer()!;
      gl!.bindRenderbuffer(gl!.RENDERBUFFER, msC);
      gl!.renderbufferStorageMultisample(gl!.RENDERBUFFER, samples, gl!.RGBA8, W, H);
      gl!.framebufferRenderbuffer(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.RENDERBUFFER, msC);

      msD = gl!.createRenderbuffer()!;
      gl!.bindRenderbuffer(gl!.RENDERBUFFER, msD);
      gl!.renderbufferStorageMultisample(gl!.RENDERBUFFER, samples, gl!.DEPTH_COMPONENT24, W, H);
      gl!.framebufferRenderbuffer(gl!.FRAMEBUFFER, gl!.DEPTH_ATTACHMENT, gl!.RENDERBUFFER, msD);

      rsFBO = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, rsFBO);
      rsC = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, rsC);
      gl!.texStorage2D(gl!.TEXTURE_2D, 1, gl!.RGBA8, W, H);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, rsC, 0);

      rsD = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, rsD);
      gl!.texStorage2D(gl!.TEXTURE_2D, 1, gl!.DEPTH_COMPONENT24, W, H);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.DEPTH_ATTACHMENT, gl!.TEXTURE_2D, rsD, 0);
    }
    targets();

    const uBG = {
      res: gl.getUniformLocation(pBG, 'uRes'),
      shift: gl.getUniformLocation(pBG, 'uShift'),
      theme: gl.getUniformLocation(pBG, 'uTheme'),
    };
    const uF = {
      vp: gl.getUniformLocation(pFilm, 'uVP'),
      cam: gl.getUniformLocation(pFilm, 'uCam'),
      len: gl.getUniformLocation(pFilm, 'uLen'),
      vid: gl.getUniformLocation(pFilm, 'uVid'),
      edge: gl.getUniformLocation(pFilm, 'uEdge'),
      blank: gl.getUniformLocation(pFilm, 'uBlank'),
    };
    const uD = [
      'uC',
      'uD',
      'uRes',
      'uNear',
      'uFar',
      'uFocus',
      'uA',
      'uMax',
      'uBg',
      'uTime',
      'uMotionBlur',
      'uZoomCenter',
    ].reduce(
      (m, n) => {
        m[n] = gl!.getUniformLocation(pDOF, n);
        return m;
      },
      {} as Record<string, WebGLUniformLocation | null>
    );

    const emptyVAO = gl.createVertexArray()!;

    /* Scroll, Drag, & Zoom Physics */
    let target = 0;
    let cur = 0;
    let mx = 0;
    let my = 0;
    let smx = 0;
    let smy = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTarget = 0;
    let lastVp: number[] = new Array(16).fill(0);
    let animId = 0;
    let animRunning = false;
    let frameCount = 0;

    let lastSprocketIndex = -1;
    let prevCur = cur;
    let prevZFactor = zoomFactorRef.current;
    let motionBlurIntensity = 0;

    // Wheel listener:
    // If zoomed in (Work section): scrolling IMMEDIATELY reverts to Home section and zooms out!
    // If not zoomed in (Home section): scrolling smoothly scrubs the reel with tactile sprocket clicks.
    // At the end of the reel, scrolling down redirects to About Me.
    let overscrollDown = 0;
    let overscrollTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isActiveRef.current) return;

      reelAudio.ensure();

      if (isZoomedRef.current) {
        // Revert to Home section immediately on scroll!
        isZoomedRef.current = false;
        reelAudio.playZoomOut();
        frames.forEach((f) => {
          if (f.video) f.video.muted = true;
        });
        if (onZoomOutRef.current) onZoomOutRef.current();
        return;
      }

      const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      // At the end of home section (last clip on reel): scrolling down redirects to About Me!
      // Requires strong, deliberate downward scrolling so it doesn't trigger accidentally
      if (rawDelta > 0 && target >= 0.96 && cur >= 0.88) {
        overscrollDown += Math.abs(rawDelta);
        if (overscrollTimeout) clearTimeout(overscrollTimeout);
        overscrollTimeout = setTimeout(() => {
          overscrollDown = 0;
        }, 450);

        if (overscrollDown > 380) {
          overscrollDown = 0;
          if (onNavigateNextRef.current) {
            onNavigateNextRef.current();
          }
          return;
        }
      } else if (rawDelta < 0) {
        overscrollDown = 0;
      }

      const delta = rawDelta * 0.00038;
      target = clamp(target + delta, 0, 1);
      reelAudio.playScrollWhoosh(Math.abs(rawDelta) * 0.006);
    };

    // Pointer handlers
    const handlePointerDown = (e: PointerEvent) => {
      reelAudio.ensure();
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartTarget = target;
      try {
        cv!.setPointerCapture(e.pointerId);
      } catch {}
    };

    const handlePointerMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (!isDragging) return;

      const dy = e.clientY - dragStartY;
      const dx = e.clientX - dragStartX;

      if (isZoomedRef.current && (Math.abs(dy) > 18 || Math.abs(dx) > 18)) {
        // Dragging while zoomed in reverts to Home section!
        isZoomedRef.current = false;
        reelAudio.playZoomOut();
        frames.forEach((f) => {
          if (f.video) f.video.muted = true;
        });
        if (onZoomOutRef.current) onZoomOutRef.current();
        return;
      }

      if (!isZoomedRef.current) {
        const delta = -dy / (window.innerHeight * 2.2);
        target = clamp(dragStartTarget + delta, 0, 1);
        if (Math.abs(dy) > 8) {
          reelAudio.playScrollWhoosh(Math.abs(dy) * 0.008);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        cv!.releasePointerCapture(e.pointerId);
      } catch {}

      const dist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
      const dy = dragStartY - e.clientY;

      // Swipe / Drag past bottom at end of reel: Redirect to About Me!
      if (!isZoomedRef.current && target >= 0.96 && cur >= 0.88 && dy > 120) {
        if (onNavigateNextRef.current) onNavigateNextRef.current();
        return;
      }

      // Tap / Click on Reel: Zoom in on clicked clip, highlight WORK, and enable clip audio!
      const tapThreshold = window.innerWidth <= 768 ? 24 : 10;
      if (dist < tapThreshold) {
        if (isZoomedRef.current) {
          // Click while already zoomed in -> zoom back out to Home
          isZoomedRef.current = false;
          reelAudio.playZoomOut();
          frames.forEach((f) => {
            if (f.video) f.video.muted = true;
          });
          if (modalVideoRef.current) {
            modalVideoRef.current.pause();
            setIsPlaying(false);
          }
          if (onZoomOutRef.current) onZoomOutRef.current();
          return;
        }

        // Find which clip was clicked
        const currentFocal = clamp(Math.round(cur * (N - 1)), 0, N - 1);
        let clickedClip = currentFocal;
        let minD = Infinity;

        frames.forEach((f, i) => {
          const j = i - PAD;
          if (!f.real || !f.vis) return;
          const vpMat = lastVp;
          const clipW = vpMat[3] * f.pos[0] + vpMat[7] * f.pos[1] + vpMat[11] * f.pos[2] + vpMat[15];
          if (clipW > 0) {
            const clipX = vpMat[0] * f.pos[0] + vpMat[4] * f.pos[1] + vpMat[8] * f.pos[2] + vpMat[12];
            const clipY = vpMat[1] * f.pos[0] + vpMat[5] * f.pos[1] + vpMat[9] * f.pos[2] + vpMat[13];
            const sx = ((clipX / clipW) * 0.5 + 0.5) * window.innerWidth;
            const sy = (1.0 - ((clipY / clipW) * 0.5 + 0.5)) * window.innerHeight;
            const d = Math.hypot(sx - e.clientX, sy - e.clientY);
            if (d < minD) {
              minD = d;
              clickedClip = j;
            }
          }
        });

        // Snap target to clicked clip
        target = clickedClip / (N - 1);
        setActiveClipIndex(clickedClip);
        isZoomedRef.current = true;
        reelAudio.ensure();
        reelAudio.playZoomIn();

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
          // On mobile, immediately start the modal video directly inside this user tap gesture!
          const clip = HERO_CLIPS[clickedClip];
          if (clip && modalVideoRef.current) {
            const mv = modalVideoRef.current;
            if (mv.src !== clip.src && !mv.src.endsWith(clip.src)) {
              mv.src = clip.src;
            }
            try {
              mv.currentTime = 0;
            } catch {}
            mv.playsInline = true;
            mv.setAttribute('playsinline', 'true');
            mv.setAttribute('webkit-playsinline', 'true');

            // Try playing unmuted since user tapped directly; if browser blocks, fallback to muted immediately
            mv.muted = false;
            mv.volume = 0.8;
            const p = mv.play();
            if (p !== undefined) {
              p.then(() => {
                setIsPlaying(true);
              }).catch(() => {
                mv.muted = true;
                mv.play().then(() => setIsPlaying(true)).catch(() => {});
              });
            }
          }
        } else {
          // Desktop WebGL direct user gesture: unmute and restart the clicked clip from the start at 50% volume!
          const focalFrame = frames[clickedClip + PAD];
          if (focalFrame && focalFrame.video) {
            try {
              focalFrame.video.currentTime = 0;
            } catch {}
            focalFrame.video.muted = false;
            focalFrame.video.volume = 0.5;
            focalFrame.video.play().catch(() => {});
          }
        }

        if (onZoomInRef.current) onZoomInRef.current(clickedClip);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActiveRef.current) return;

      reelAudio.ensure();

      if (e.key === 'Escape' && isZoomedRef.current) {
        isZoomedRef.current = false;
        reelAudio.playZoomOut();
        frames.forEach((f) => {
          if (f.video) f.video.muted = true;
        });
        if (onZoomOutRef.current) onZoomOutRef.current();
        return;
      }

      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(e.key) && isZoomedRef.current) {
        // Scrolling/arrow keys while in Work section revert back to Home!
        e.preventDefault();
        isZoomedRef.current = false;
        reelAudio.playZoomOut();
        frames.forEach((f) => {
          if (f.video) f.video.muted = true;
        });
        if (onZoomOutRef.current) onZoomOutRef.current();
        return;
      }

      const step = 1 / Math.max(1, N - 1);
      if (['ArrowDown', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        // If at end of reel and ArrowDown pressed -> Redirect to About Me!
        if (!isZoomedRef.current && target >= 0.96 && cur >= 0.88) {
          if (onNavigateNextRef.current) {
            onNavigateNextRef.current();
          }
          return;
        }
        target = clamp(target + step, 0, 1);
        reelAudio.playScrollWhoosh(0.7);
      } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        target = clamp(target - step, 0, 1);
        reelAudio.playScrollWhoosh(0.7);
      }
    };

    cv.addEventListener('wheel', handleWheel, { passive: false });
    cv.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    const onResize = () => {
      targets();
    };
    window.addEventListener('resize', onResize);

    /* Animation Frame Render Loop */
    function renderFrame(now: number) {
      if (isDisposed) return;

      // Inactive Loop Suspension: halt loop and pause videos when inactive (e.g. on About or Contact)
      if (!isActiveRef.current) {
        frames.forEach((f) => {
          if (f.video && !f.video.paused) {
            f.video.pause();
            f.playing = false;
          }
        });
        animRunning = false;
        return;
      }
      frameCount++;

      cur += (target - cur) * SMOOTH;
      if (Math.abs(target - cur) < 1e-5) cur = target;

      // Tactile 35mm film projector sprocket ticking & aerodynamic whoosh on scroll
      if (!isZoomedRef.current && zoomFactorRef.current < 0.2) {
        const currentSprocket = Math.floor(cur * (N - 1) * 8);
        const speed = Math.abs(cur - prevCur) * 180;
        if (lastSprocketIndex === -1) {
          lastSprocketIndex = currentSprocket;
        } else if (currentSprocket !== lastSprocketIndex) {
          reelAudio.playSprocketClick(speed);
          lastSprocketIndex = currentSprocket;
        }
        if (speed > 1.2) {
          reelAudio.playScrollWhoosh(speed * 0.25);
        }
      }
      prevCur = cur;

      smx += (mx - smx) * 0.05;
      smy += (my - smy) * 0.05;

      // Smooth Zoom Interpolation
      const targetZ = isZoomedRef.current ? 1.0 : 0.0;
      zoomFactorRef.current += (targetZ - zoomFactorRef.current) * 0.082;
      if (Math.abs(targetZ - zoomFactorRef.current) < 0.001) {
        zoomFactorRef.current = targetZ;
      }
      const zFactor = zoomFactorRef.current;

      // Dynamic Radial Motion Blur on Zoom In
      const zDelta = Math.abs(zFactor - prevZFactor);
      const isZoomingIn = targetZ === 1.0 && zFactor < 0.999;
      // Produce high-impact cinematic radial motion blur streaks during zoom in acceleration
      const targetBlur = isZoomingIn ? zDelta * 3.2 : zDelta * 0.8;
      motionBlurIntensity += (targetBlur - motionBlurIntensity) * 0.42;
      if (motionBlurIntensity < 0.0005) motionBlurIntensity = 0;
      prevZFactor = zFactor;

      // Active focal clip index tracking
      const focalClipIdx = clamp(Math.round(cur * (N - 1)), 0, N - 1);
      setActiveClipIndex(focalClipIdx);

      // Camera Trajectory: smoothly interpolates between wide reel orbit and close-up clip focus
      const parallaxFactor = 1.0 - zFactor * 0.75;
      const yaw = ((cur - 0.5) * 0.45 + smx * 0.22) * parallaxFactor;
      const pitch = (-smy * 0.12 + 0.02) * parallaxFactor;

      const focalSample = at(FOCUS_S);
      const focalP = focalSample.p;
      const focalT = focalSample.t;
      const focalB = focalSample.b;
      const focalN = norm(cross(focalT, focalB));

      // 1. Normal orbit camera when unzoomed
      const cp_orbit = [
        CAM_TARGET_NORMAL[0] + Math.sin(yaw) * Math.cos(pitch) * CAM_DIST_NORMAL,
        CAM_TARGET_NORMAL[1] + Math.sin(pitch) * CAM_DIST_NORMAL,
        CAM_TARGET_NORMAL[2] + Math.cos(yaw) * Math.cos(pitch) * CAM_DIST_NORMAL,
      ];

      // 2. Horizontally-aligned perpendicular camera facing the film aperture when zoomed
      const parallaxX = smx * 0.04;
      const parallaxY = -smy * 0.04;
      const aspect = W / Math.max(1, H);
      const zoomDist = aspect < 1.0 ? CAM_DIST_ZOOM * Math.max(1.85, 1.45 / aspect) : CAM_DIST_ZOOM;
      const cp_zoomed = add(
        add(focalP, mul(focalN, zoomDist)),
        add(mul(focalT, parallaxX), mul(focalB, parallaxY))
      );

      // Smoothly interpolate eye, target, and up-vector
      // Interpolating up-vector from [0, 1, 0] to focalB smoothly rotates the frame horizontally!
      const cp = lerp3(cp_orbit, cp_zoomed, zFactor);
      const curCamTarget = lerp3(CAM_TARGET_NORMAL, focalP, zFactor);
      const curUp = norm(lerp3([0, 1, 0], focalB, zFactor));

      const fwd = norm(sub(curCamTarget, cp));
      const focusDist = dot(sub(focalP, cp), fwd);
      const vp = mmul(persp(FOV, W / H, NEAR, FAR), look(cp, curCamTarget, curUp));
      lastVp = vp;

      // Position frames along the 3D spline
      const u = cur * (N - 1);
      const order: FrameData[] = [];
      const isZoomed = isZoomedRef.current;
      frames.forEach((f, i) => {
        const j = i - PAD;
        f.s = FOCUS_S + (u - j) * PITCH;
        const vis = f.s + PITCH / 2 > 0 && f.s - PITCH / 2 < PLEN;
        f.vis = vis;
        if (!vis) {
          setPlay(f, false, false);
          return;
        }
        // Mesh buffer subdata caching: skip re-upload if reel is stationary
        if (Math.abs(f.s - f.lastMeshS) > 1e-4) {
          meshFor(f, f.s);
        }
        const isFocal = j === focalClipIdx;
        const distFromFocus = Math.abs(f.s - FOCUS_S);
        // Play video when clip is focal or an immediate adjacent transition neighbor
        const shouldPlay = f.real && (isFocal || (!isZoomed && distFromFocus < PITCH * 1.25));
        setPlay(f, shouldPlay, isFocal);

        // Throttled video texture uploads: focal clip uploads every frame;
        // adjacent neighbor uploads on alternate frames to eliminate GPU bus saturation
        let shouldUpload = false;
        if (f.video && (f.playing || f.dirty) && f.video.readyState >= 2) {
          if (isFocal || f.dirty) {
            shouldUpload = true;
          } else if (!isZoomed && distFromFocus < PITCH * 1.25) {
            shouldUpload = frameCount % 2 === 0;
          }
        }
        if (shouldUpload && f.video) {
          gl!.bindTexture(gl!.TEXTURE_2D, f.tex);
          gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, f.video);
          f.dirty = false;
        }
        f.dist = Math.hypot(...sub(f.pos, cp));
        order.push(f);
      });
      order.sort((a, b) => b.dist - a.dist);

      // Pass 1: Backdrop + Strip into MSAA Target
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, msFBO);
      gl!.viewport(0, 0, W, H);
      gl!.clearColor(0, 0, 0, 1);
      gl!.clearDepth(1);
      gl!.depthMask(true);
      gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);

      gl!.disable(gl!.DEPTH_TEST);
      gl!.disable(gl!.BLEND);
      gl!.useProgram(pBG);
      gl!.uniform2f(uBG.res, W, H);
      gl!.uniform2f(uBG.shift, -yaw * 0.12, 0);
      gl!.uniform1f(uBG.theme, isRedThemeRef.current ? 1.0 : 0.0);
      gl!.bindVertexArray(emptyVAO);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      gl!.enable(gl!.DEPTH_TEST);
      gl!.depthFunc(gl!.LEQUAL);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.useProgram(pFilm);
      gl!.uniformMatrix4fv(uF.vp, false, new Float32Array(vp));
      gl!.uniform3fv(uF.cam, cp);
      gl!.uniform1f(uF.len, PLEN);
      gl!.uniform1i(uF.vid, 0);
      gl!.uniform1i(uF.edge, 1);

      for (const f of order) {
        gl!.uniform1f(uF.blank, f.real ? 0 : 1);
        gl!.activeTexture(gl!.TEXTURE0);
        gl!.bindTexture(gl!.TEXTURE_2D, f.tex);
        gl!.activeTexture(gl!.TEXTURE1);
        gl!.bindTexture(gl!.TEXTURE_2D, f.edge);
        gl!.bindVertexArray(f.vao);
        gl!.drawElements(gl!.TRIANGLES, SEG * 6, gl!.UNSIGNED_SHORT, 0);
      }

      // Resolve MSAA -> Textures
      gl!.bindFramebuffer(gl!.READ_FRAMEBUFFER, msFBO);
      gl!.bindFramebuffer(gl!.DRAW_FRAMEBUFFER, rsFBO);
      gl!.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT, gl!.NEAREST);

      // Pass 2: Depth of Field + Film Grain + Vignette to Screen
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, W, H);
      gl!.disable(gl!.DEPTH_TEST);
      gl!.disable(gl!.BLEND);
      gl!.useProgram(pDOF);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, rsC);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, rsD);

      const k = ((H / 1000) * BLUR);
      gl!.uniform1i(uD.uC, 0);
      gl!.uniform1i(uD.uD, 1);
      gl!.uniform2f(uD.uRes, W, H);
      gl!.uniform1f(uD.uNear, NEAR);
      gl!.uniform1f(uD.uFar, FAR);
      gl!.uniform1f(uD.uFocus, focusDist);
      gl!.uniform1f(uD.uA, 190 * k);
      gl!.uniform1f(uD.uMax, 18 * k);
      gl!.uniform1f(uD.uBg, 9 * k);
      gl!.uniform1f(uD.uTime, (now * 0.06) % 100);
      gl!.uniform1f(uD.uMotionBlur, motionBlurIntensity);
      gl!.uniform2f(uD.uZoomCenter, 0.5, 0.5);
      gl!.bindVertexArray(emptyVAO);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      animId = requestAnimationFrame(renderFrame);
    }

    function startLoop() {
      if (!animRunning && !isDisposed && isActiveRef.current) {
        animRunning = true;
        animId = requestAnimationFrame(renderFrame);
      }
    }
    resumeLoopRef.current = startLoop;
    startLoop();

    return () => {
      isDisposed = true;
      animRunning = false;
      window.clearTimeout(safetyTimeout);
      resumeLoopRef.current = () => {};
      cancelAnimationFrame(animId);
      cv.removeEventListener('wheel', handleWheel);
      cv.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', onResize);

      frames.forEach((f) => {
        if (f.video) {
          f.video.pause();
          f.video.src = '';
          f.video.remove();
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 overflow-hidden flex items-center justify-center select-none touch-none bg-black"
    >
      {/* Exact WebGL2 3D Film Reel Canvas */}
      <canvas
        ref={canvasRef}
        id="gl"
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Editorial 35mm Celluloid Loading Screen */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading reel assets"
          className={`fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-black select-none pointer-events-auto transition-opacity duration-700 ease-out ${
            isLoaderExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ backgroundColor: '#000000' }}
        >
          {/* 15-Column Layout Grid Lines Overlay matching site */}
          <div className="absolute inset-0 pointer-events-none flex justify-between px-6 sm:px-10 md:px-14 opacity-15">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-full w-[1px] bg-white/20" />
            ))}
          </div>

          {/* Top Brand & Timecode Bar */}
          <div className="relative z-10 flex items-center justify-between font-mono text-xs sm:text-sm tracking-widest text-neutral-400 uppercase">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff0000] animate-pulse" />
              <span className="text-white font-bold tracking-[0.2em]">DIGVIJAY.CREATES</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-neutral-500">
              <span>35MM FILM REEL</span>
              <span>•</span>
              <span>24.0 FPS SYNC</span>
            </div>
            <div className="text-neutral-400 font-mono tracking-wider">
              TC 00:00:0{Math.min(9, Math.floor(loadProgress / 11))}:{String(Math.floor((loadProgress * 0.96) % 60)).padStart(2, '0')}
            </div>
          </div>

          {/* Centerpiece: Film Spool Graphic, Title, and Glowing Progress Bar */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
            {/* Rotating 35mm Film Spool Graphic */}
            <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-neutral-800 flex items-center justify-center relative">
                {/* Red rotating arc */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-t-[#ff0000] border-r-transparent border-b-transparent border-l-transparent animate-spin"
                  style={{ animationDuration: '1.1s' }}
                />
                {/* Inner core display with percentage */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-950 shadow-[0_0_20px_rgba(255,0,0,0.25)]">
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#ff0000]">
                    {loadProgress}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm font-mono tracking-[0.3em] text-[#ff0000] uppercase mb-2">
              INITIALIZING TIMELINE
            </div>

            <h2 className="font-anton text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white uppercase leading-none mb-6">
              LOADING REEL
            </h2>

            {/* Glowing Red Progress Bar */}
            <div className="w-full max-w-xs sm:max-w-md bg-neutral-900 border border-neutral-800 h-2.5 rounded-full overflow-hidden relative p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-[#ff0000] to-[#ff4d4d] rounded-full transition-all duration-300 ease-out relative"
                style={{
                  width: `${Math.max(6, loadProgress)}%`,
                  boxShadow: '0 0 16px rgba(255, 0, 0, 0.75)',
                }}
              />
            </div>

            {/* Progress Metadata */}
            <div className="mt-4 flex items-center justify-between w-full max-w-xs sm:max-w-md font-mono text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wider">
              <span>CALIBRATING CLIPS ({loadedClipsCount} / {HERO_CLIPS.length})</span>
              <span className="text-neutral-300 font-bold">{loadProgress}% LOADED</span>
            </div>
          </div>

          {/* Bottom Editorial Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] sm:text-xs text-neutral-500 uppercase tracking-widest pt-4 border-t border-neutral-900">
            <div>VIDEO EDITOR · VADODARA, INDIA</div>
            <div className="text-neutral-400">
              PREPARING 3D CINEMATIC VIEWPORT
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicators along Right Rail */}
      <div className="absolute right-2.5 sm:right-5 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5 pointer-events-none">
        {HERO_CLIPS.map((_, idx) => (
          <div
            key={idx}
            className="transition-all duration-300 rounded-full"
            style={{
              width: idx === activeClipIndex ? '6px' : '3px',
              height: idx === activeClipIndex ? '22px' : '8px',
              backgroundColor: idx === activeClipIndex ? '#ff0000' : 'rgba(255,255,255,0.25)',
              boxShadow: idx === activeClipIndex ? '0 0 10px #ff0000' : 'none',
            }}
          />
        ))}
      </div>

      {/* Theme Atmosphere Selector (Roman Red vs Studio Blue) */}
      <div className="absolute top-[max(16px,env(safe-area-inset-top,16px))] right-[max(16px,env(safe-area-inset-right,16px))] md:top-8 md:right-12 z-30 flex items-center select-none min-w-[44px] min-h-[44px] justify-center">
        <Switch
          checked={isRedTheme}
          onChange={(e) => setIsRedTheme(e.target.checked)}
          size="1.45em"
          trackColor="#2c4157"
          activeTrackColor="#ff0000"
          title="Toggle Lighting Atmosphere (Crimson / Studio Blue)"
        />
      </div>

      {/* Monumental Red Titles at Bottom Right (Gently fades when zoomed in) */}
      <section
        className="introHome__container absolute bottom-0 right-0 left-0 pb-6 md:pb-10 pr-6 md:pr-14 flex flex-col items-end justify-end z-20 select-none pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isZoomed ? 0.35 : 1.0,
        }}
      >
        <p className="mobileMessage block md:hidden text-xs text-white/50 mb-2 font-bold tracking-wider uppercase text-right">
          {isZoomed ? 'Scroll or swipe to zoom out' : 'Click clip to view work · Scroll to spin reel'}
        </p>
        <header className="text text-right pointer-events-auto">
          <p className="job-title text-[#ff0000] tracking-wider font-bold mb-1">
            VIDEO EDITOR
          </p>
          <h1 className="name-title text-[#ff0000] tracking-tight font-normal">
            <span className="inline-block">DIGVIJAY.</span>
            <span className="inline-block">CREATES</span>
            <span className="sr-only"> — Digvijay Rishikesh Kohinkar, Video Editor Portfolio</span>
          </h1>
        </header>
      </section>

      {/* Mobile Expanded Lightbox Modal (md:hidden) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Expanded reel view"
        onTouchStart={handleModalTouchStart}
        onTouchEnd={handleModalTouchEnd}
        onClick={handleCloseZoom}
        className={`md:hidden fixed inset-0 z-[60] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md safe-area-inset select-none transition-all duration-300 ${
          isZoomed
            ? 'opacity-100 pointer-events-auto visible'
            : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* Top Bar with Safe-Area & 44px+ Close Button */}
        <div
          className="w-full flex items-center justify-end p-4 pt-[max(16px,env(safe-area-inset-top,16px))] px-[max(16px,env(safe-area-inset-right,16px))] z-20 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleCloseZoom}
            aria-label="Close expanded view"
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-white/10 hover:bg-[#ff0000] active:scale-95 text-white flex items-center justify-center transition-colors shadow-lg border border-white/20 backdrop-blur-sm cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Centered Video Viewport with object-fit: contain & tap-to-play */}
        <div
          className="relative flex-1 w-full flex items-center justify-center p-3 sm:p-4 overflow-hidden pointer-events-auto cursor-pointer"
          onClick={handleTogglePlay}
        >
          {/* Previous Reel Navigation Arrow */}
          <button
            type="button"
            onClick={handlePrevClip}
            aria-label="Previous reel"
            className="absolute left-2 sm:left-4 z-30 min-w-[44px] min-h-[44px] p-2 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md cursor-pointer transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Video Container */}
          <div className="relative max-w-[100vw] max-h-[66dvh] flex items-center justify-center">
            <video
              ref={modalVideoRef}
              src={HERO_CLIPS[activeClipIndex]?.src}
              autoPlay
              playsInline
              loop
              preload="auto"
              className="max-w-[100vw] max-h-[66dvh] w-auto h-auto object-contain rounded-lg shadow-2xl border border-white/10"
            />

            {/* Big Center Play Button Overlay when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/75 border-2 border-[#ff0000] text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.6)] backdrop-blur-md pointer-events-none transition-transform">
                <svg className="w-8 h-8 ml-1 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Next Reel Navigation Arrow */}
          <button
            type="button"
            onClick={handleNextClip}
            aria-label="Next reel"
            className="absolute right-2 sm:right-4 z-30 min-w-[44px] min-h-[44px] p-2 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md cursor-pointer transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Captions, Scrubber & Controls pinned at bottom inside safe area */}
        <div
          className="w-full p-4 pb-[max(20px,env(safe-area-inset-bottom,20px))] px-[max(16px,env(safe-area-inset-left,16px))] bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col items-center text-center z-20 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Playback Progress Line */}
          <div className="w-full max-w-xs sm:max-w-md bg-white/15 h-1 rounded-full overflow-hidden mb-3">
            <div
              className="bg-[#ff0000] h-full transition-all duration-150 rounded-full"
              style={{ width: `${Math.max(2, videoProgress)}%` }}
            />
          </div>

          <span className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#ff0000] uppercase mb-1">
            {HERO_CLIPS[activeClipIndex]?.category}
          </span>
          <h3 className="font-anton text-2xl sm:text-3xl text-white uppercase tracking-wide mb-1.5">
            {HERO_CLIPS[activeClipIndex]?.title}
          </h3>
          <p className="text-xs text-neutral-400 font-mono tracking-wider flex items-center gap-2">
            <span>Tap video to {isPlaying ? 'pause' : 'play'}</span>
            <span>•</span>
            <span>Swipe to dismiss</span>
          </p>
        </div>
      </div>
    </div>
  );
};
