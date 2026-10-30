import { useEffect, useRef } from 'react';
import { useFestiveActive } from '../lib/festiveTheme';
import { useTheme } from '../context/ThemeContext';

interface SnowfallOverlayProps {
  mode?: 'hero' | 'fullscreen';
}

interface Particle {
  x: number;
  y: number;
  isCrystal: boolean;
  size: number;
  speedY: number;
  opacity: number;
  rotation: number;
  baseRotationSpeed: number;
  spinType: 'clockwise' | 'counterClockwise' | 'flutter';
  flutterAngle: number;
  flutterSpeed: number;
  tiltAngle: number;
  tiltSpeed: number;
  swayAngle: number;
  swaySpeed: number;
  swayAmp: number;
}

export default function SnowfallOverlay({ mode = 'fullscreen' }: SnowfallOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isFestive = useFestiveActive();
  const { theme } = useTheme();

  // Light Mode: Only render in Hero banner (strictly confined to royal blue section)
  // Dark Mode: Render fullscreen across the whole site
  if (!isFestive) return null;
  if (theme === 'light' && mode === 'fullscreen') return null;
  if (theme === 'dark' && mode === 'hero') return null;

  return <SnowCanvas canvasRef={canvasRef} mode={mode} isDark={theme === 'dark'} />;
}

function SnowCanvas({
  canvasRef,
  mode,
  isDark
}: {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  mode: 'hero' | 'fullscreen';
  isDark: boolean;
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use desynchronized & alpha for optimal GPU pipeline
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let isPaused = false;
    let lastTime = performance.now();

    // Pre-rendered offscreen sprite texture for 60fps hardware performance
    let spriteCanvas: HTMLCanvasElement | null = null;
    const flakeImg = new Image();
    flakeImg.src = '/snowflake.png';
    flakeImg.onload = () => {
      spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 40;
      spriteCanvas.height = 40;
      const sCtx = spriteCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(flakeImg, 0, 0, 40, 40);
      }
    };

    const resize = () => {
      if (!canvas) return;
      if (mode === 'hero') {
        const parent = canvas.parentElement;
        canvas.width = parent ? parent.offsetWidth : window.innerWidth;
        canvas.height = parent ? parent.offsetHeight : 450;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const isMobile = window.innerWidth < 768;
      // High-performance particle counts tuned for smooth 60fps
      const count = mode === 'hero' ? (isMobile ? 22 : 42) : (isMobile ? 28 : 55);

      for (let i = 0; i < count; i++) {
        const isCrystal = Math.random() > 0.28;
        const size = isCrystal
          ? (isMobile ? Math.random() * 7 + 9 : Math.random() * 10 + 11)
          : (Math.random() * 1.5 + 1.2);

        const rand = Math.random();
        const spinType: 'clockwise' | 'counterClockwise' | 'flutter' =
          rand < 0.4 ? 'clockwise' : rand < 0.75 ? 'counterClockwise' : 'flutter';

        const baseRotationSpeed =
          (Math.random() * 0.016 + 0.012) * (spinType === 'counterClockwise' ? -1 : 1);

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          isCrystal,
          size,
          speedY: isCrystal ? Math.random() * 0.65 + 0.45 : Math.random() * 0.45 + 0.3,
          opacity: Math.random() * 0.4 + 0.6,
          rotation: Math.random() * Math.PI * 2,
          baseRotationSpeed,
          spinType,
          flutterAngle: Math.random() * Math.PI * 2,
          flutterSpeed: Math.random() * 0.03 + 0.02,
          tiltAngle: Math.random() * Math.PI * 2,
          tiltSpeed: Math.random() * 0.025 + 0.015,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.022 + 0.012,
          swayAmp: Math.random() * 0.5 + 0.4
        });
      }
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused) lastTime = performance.now();
    };

    const render = (currentTime: number) => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Delta time normalized to 60fps (16.67ms) to prevent stutters
      const dt = Math.min((currentTime - lastTime) / 16.67, 2.0) || 1.0;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sourceDrawable = spriteCanvas || (flakeImg.complete ? flakeImg : null);
      const srcW = spriteCanvas ? 40 : 180;
      const srcH = spriteCanvas ? 40 : 198;

      for (let p of particles) {
        p.swayAngle += p.swaySpeed * dt;
        p.tiltAngle += p.tiltSpeed * dt;
        p.y += p.speedY * dt;
        p.x += Math.sin(p.swayAngle) * p.swayAmp * dt;

        if (p.spinType === 'flutter') {
          p.flutterAngle += p.flutterSpeed * dt;
          p.rotation = Math.sin(p.flutterAngle) * 0.75;
        } else {
          p.rotation += (p.baseRotationSpeed + Math.sin(p.swayAngle) * 0.004) * dt;
        }

        // Loop boundaries
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;

        ctx.globalAlpha = p.opacity;

        if (p.isCrystal && sourceDrawable) {
          const tiltScale = Math.abs(Math.cos(p.tiltAngle)) * 0.35 + 0.65;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(tiltScale, 1);
          ctx.drawImage(sourceDrawable, 0, 0, srcW, srcH, -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.setTransform(1, 0, 0, 1, 0, 0); // Fast reset without save/restore overhead
        } else {
          // Zero-blur crisp powder dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resize();
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode, isDark]);

  if (mode === 'hero') {
    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 transform-gpu"
        style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-30 transform-gpu"
      style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
      aria-hidden="true"
    />
  );
}
