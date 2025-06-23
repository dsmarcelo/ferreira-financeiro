/**
 * Enhanced viewport height hook that handles mobile keyboard detection
 *
 * This hook provides real-time viewport height updates and detects when
 * the mobile keyboard is open. It uses the Visual Viewport API when available
 * for more accurate keyboard detection across different mobile browsers.
 *
 * @returns {Object} An object containing:
 *   - height: Current viewport height in pixels
 *   - isKeyboardOpen: Boolean indicating if mobile keyboard is detected
 *   - keyboardHeight: Estimated height of the mobile keyboard in pixels
 *   - getMobileDialogHeight: Function to calculate optimal dialog height for mobile
 *   - getAvailableHeight: Function to get available height above keyboard for sheets
 */
import { useEffect, useState } from 'react';

export function useViewportHeight() {
  const [height, setHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const currentHeight = window.visualViewport?.height ?? window.innerHeight;
      const screenHeight = window.screen.height;
      const newIsKeyboardOpen = currentHeight < screenHeight * 0.75; // More aggressive detection
      const estimatedKeyboardHeight = newIsKeyboardOpen ? screenHeight - currentHeight : 0;

      setHeight(currentHeight);
      setIsKeyboardOpen(newIsKeyboardOpen);
      setKeyboardHeight(estimatedKeyboardHeight);
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        updateHeight();
      }
    };

    const handleResize = () => {
      updateHeight();
    };

    updateHeight(); // initial

    // Use Visual Viewport API if available (more accurate for mobile keyboards)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    window.addEventListener('orientationchange', handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Convenience function to get calculated max height for mobile dialogs
  const getMobileDialogHeight = (padding = 40, minHeight = 300) => {
    if (isKeyboardOpen && height > 0) {
      return Math.max(height - padding, minHeight);
    }
    return undefined; // Use default 90dvh
  };

  // Get available height above keyboard for sheets
  const getAvailableHeight = () => {
    return height > 0 ? height : window.innerHeight;
  };

  return {
    height,
    isKeyboardOpen,
    keyboardHeight,
    getMobileDialogHeight,
    getAvailableHeight
  };
}