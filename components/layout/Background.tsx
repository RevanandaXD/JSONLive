"use client";

import { useEffect, useRef } from "react";

const CELL = 8;
const GAP = 1;
const COLOR = "22,163,74";

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    const particles: {
      col: number;
      row: number;
      start: number;
      duration: number;
      peak: number;
    }[] = [];
    let spawnTimer = 0;
    let nextSpawnDelay = 0;
    let lastTime = performance.now();
    let animId = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
    }

    function randRange(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    function spawnPoint(now: number) {
      const isCluster = Math.random() < 0.3;
      const baseCol = Math.floor(Math.random() * cols);
      const baseRow = Math.floor(Math.random() * rows);
      const count = isCluster ? 3 + Math.floor(Math.random() * 8) : 1;

      for (let i = 0; i < count; i++) {
        let col = baseCol;
        let row = baseRow;
        if (i > 0) {
          col += Math.floor(randRange(-2, 3));
          row += Math.floor(randRange(-2, 3));
        }
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;

        particles.push({
          col,
          row,
          start: now,
          duration: randRange(400, 1100),
          peak: randRange(0.45, 1),
        });
      }
    }

    function frame(now: number) {
      const dt = now - lastTime;
      lastTime = now;

      ctx!.fillStyle = "#000";
      ctx!.fillRect(0, 0, width, height);

      spawnTimer += dt;
      if (spawnTimer > nextSpawnDelay) {
        spawnTimer = 0;
        nextSpawnDelay = randRange(30, 160);
        spawnPoint(now);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const t = (now - p.start) / p.duration;
        if (t >= 1) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = Math.sin(Math.PI * t) * p.peak;
        if (alpha > 0.02) {
          ctx!.fillStyle = `rgba(${COLOR}, ${alpha})`;
          ctx!.fillRect(p.col * CELL, p.row * CELL, CELL - GAP, CELL - GAP);
        }
      }

      animId = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    resize();
    animId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}