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
  // Dynamic multi-directional rotation & 3D flutter
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let isPaused = false;

    // Load optimized crystalline snowflake image
    const flakeImg = new Image();
    flakeImg.src = '/snowflake.png';

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
      const count = mode === 'hero' ? (isMobile ? 24 : 45) : (isMobile ? 32 : 68);

      for (let i = 0; i < count; i++) {
        const isCrystal = Math.random() > 0.3; // 70% crystals, 30% background powder dots
        // Crystalline flakes: 11px to 22px on desktop (9px to 17px on mobile)
        const size = isCrystal
          ? (isMobile ? Math.random() * 8 + 9 : Math.random() * 11 + 11)
          : (Math.random() * 1.5 + 1.2);

        // Spin type: 40% Clockwise, 35% CounterClockwise, 25% Swaying pendulum flutter
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
          speedY: isCrystal ? Math.random() * 0.7 + 0.45 : Math.random() * 0.5 + 0.3,
          opacity: Math.random() * 0.45 + 0.55,
          rotation: Math.random() * Math.PI * 2,
          baseRotationSpeed,
          spinType,
          flutterAngle: Math.random() * Math.PI * 2,
          flutterSpeed: Math.random() * 0.03 + 0.02,
          tiltAngle: Math.random() * Math.PI * 2,
          tiltSpeed: Math.random() * 0.025 + 0.015,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.025 + 0.012,
          swayAmp: Math.random() * 0.5 + 0.4
        });
      }
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
    };

    const render = () => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let p of particles) {
        p.swayAngle += p.swaySpeed;
        p.tiltAngle += p.tiltSpeed;
        p.y += p.speedY;
        p.x += Math.sin(p.swayAngle) * p.swayAmp;

        if (p.spinType === 'flutter') {
          p.flutterAngle += p.flutterSpeed;
          p.rotation = Math.sin(p.flutterAngle) * 0.75;
        } else {
          // Smooth continuous spin in its designated direction with slight natural aerodynamic wave
          p.rotation += p.baseRotationSpeed + Math.sin(p.swayAngle) * 0.004;
        }

        // Reset particle when it reaches bottom or edges
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;

        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.isCrystal && flakeImg.complete) {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          // 3D perspective tumbling (gives depth as it spins through air)
          const tiltScale = Math.abs(Math.cos(p.tiltAngle)) * 0.35 + 0.65;
          ctx.scale(tiltScale, 1);
          ctx.drawImage(flakeImg, -p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          // Circular powder dots for realistic depth of field
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 2;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resize();
    render();

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
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-30"
      aria-hidden="true"
    />
  );
}
