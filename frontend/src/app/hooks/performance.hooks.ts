import React, { useMemo, useCallback, useRef, useEffect } from 'react';

// Custom hook for debounced state
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = React.useState(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState(initialValue);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutRef.current);
  }, [value, delay]);

  return [debouncedValue, setValue];
};

// Custom hook for throttled state
export const useThrottledState = (initialValue, interval = 300) => {
  const [value, setValue] = React.useState(initialValue);
  const lastUpdateRef = useRef(Date.now());

  const handleChange = useCallback((newValue) => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= interval) {
      setValue(newValue);
      lastUpdateRef.current = now;
    }
  }, [interval]);

  return [value, handleChange];
};

// Custom hook for intersection observer
export const useIntersectionObserver = (ref, options = {}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
};

// Custom hook for lazy loading images
export const useLazyImage = (src) => {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
  }, [src]);

  return { imageSrc, isLoading };
};

// Custom hook for localStorage sync
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  return [storedValue, setValue];
};

// Memoized callback for event handlers
export const useMemoCallback = (callback, dependencies) => {
  return useCallback(callback, dependencies);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
    };
  }, [componentName]);
};
