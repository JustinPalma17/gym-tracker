import { db } from './db'

export async function startWorkout() {
    const now = Date.now()
    const id = crypto.randomUUID()
    await db.workouts.add({ id, startedAt: now, updatedAt: now, deleted: false })
    return id
}

export async function finishWorkout(id: string) {
    const now = Date.now()
    await db.workouts.update(id, { endedAt: now, updatedAt: now })
}

export async function addSet(
    workoutId: string,
    exerciseId: string,
    weight: number,
    reps: number
) {
    const now = Date.now()
    const existing = await db.sets
        .where('workoutId')
        .equals(workoutId)
        .filter((s) => s.exerciseId === exerciseId && !s.deleted)
        .count()

    await db.sets.add({
        id: crypto.randomUUID(),
        workoutId,
        exerciseId,
        setNumber: existing + 1,
        weight,
        reps,
        completedAt: now,
        updatedAt: now,
        deleted: false,
    })
}

export async function deleteSet(id: string) {
    // Soft delete so sync can propagate it later
    await db.sets.update(id, { deleted: true, updatedAt: Date.now() })
}