import { useState, useEffect } from 'react';

export function useProctoring() {
  const [violations, setViolations] = useState<{type: string, timestamp: string}[]>([]);
  const [integrityScore, setIntegrityScore] = useState(100);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => [...prev, { type: 'Tab Switched', timestamp: new Date().toISOString() }]);
        setIntegrityScore(prev => Math.max(0, prev - 15));
        console.warn("[Proctoring] Violation: Candidate switched tabs or minimized window.");
      }
    };

    const handleBlur = () => {
      setViolations(prev => [...prev, { type: 'Window Lost Focus', timestamp: new Date().toISOString() }]);
      setIntegrityScore(prev => Math.max(0, prev - 5));
      console.warn("[Proctoring] Violation: Window lost focus.");
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return { violations, integrityScore };
}
