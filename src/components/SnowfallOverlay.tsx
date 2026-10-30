import { useEffect, useRef } from 'react';
import { useFestiveActive } from '../lib/festiveTheme';
import { useTheme } from '../context/ThemeContext';

interface SnowfallOverlayProps {
  mode?: 'hero' | 'fullscreen';
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  opacity: number;
  swayAngle: number;
  swaySpeed: number;
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
      const count = mode === 'hero' ? (isMobile ? 25 : 50) : (isMobile ? 35 : 75);

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 1.2, // Tiny delicate micro-dots (1.2px - 2.7px)
          speedY: Math.random() * 0.75 + 0.35, // Gentle, calm snowfall
          opacity: Math.random() * 0.55 + 0.4,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.02 + 0.01
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
        p.y += p.speedY;
        p.x += Math.sin(p.swayAngle) * 0.35;

        // Reset particle when it reaches bottom or edges
        if (p.y > canvas.height + 4) {
          p.y = -4;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 4) p.x = -4;
        if (p.x < -4) p.x = canvas.width + 4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        // 100% Pure white snow with natural alpha depth
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
        ctx.shadowBlur = p.radius > 2 ? 2.5 : 1;
        ctx.fill();
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
