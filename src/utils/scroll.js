// Non-linear Smooth Scrolling Easing Utility

let animationFrameId = null;

/**
 * Smoothly scroll container to target scrollY with distance-proportional non-linear easing
 * @param {HTMLElement} container - Scroll container element
 * @param {number} targetScrollY - Destination scrollTop value
 * @param {Function} onComplete - Callback when scroll completes
 */
export function scrollToNonLinear(container, targetScrollY, onComplete) {
  if (!container) return;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  const startScrollY = container.scrollTop;
  const totalDistance = Math.abs(targetScrollY - startScrollY);

  if (totalDistance < 2) {
    container.scrollTop = targetScrollY;
    if (onComplete) onComplete();
    return;
  }

  function step() {
    const current = container.scrollTop;
    const distanceLeft = targetScrollY - current;
    const absDistanceLeft = Math.abs(distanceLeft);

    if (absDistanceLeft < 1) {
      container.scrollTop = targetScrollY;
      animationFrameId = null;
      if (onComplete) onComplete();
      return;
    }

    // Dynamic ease factor: Higher when far away, lower when close
    const normalizedDist = Math.min(1, absDistanceLeft / Math.max(200, totalDistance));
    const factor = 0.08 + 0.18 * Math.pow(normalizedDist, 0.7);

    const move = distanceLeft * factor;
    const stepMove = Math.abs(move) < 1.5 ? Math.sign(distanceLeft) * 1.5 : move;

    container.scrollTop = current + stepMove;
    animationFrameId = requestAnimationFrame(step);
  }

  animationFrameId = requestAnimationFrame(step);
}

export function stopNonLinearScroll() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
