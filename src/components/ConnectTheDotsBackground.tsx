import React, { useEffect, useRef } from "react";

const DOTS = 70;
const DOT_RADIUS = 7;
const LINE_DISTANCE = 180;
const COLORS = ["#6366f1", "#a5b4fc", "#f472b6", "#facc15", "#38bdf8"];
const MAX_Y = 700;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

const ConnectTheDotsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<any[]>([]);
  const animationRef = useRef<number>();

  // Initialize dots with velocity, constrained to upper section
  const initDots = (width: number, height: number) => {
    const dots = [];
    for (let i = 0; i < DOTS; i++) {
      const angle = (i / DOTS) * Math.PI * 2;
      const r = width * 0.35 + Math.sin(i) * 60;
      const x = width / 2 + Math.cos(angle) * r + randomBetween(-30, 30);
      const y = Math.min(height / 2 + Math.sin(angle) * r + randomBetween(-30, 30), MAX_Y - DOT_RADIUS * 2);
      dots.push({
        x,
        y,
        color: COLORS[i % COLORS.length],
        vx: randomBetween(-0.12, 0.12),
        vy: randomBetween(-0.12, 0.12),
      });
    }
    return dots;
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width = window.innerWidth * dpr;
    const height = canvas.height = MAX_Y * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = MAX_Y + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    let dots = dotsRef.current;
    if (!dots.length || dots.length !== DOTS) {
      dots = initDots(window.innerWidth, MAX_Y);
      dotsRef.current = dots;
    }
    for (let dot of dots) {
      dot.x += dot.vx;
      dot.y += dot.vy;
      // Bounce off left/right
      if (dot.x < 0 || dot.x > window.innerWidth) dot.vx *= -1;
      // Bounce off top
      if (dot.y < 0) dot.vy *= -1;
      // Bounce off MAX_Y boundary
      if (dot.y > MAX_Y - DOT_RADIUS * 2) dot.vy *= -1;
    }

    ctx.clearRect(0, 0, window.innerWidth, MAX_Y);

    // Draw lines
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINE_DISTANCE) {
          ctx.save();
          ctx.globalAlpha = 1 - dist / LINE_DISTANCE;
          ctx.strokeStyle = dots[i].color;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Draw dots with a subtle radial gradient and glow
    for (let dot of dots) {
      ctx.save();
      const grad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, DOT_RADIUS);
      grad.addColorStop(0, "#fff");
      grad.addColorStop(0.5, dot.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = dot.color;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  // Re-initialize dots on resize
  useEffect(() => {
    const handleResize = () => {
      dotsRef.current = [];
    };
    window.addEventListener("resize", handleResize);
    animate();
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: MAX_Y + "px",
        zIndex: 0,
        pointerEvents: "none",
        background: "transparent",
      }}
      aria-hidden="true"
    />
  );
};

export default ConnectTheDotsBackground; 