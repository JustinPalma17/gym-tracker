import Dexie, { type EntityTable } from 'dexie'
import type { Exercise, Workout, SetEntry } from './types'

export const db = new Dexie('gym-tracker') as Dexie & {
    exercises: EntityTable<Exercise, 'id'>
    workouts: EntityTable<Workout, 'id'>
    sets: EntityTable<SetEntry, 'id'>
}

db.version(1).stores({
    exercises: 'id, name, muscleGroup, updatedAt',
    workouts: 'id, startedAt, updatedAt',
    sets: 'id, workoutId, exerciseId, updatedAt',
})