"use client";

import { useEffect, useRef } from "react";
import { useRive, Fit, Layout } from "@rive-app/react-canvas";

export function CatAssistant() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Store target and current values for smooth interpolation
  const targetX = useRef(50);
  const targetY = useRef(50);
  const currentX = useRef(50);
  const currentY = useRef(50);
  const frameRef = useRef<number>(undefined);

  const { rive, RiveComponent } = useRive({
    src: "/cat_follow_cursor_demo.riv",
    stateMachines: "State Machine 1",
    artboard: "Artboard 2",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
    }),
  });

  useEffect(() => {
    if (!rive) return;

    let isActive = true;

    const animate = () => {
      if (!isActive) return;

      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      try {
        if (!rive) {
          console.log("Rive instance not ready");
          return;
        }

        // DEBUG LOGGING
        console.log("=== DEBUG RIVE ===");
        
        // Check State Machine Inputs
        const smInputs = rive.stateMachineInputs("State Machine 1");
        console.log("State Machine Inputs:", smInputs ? smInputs.map((i:any) => i.name) : "none");

        // Check ViewModel Bindings (Rive Data Binding)
        let vmi = null;
        if (typeof (rive as any).viewModelInstance !== "undefined") {
          vmi = (rive as any).viewModelInstance;
          console.log("ViewModelInstance found!", vmi);
        } else {
          console.log("No viewModelInstance property on rive object.");
        }

        if (smInputs) {
          const xInput = smInputs.find((i: any) => i.name === "xPos");
          const yInput = smInputs.find((i: any) => i.name === "yPos");
          if (xInput) xInput.value = currentX.current;
          if (yInput) yInput.value = currentY.current;
        }

        // If it's data binding, we need to set the value differently
        if (vmi) {
          const xProp = vmi.number("xPos");
          const yProp = vmi.number("yPos");
          if (xProp) xProp.value = currentX.current;
          if (yProp) yProp.value = currentY.current;
          console.log("ViewModel Set values:", currentX.current, currentY.current);
        }
      } catch (e) {
        console.error("Rive Loop Error:", e);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 2;

      const dx = event.clientX - catCenterX;
      const dy = event.clientY - catCenterY;

      const maxDx = window.innerWidth;
      const maxDy = window.innerHeight;

      const normX = dx / (maxDx * 0.4); 
      const normY = dy / (maxDy * 0.4);

      let xVal = 50 + (normX * 50);
      let yVal = 50 + (normY * 50);

      const finalX = Math.max(0, Math.min(xVal, 100));
      const finalY = Math.max(0, Math.min(yVal, 100));
      
      console.log(`[DEBUG MOUSE] dx: ${dx.toFixed(2)}, dy: ${dy.toFixed(2)} | targetX: ${finalX.toFixed(2)}, targetY: ${finalY.toFixed(2)}`);

      targetX.current = finalX;
      targetY.current = finalY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!containerRef.current || event.touches.length === 0) return;
      const touch = event.touches[0];
      
      const rect = containerRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 2;

      const dx = touch.clientX - catCenterX;
      const dy = touch.clientY - catCenterY;

      const maxDx = window.innerWidth;
      const maxDy = window.innerHeight;

      const normX = dx / (maxDx * 0.4);
      const normY = dy / (maxDy * 0.4);

      targetX.current = Math.max(0, Math.min(50 + (normX * 50), 100));
      targetY.current = Math.max(0, Math.min(50 + (normY * 50), 100));
    };

    const handleMouseLeave = () => {
      // Smoothly return to center
      targetX.current = 50;
      targetY.current = 50;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchend", handleMouseLeave);

    return () => {
      isActive = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchend", handleMouseLeave);
    };
  }, [rive]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center pointer-events-none"
    >
      <RiveComponent className="w-full h-full pointer-events-auto" />
    </div>
  );
}

