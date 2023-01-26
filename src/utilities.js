export function InOutQuadBlend(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(min, number, max) {
    return Math.min(Math.max(number, min), max);
}

export function percentage(num, per) {
    return (num / 100) * per;
}
