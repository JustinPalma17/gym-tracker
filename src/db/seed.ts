import { db } from './db'
import type { Exercise } from './types'

const defaults: Pick<Exercise, 'name' | 'muscleGroup'>[] = [
    { name: 'Bench Press', muscleGroup: 'chest' },
    { name: 'Incline Dumbbell Press', muscleGroup: 'chest' },
    { name: 'Deadlift', muscleGroup: 'back' },
    { name: 'Barbell Row', muscleGroup: 'back' },
    { name: 'Pull-Up', muscleGroup: 'back' },
    { name: 'Squat', muscleGroup: 'legs' },
    { name: 'Romanian Deadlift', muscleGroup: 'legs' },
    { name: 'Leg Press', muscleGroup: 'legs' },
    { name: 'Overhead Press', muscleGroup: 'shoulders' },
    { name: 'Lateral Raise', muscleGroup: 'shoulders' },
    { name: 'Barbell Curl', muscleGroup: 'arms' },
    { name: 'Tricep Pushdown', muscleGroup: 'arms' },
    { name: 'Plank', muscleGroup: 'core' },
]

export async function seedExercises() {
    const count = await db.exercises.count()
    if (count > 0) return

    const now = Date.now()
    await db.exercises.bulkAdd(
        defaults.map((e) => ({
            ...e,
            id: crypto.randomUUID(),
            isCustom: false,
            updatedAt: now,
            deleted: false,
        }))
    )
}