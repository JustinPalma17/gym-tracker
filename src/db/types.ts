export interface Exercise {
    id: string
    name: string
    muscleGroup: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core'
    isCustom: boolean
    updatedAt: number
    deleted: boolean
}

export interface Workout {
    id: string
    startedAt: number
    endedAt?: number
    note?: string
    updatedAt: number
    deleted: boolean
}

export interface SetEntry {
    id: string
    workoutId: string
    exerciseId: string
    setNumber: number
    weight: number
    reps: number
    completedAt: number
    updatedAt: number
    deleted: boolean
}