export interface SetLike {
    weight: number
    reps: number
    completedAt: number
}

// Epley formula: weight × (1 + reps / 30). A single rep is its own 1RM.
export function estimate1RM(weight: number, reps: number): number {
    if (weight <= 0 || reps <= 0) return 0
    if (reps === 1) return weight
    return weight * (1 + reps / 30)
}

export function startOfDay(timestamp: number): number {
    const d = new Date(timestamp)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
}

// Weeks start on Monday
export function startOfWeek(timestamp: number): number {
    const d = new Date(timestamp)
    const daysSinceMonday = (d.getDay() + 6) % 7
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - daysSinceMonday)
    return d.getTime()
}

// Best estimated 1RM for each day, oldest to newest
export function bestOneRMByDay(sets: SetLike[]): { date: number; oneRM: number }[] {
    const byDay = new Map<number, number>()
    for (const s of sets) {
        const day = startOfDay(s.completedAt)
        const value = estimate1RM(s.weight, s.reps)
        byDay.set(day, Math.max(byDay.get(day) ?? 0, value))
    }
    return [...byDay.entries()]
        .map(([date, oneRM]) => ({ date, oneRM }))
        .sort((a, b) => a.date - b.date)
}

// Total volume (weight × reps) for each week, oldest to newest
export function weeklyVolume(sets: SetLike[]): { weekStart: number; volume: number }[] {
    const byWeek = new Map<number, number>()
    for (const s of sets) {
        const week = startOfWeek(s.completedAt)
        byWeek.set(week, (byWeek.get(week) ?? 0) + s.weight * s.reps)
    }
    return [...byWeek.entries()]
        .map(([weekStart, volume]) => ({ weekStart, volume }))
        .sort((a, b) => a.weekStart - b.weekStart)
}