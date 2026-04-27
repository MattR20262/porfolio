"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only activate on fine-pointer (mouse) devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hide the native cursor by tagging <body>
    document.body.classList.add("custom-cursor-active");

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let mouseX = ringX;
    let mouseY = ringY;
    let rafId: number;
    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;

      if (!hasMoved) {
        hasMoved = true;
        dot.classList.add("visible");
        ring.classList.add("visible");
      }
    };

    const onEnterLink = () => {
      dot.style.transform = "translate(-50%, -50%) scale(1.5)";
      ring.style.width = "56px";
      ring.style.height = "56px";
      ring.style.borderColor = "rgba(201, 168, 76, 0.9)";
    };

    const onLeaveLink = () => {
      dot.style.transform = "translate(-50%, -50%) scale(1)";
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.borderColor = "rgba(201, 168, 76, 0.5)";
    };

    document.addEventListener("mousemove", onMove, { passive: true });

    const interactiveEls = document.querySelectorAll("a, button, [data-cursor]");
    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnterLink);
      el.addEventListener("mouseleave", onLeaveLink);
    });

    const animate = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      document.body.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", onMove);
      interactiveEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterLink);
        el.removeEventListener("mouseleave", onLeaveLink);
      });
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          position: "fixed",
          width: 7,
          height: 7,
          background: "#c9a84c",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.15s",
        }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{
          position: "fixed",
          width: 36,
          height: 36,
          border: "1px solid rgba(201, 168, 76, 0.5)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          transform: "translate(-50%, -50%)",
        }}
      />
    </>
  );
}
