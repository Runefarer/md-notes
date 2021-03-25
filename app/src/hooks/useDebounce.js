import { useEffect, useRef } from 'react';

export const useDebounce = () => {
  const timeoutRef = useRef();

  const clearDebounce = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const setDebounce = (fn, delay) => {
    clearDebounce();
    timeoutRef.current = setTimeout(fn, delay);
  };

  useEffect(() => clearDebounce, []);

  return setDebounce;
};

export { useDebounce as default };
