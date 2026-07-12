import { useEffect, useRef, type RefObject } from 'react';

interface UseVinylMotionOptions {
  recordRef: RefObject<HTMLDivElement | null>;
  tonearmRef: RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  progress: number;
  duration?: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getSafeDuration = (seconds: number | undefined) => (
  Number.isFinite(seconds) && (seconds ?? 0) > 0 ? seconds ?? 0 : 0
);

/**
 * Runs the decorative vinyl/tonearm motion without coupling it to player logic.
 * The hook reads playback values only through refs and fully stops under the
 * operating system's reduced-motion preference.
 */
export function useVinylMotion({
  recordRef,
  tonearmRef,
  isPlaying,
  progress,
  duration,
}: UseVinylMotionOptions) {
  const rotationAngleRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const currentArmAngleRef = useRef(-18);
  const animationFrameIdRef = useRef<number | null>(null);

  const isPlayingRef = useRef(isPlaying);
  const progressRef = useRef(progress);
  const durationRef = useRef(getSafeDuration(duration));

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    durationRef.current = getSafeDuration(duration);
  }, [duration]);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastTime = performance.now();

    const setStaticVisuals = () => {
      currentSpeedRef.current = 0;
      currentArmAngleRef.current = -18;
      if (recordRef.current) recordRef.current.style.transform = 'rotate(0deg)';
      if (tonearmRef.current) tonearmRef.current.style.transform = 'rotate(-18deg)';
    };

    const cancelAnimation = () => {
      if (animationFrameIdRef.current === null) return;
      window.cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    };

    const updatePhysics = (now: number) => {
      if (motionQuery.matches) {
        setStaticVisuals();
        animationFrameIdRef.current = null;
        return;
      }

      const delta = Math.min((now - lastTime) / 16.666, 4);
      lastTime = now;

      const playing = isPlayingRef.current;
      const safeProgress = Number.isFinite(progressRef.current)
        ? Math.max(0, progressRef.current)
        : 0;
      const safeDuration = durationRef.current;
      const targetSpeed = playing ? 0.6 : 0;
      const speedDamping = playing ? 0.04 : 0.012;

      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * speedDamping * delta;
      rotationAngleRef.current = (rotationAngleRef.current + currentSpeedRef.current * delta) % 360;

      if (recordRef.current) {
        recordRef.current.style.transform = `rotate(${rotationAngleRef.current}deg)`;
      }

      const progressPercent = safeDuration > 0
        ? clamp((safeProgress / safeDuration) * 100, 0, 100)
        : 0;
      const targetArmAngle = playing ? 8 + (progressPercent / 100) * 14 : -18;
      currentArmAngleRef.current += (targetArmAngle - currentArmAngleRef.current) * 0.03 * delta;

      if (tonearmRef.current) {
        tonearmRef.current.style.transform = `rotate(${currentArmAngleRef.current}deg)`;
      }

      animationFrameIdRef.current = window.requestAnimationFrame(updatePhysics);
    };

    const startAnimation = () => {
      if (animationFrameIdRef.current !== null || motionQuery.matches) return;
      lastTime = performance.now();
      animationFrameIdRef.current = window.requestAnimationFrame(updatePhysics);
    };

    const handleMotionPreferenceChange = () => {
      cancelAnimation();
      if (motionQuery.matches) setStaticVisuals();
      else startAnimation();
    };

    motionQuery.addEventListener('change', handleMotionPreferenceChange);
    handleMotionPreferenceChange();

    return () => {
      motionQuery.removeEventListener('change', handleMotionPreferenceChange);
      cancelAnimation();
    };
  }, [recordRef, tonearmRef]);
}
