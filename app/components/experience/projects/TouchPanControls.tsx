'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

/**
 * Touch-drag panning for the industries portal on small screens.
 *
 * Listeners are registered once and the drag flag lives in a ref, so dragging
 * never re-registers them, and the momentum check runs in the existing frame
 * loop instead of a 100 ms interval.
 */
export const TouchPanControls = () => {
  const { camera } = useThree();
  const touchStartRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Set initial camera and target rotation values
  useEffect(() => {
    cameraRotationRef.current = {
      x: camera.rotation.y,
      y: camera.rotation.x,
    };
    targetRotationRef.current = {
      x: camera.rotation.y,
      y: camera.rotation.x,
    };
  }, [camera]);

  // Animation loop for smooth camera movement
  useFrame(() => {
    if (!camera) return;

    // Apply smooth damping to camera rotation
    const dampingFactor = 0.05;

    camera.rotation.y += (targetRotationRef.current.x - camera.rotation.y) * dampingFactor;
    camera.rotation.x += (targetRotationRef.current.y - camera.rotation.x) * dampingFactor;

    // Momentum settling: when movement nearly stops, update the reference point
    // so the next drag starts from where the camera actually is.
    if (!isDraggingRef.current && Math.abs(targetRotationRef.current.x - camera.rotation.y) < 0.001) {
      cameraRotationRef.current = {
        x: camera.rotation.y,
        y: camera.rotation.x,
      };
    }
  });

  // Handle touch events
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        // Remember current rotation as starting point
        cameraRotationRef.current = {
          x: targetRotationRef.current.x,
          y: targetRotationRef.current.y,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;

      // Calculate touch movement delta
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - touchStartRef.current.x;

      // Update target rotation with sensitivity adjustment
      const sensitivity = 0.005;
      const newRotationY = cameraRotationRef.current.x + deltaX * sensitivity;

      // Apply rotation limits to prevent over-rotation
      const maxRotation = Math.PI / 3;
      targetRotationRef.current.x = Math.max(Math.min(newRotationY, maxRotation), -maxRotation);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // None of these handlers call preventDefault, so they are registered as
    // passive listeners: the compositor can scroll the ScrollControls div
    // without waiting for this JS to run.
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    // Clean up event listeners
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera]);

  return null;
};
