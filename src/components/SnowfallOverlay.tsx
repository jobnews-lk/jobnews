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
  rotationSpeed: number;
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

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          isCrystal,
          size,
          speedY: isCrystal ? Math.random() * 0.7 + 0.45 : Math.random() * 0.5 + 0.3,
          opacity: Math.random() * 0.45 + 0.55,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: Math.random() * 0.015 - 0.0075, // Slow, elegant spin
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
        p.x += Math.sin(p.swayAngle) * 0.4;
        p.rotation += p.rotationSpeed;

        // Reset particle when it reaches bottom or edges
        if (p.y > canvas.height + 15) {
          p.y = -15;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 15) p.x = -15;
        if (p.x < -15) p.x = canvas.width + 15;

        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.isCrystal && flakeImg.complete) {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
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
