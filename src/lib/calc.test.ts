import { describe, it, expect } from 'vitest'
import { estimate1RM, startOfWeek, bestOneRMByDay, weeklyVolume } from './calc'

describe('estimate1RM', () => {
    it('returns the weight itself for a single rep', () => {
        expect(estimate1RM(100, 1)).toBe(100)
    })

    it('uses the Epley formula for multiple reps', () => {
        expect(estimate1RM(100, 10)).toBeCloseTo(133.33, 1)
    })

    it('returns 0 for invalid input', () => {
        expect(estimate1RM(0, 5)).toBe(0)
        expect(estimate1RM(100, 0)).toBe(0)
    })
})

describe('startOfWeek', () => {
    it('maps a Wednesday to the Monday of that week', () => {
        const wednesday = new Date(2026, 10, 4, 15, 30).getTime()
        expect(startOfWeek(wednesday)).toBe(new Date(2026, 10, 2).getTime())
    })

    it('maps a Sunday to the Monday before it', () => {
        const sunday = new Date(2026, 10, 8, 9, 0).getTime()
        expect(startOfWeek(sunday)).toBe(new Date(2026, 10, 2).getTime())
    })
})

describe('bestOneRMByDay', () => {
    it('keeps the best set of each day', () => {
        const day = new Date(2026, 10, 2, 10, 0).getTime()
        const result = bestOneRMByDay([
            { weight: 100, reps: 5, completedAt: day },
            { weight: 120, reps: 1, completedAt: day + 1000 },
        ])
        expect(result).toHaveLength(1)
        expect(result[0].oneRM).toBeCloseTo(120, 1)
    })
})

describe('weeklyVolume', () => {
    it('sums weight × reps within a week', () => {
        const mon = new Date(2026, 10, 2, 10, 0).getTime()
        const wed = new Date(2026, 10, 4, 10, 0).getTime()
        const result = weeklyVolume([
            { weight: 100, reps: 5, completedAt: mon },
            { weight: 50, reps: 10, completedAt: wed },
        ])
        expect(result).toEqual([
            { weekStart: new Date(2026, 10, 2).getTime(), volume: 1000 },
        ])
    })
})