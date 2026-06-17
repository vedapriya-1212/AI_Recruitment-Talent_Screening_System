import React, { useEffect, useRef } from 'react';

export default function FuturisticBackground({ children }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Node & Particle variables
    const particles = [];
    const maxParticles = 60;
    const connectionDist = 120;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? '#4FFAF0' : i % 3 === 1 ? '#7C6BFF' : '#FF5EB5',
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random(),
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections (Layer 7: AI neural connections)
      for (let i = 0; i < maxParticles; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < maxParticles; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Gradient connection line
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, p1.color);
            grad.addColorStop(1, p2.color);
            
            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles (Layer 3 & 4: particles and glowing dots)
      ctx.globalAlpha = 1.0;
      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];
        
        // Particle motion update
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle core
        p.pulseVal += p.pulseSpeed;
        const opacity = 0.3 + Math.sin(p.pulseVal) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.fill();

        // Subtle glow ring around active dots
        if (p.radius > 2.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = opacity * 0.15;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-bgDark overflow-hidden select-none">
      {/* LAYER 1: Dark cosmic gradient base */}
      <div className="absolute inset-0 bg-[#030712] z-0" />

      {/* LAYER 6: Subtle mesh gradient (Slow pulsing glowing soft lights) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primaryGlow/10 filter blur-[120px] animate-pulse-glow" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondaryGlow/10 filter blur-[150px] animate-pulse-glow" style={{ animationDuration: '18s', animationDelay: '2s' }} />
        <div className="absolute top-[35%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-accentGlow/8 filter blur-[130px] animate-pulse-glow" style={{ animationDuration: '15s', animationDelay: '4s' }} />
      </div>

      {/* LAYER 5: Blurred diagonal light beams sliding slowly */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-20%] left-[-30%] w-[80vw] h-[15px] bg-gradient-to-r from-transparent via-primaryGlow to-transparent rotate-[35deg] filter blur-[60px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] right-[-20%] w-[70vw] h-[20px] bg-gradient-to-r from-transparent via-secondaryGlow to-transparent rotate-[35deg] filter blur-[80px] animate-[pulse_10s_ease-in-out_infinite]" style={{ animationDelay: '3s' }} />
      </div>

      {/* LAYER 2: Animated neural perspective grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15] neural-grid-bg mask-radial" />

      {/* LAYERS 3, 4, 7: Canvas Particles & Connections */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      />

      {/* Content Layer */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>

      {/* Embedded Style for Grid Mask */}
      <style>{`
        .mask-radial {
          mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 85%);
          -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 85%);
        }
      `}</style>
    </div>
  );
}
