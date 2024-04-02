"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

const WaveAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHoveringWave, setIsHoveringWave] = useState(false);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    setCursorPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

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

        // Calculate distance between cursor and point on the wave
        const distance = Math.sqrt(
          (i - cursorPosition.x) ** 2 + (y - cursorPosition.y) ** 2
        );

        // Check if cursor is within a certain distance from the wave
        if (distance < 50) {
          setIsHoveringWave(true);
          ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Red color
        } else {
          setIsHoveringWave(false);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; // Default color
        }

        if (Math.random() < 0.02) {
          y += Math.random() * 20 - 10;
        }

        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }

      ctx.stroke();
      offset += -0.02;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    animate();

    // Cleanup function
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

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
        cursor: isHoveringWave ? "pointer" : "default",
      }}
    />
  );
};

export default WaveAnimation;
