export function InOutQuadBlend(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
export function clamp(min, number, max) {
    return Math.min(Math.max(number, min), max);
}
