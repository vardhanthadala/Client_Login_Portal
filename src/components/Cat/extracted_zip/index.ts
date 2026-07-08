/* Rive (Web) - Cursor Position Data Binding
   Maps cursor x and y position to number properties in 0-100 range 
   relative to canvas position in the window.
   References:
   - Data Binding: https://rive.app/docs/runtimes/data-binding#web
   - Rive File: https://rive.app/community/files/24639-46040-cat-follow-cursor-demo 
*/

import "./styles.css";
import { Fit, Rive, Layout, ViewModelInstance } from "@rive-app/webgl2";

// The layout of the graphic will adhere to
const layout = new Layout({
  fit: Fit.Contain,
});

// HTML Canvas element to render to
const riveCanvas = document.getElementById("rive-canvas") as HTMLCanvasElement;

// Function to convert cursor position to 0-100 range
const mapCursorToRange = (position: number, dimension: number): number => {
  // Clamp to canvas bounds and map to 0-100
  const clampedPosition = Math.max(0, Math.min(position, dimension));
  return (clampedPosition / dimension) * 100;
};

const r = new Rive({
  src: "cat_follow_cursor_demo.riv",
  canvas: riveCanvas,
  artboard: "Artboard 2",
  stateMachines: "State Machine 1",
  layout: layout,
  autoplay: true,
  autoBind: true,
  onLoad: (): void => {
    r.resizeDrawingSurfaceToCanvas();

    const vmi: ViewModelInstance | null = r.viewModelInstance;
    if (!vmi) return;

    const xProperty = vmi.number("xPos");
    const yProperty = vmi.number("yPos");

    // Set the x and y values to 50 initially so the character is looking forward
    if (xProperty) {
      xProperty.value = 50;
    }
    if (yProperty) {
      yProperty.value = 50;
    }

    // Unified handler for both mouse and touch position updates
    const updatePosition = (clientX: number, clientY: number): void => {
      // Get canvas position and dimensions
      const rect = riveCanvas.getBoundingClientRect();

      // Calculate position relative to canvas
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;

      // Map position to 0-100 range based on canvas dimensions
      // This accounts for canvas position in the window
      const xValue = mapCursorToRange(canvasX, rect.width);
      const yValue = mapCursorToRange(canvasY, rect.height);

      // Update the view model properties
      if (xProperty) {
        xProperty.value = xValue;
      }
      if (yProperty) {
        yProperty.value = yValue;
      }

      // Optional: Log values for debugging
      // console.log(`X: ${xValue.toFixed(2)}, Y: ${yValue.toFixed(2)}`);
    };

    // Mouse move event handler
    const handleMouseMove = (event: MouseEvent): void => {
      updatePosition(event.clientX, event.clientY);
    };

    // Touch move event handler
    const handleTouchMove = (event: TouchEvent): void => {
      // Use the first touch point
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updatePosition(touch.clientX, touch.clientY);
      }
    };

    // Touch end event handler - reset to center when touch ends
    const handleTouchEnd = (): void => {
      if (xProperty) xProperty.value = 50;
      if (yProperty) yProperty.value = 50;
    };

    // Add mouse move listener to the entire window
    window.addEventListener("mousemove", handleMouseMove);

    // Add touch event listeners to the entire window (passive to allow scrolling)
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // Set x and y values back to 50 when the cursor leaves the window
    document.addEventListener("mouseleave", (): void => {
      if (xProperty) xProperty.value = 50;
      if (yProperty) yProperty.value = 50;
    });
  },
});

// Re-adjust the rendering surface if the window resizes
window.addEventListener("resize", () => {
  r.resizeDrawingSurfaceToCanvas();
});
