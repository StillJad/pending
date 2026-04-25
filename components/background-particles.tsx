"use client";

import { useEffect, useRef } from "react";

type Particle = {
  alpha: number;
  radius: number;
  speed: number;
  x: number;
  y: number;
};

const PARTICLE_COUNT = 42;

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 1 + Math.random() * 2.4,
    speed: 0.2 + Math.random() * 0.55,
    alpha: 0.1 + Math.random() * 0.22,
  };
}

export function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const mouse = {
      x: -9999,
      y: -9999,
    };

    let particles: Particle[] = [];

    const setSize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(width, height)
      );
    };

    const handlePointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handlePointerLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const tick = () => {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.y += particle.speed;

        if (particle.y - particle.radius > height) {
          particle.y = -10;
          particle.x = Math.random() * width;
        }

        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let offsetX = 0;
        let offsetY = 0;

        if (distance < 140) {
          const strength = (140 - distance) / 140;
          offsetX = (dx / Math.max(distance, 1)) * strength * 18;
          offsetY = (dy / Math.max(distance, 1)) * strength * 18;
        }

        const x = particle.x + offsetX;
        const y = particle.y + offsetY;

        const gradient = context.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          particle.radius * 4
        );

        gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.alpha})`);
        gradient.addColorStop(
          0.55,
          `rgba(255, 255, 255, ${particle.alpha * 0.42})`
        );
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        context.beginPath();
        context.fillStyle = gradient;
        context.arc(x, y, particle.radius * 4, 0, Math.PI * 2);
        context.fill();
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    setSize();
    tick();

    window.addEventListener("resize", setSize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
    />
  );
}
