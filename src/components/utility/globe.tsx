"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1400;

const GLOBE_CONFIG: COBEOptions = {
  width: 300,
  height: 300,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.086, 0.396, 0.204], // Green color #166534
  markerColor: [0.2, 0.8, 0.4], // Brighter green for markers
  glowColor: [0.133, 0.5, 0.25], // Lighter green for glow
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  let phi = 0;
  const [isLoaded, setIsLoaded] = useState(false);
  const widthRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  // Initialize globe with proper dimensions
  const initGlobe = () => {
    if (!canvasRef.current || !containerRef.current || globeRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    widthRef.current = containerWidth;
    
    // Use a consistent aspect ratio
    const size = Math.min(containerWidth, 600);
    
    // Create the globe with proper dimensions
    globeRef.current = createGlobe(canvasRef.current, {
      ...config,
      width: size * 2,  // High resolution (2x)
      height: size * 2, // High resolution (2x)
      onRender: (state) => {
        if (!pointerInteracting.current) phi += 0.005;
        state.phi = phi + rs.get();
        state.width = size * 2;
        state.height = size * 2;
      },
    });
    
    // Show the canvas with a delay to ensure smooth transition
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
        setIsLoaded(true);
      }
    }, 100);
  };

  useEffect(() => {
    // Use a small delay to ensure container is properly sized
    const initTimer = setTimeout(initGlobe, 300);
    
    // Use ResizeObserver for more reliable size monitoring
    const resizeObserver = new ResizeObserver((entries) => {
      if (!containerRef.current || !entries[0]) return;
      
      // Only reinitialize if size changed significantly
      const newWidth = entries[0].contentRect.width;
      if (Math.abs(newWidth - widthRef.current) > 20 && globeRef.current) {
        // Clean up old globe
        globeRef.current.destroy();
        globeRef.current = null;
        
        // Hide canvas during transition
        if (canvasRef.current) canvasRef.current.style.opacity = "0";
        
        // Re-initialize with new dimensions
        setTimeout(initGlobe, 100);
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      if (globeRef.current) {
        globeRef.current.destroy();
      }
    };
  }, [rs, config]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          updatePointerInteraction(e.clientX);
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}
