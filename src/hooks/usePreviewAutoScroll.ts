import { useCallback, useEffect, useRef } from "react";

export type UsePreviewAutoScrollOptions = {
  enabled: boolean;
  hoverDelay?: number;
  duration?: number;
  speed?: number;
  resetOnLeave?: boolean;
  onAutoScrollStart?: () => void;
  onAutoScrollStop?: () => void;
};

export function usePreviewAutoScroll(
  ref: React.RefObject<HTMLElement | null>,
  {
    enabled,
    hoverDelay = 1000,
    duration = 12000,
    speed,
    resetOnLeave = true,
    onAutoScrollStart,
    onAutoScrollStop,
  }: UsePreviewAutoScrollOptions,
) {
  const hoverTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isAutoScrollingRef = useRef(false);

  const stopAutoScroll = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (isAutoScrollingRef.current) {
      isAutoScrollingRef.current = false;
      onAutoScrollStop?.();
    }
  }, [onAutoScrollStop]);

  const resetPreview = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    element.scrollTop = 0;
    stopAutoScroll();
  }, [ref, stopAutoScroll]);

  const beginAutoScroll = useCallback(() => {
    const element = ref.current;
    if (!enabled || !element) return;

    const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    if (maxScroll <= 0) {
      isAutoScrollingRef.current = false;
      onAutoScrollStop?.();
      return;
    }

    const effectiveSpeed = speed ?? 240;
    const effectiveDuration = duration || (maxScroll / effectiveSpeed) * 1000;
    const boundedDuration = Math.min(Math.max(effectiveDuration, 8000), 15000);
    const startTop = element.scrollTop;
    const endTop = maxScroll;
    const startTime = performance.now();

    stopAutoScroll();
    isAutoScrollingRef.current = true;
    onAutoScrollStart?.();

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / boundedDuration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      element.scrollTop = startTop + (endTop - startTop) * easedProgress;

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
      } else {
        animationFrameRef.current = null;
        isAutoScrollingRef.current = false;
        onAutoScrollStop?.();
      }
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
  }, [duration, enabled, onAutoScrollStart, onAutoScrollStop, ref, speed, stopAutoScroll]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      if (!isAutoScrollingRef.current) {
        stopAutoScroll();
      }
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [ref, stopAutoScroll]);

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType === "touch" || event.pointerType === "pen") {
        return;
      }

      stopAutoScroll();
      hoverTimerRef.current = window.setTimeout(() => {
        beginAutoScroll();
      }, hoverDelay);
    },
    [beginAutoScroll, enabled, hoverDelay, stopAutoScroll],
  );

  const handlePointerLeave = useCallback(() => {
    stopAutoScroll();
    if (resetOnLeave) {
      resetPreview();
    }
  }, [resetOnLeave, resetPreview, stopAutoScroll]);

  const handleManualInteraction = useCallback(() => {
    stopAutoScroll();
  }, [stopAutoScroll]);

  return {
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onPointerDown: handleManualInteraction,
    onTouchMove: handleManualInteraction,
    onWheel: handleManualInteraction,
    resetPreview,
    stopAutoScroll,
  };
}
