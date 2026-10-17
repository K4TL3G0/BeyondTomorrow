export const LEVELS = [
    { min: 80, aps: 7, label: "Outstanding Achievement" },
    { min: 70, aps: 6, label: "Meritorious Achievement" },
    { min: 60, aps: 5, label: "Substantial Achievement" },
    { min: 50, aps: 4, label: "Adequate Achievement" },
    { min: 40, aps: 3, label: "Moderate Achievement" },
    { min: 30, aps: 2, label: "Elementary Achievement" },
    { min: 0, aps: 1, label: "Not Achieved" },
];
export function isValidMark(percent) {
    return Number.isFinite(percent) && percent >= 0 && percent <= 100;
}
export function convertMark(percent) {
    if (!isValidMark(percent)) {
        throw new RangeError("Mark must be between 0 and 100");
    }
    const whole = Math.floor(percent);
    const match = LEVELS.find((l) => whole >= l.min) ?? LEVELS[LEVELS.length - 1];
    return { aps: match.aps, level: match.label };
}
export function calculateAps(entries) {
    const breakdown = entries.map((e) => ({
        ...e,
        ...convertMark(e.percent),
    }));
    const counted = breakdown.filter((r) => r.counted);
    return {
        total: counted.reduce((sum, r) => sum + r.aps, 0),
        countedSubjects: counted.length,
        breakdown,
    };
}
