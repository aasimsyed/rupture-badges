import { useEffect, useRef, useState } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  enabled?: boolean;
}

export default function useSwipeGesture(config: SwipeConfig) {
  const { onSwipeLeft, onSwipeRight, threshold = 50, enabled = true } = config;
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchEnd.current = null;
      touchStart.current = e.targetTouches[0].clientX;
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEnd.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
      setIsSwiping(false);
      if (!touchStart.current || !touchEnd.current) return;

      const distance = touchEnd.current - touchStart.current;
      const isLeftSwipe = distance < -threshold;
      const isRightSwipe = distance > threshold;

      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }

      touchStart.current = null;
      touchEnd.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, enabled]);

  return { isSwiping };
} 