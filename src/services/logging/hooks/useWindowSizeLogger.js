// hook for sending logs about window resizing with debounce

import { useState, useEffect, useRef } from 'react';
import useSaveLogToDB from './useSaveLogToDB';

function useWindowSizeLogger() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef(null);

  // Use the saveLogToDB function from the imported hook
  const { saveLogToDB } = useSaveLogToDB();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        // Clear the previous timeout if there is one
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }

        resizeTimeoutRef.current = setTimeout(() => {
          const newSize = {
            width: window.innerWidth,
            height: window.innerHeight
          };

          if (newSize.width !== windowSize.width || newSize.height !== windowSize.height) {
            setWindowSize(newSize);

            // Save to DB
            const logMessage = `Window size set to ${newSize.width}x${newSize.height}`;
            saveLogToDB(logMessage);
          }
        }, 500);  // Delay of 500ms; adjust based on your needs
      };

      // Log initial size
      handleResize();

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
      };
    }
  }, [windowSize]);
}

export default useWindowSizeLogger;
