"use client"; // This is a client component 👈🏽

import React, { useEffect, useRef } from "react";

const WaveAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const wavelength = 100;
    const amplitude = 50;
    let offset = 0;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();

      for (let i = 0; i < canvas.width; i++) {
        let y =
          canvas.height / 2 +
          Math.sin((i / wavelength) * Math.PI + offset) * amplitude;

        if (Math.random() < 0.02) {
          y += Math.random() * 20 - 10;
        }

        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.stroke();
      offset += -0.02;
    };

    animate();

    // Cleanup function
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    />
  );
};

export default WaveAnimation;
