import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRestTimer } from './restTimerStore'
import { db } from '../../db/db'
import type { SetEntry } from '../../db/types'
import {
    startWorkout,
    finishWorkout,
    addSet,
    deleteSet,
} from '../../db/workoutService'

export default function WorkoutLogger() {
    const [exerciseId, setExerciseId] = useState('')
    const [weight, setWeight] = useState('')
    const [reps, setReps] = useState('')
    const startRest = useRestTimer((s) => s.start)

    const exercises = useLiveQuery(() =>
        db.exercises.orderBy('name').filter((e) => !e.deleted).toArray()
    )

    // The active workout is the one with no end time
    const workout = useLiveQuery(async () => {
        const active = await db.workouts.filter((w) => !w.endedAt && !w.deleted).first()
        return active ?? null
    })

    const sets = useLiveQuery(
        () =>
            workout
                ? db.sets
                    .where('workoutId')
                    .equals(workout.id)
                    .filter((s) => !s.deleted)
                    .sortBy('completedAt')
                : [],
        [workout?.id]
    )
    const lastTime = useLiveQuery(async () => {
        if (!exerciseId || !workout) return null

        const previous = await db.sets
            .where('exerciseId')
            .equals(exerciseId)
            .filter((s) => !s.deleted && s.workoutId !== workout.id)
            .toArray()
        if (previous.length === 0) return null

        // Find the most recent workout that included this exercise
        previous.sort((a, b) => b.completedAt - a.completedAt)
        const lastWorkoutId = previous[0].workoutId

        return previous
            .filter((s) => s.workoutId === lastWorkoutId)
            .sort((a, b) => a.setNumber - b.setNumber)
    }, [exerciseId, workout?.id])

    if (!exercises || workout === undefined) return null // still loading

    if (!workout) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-3xl font-bold">Gym Tracker 💪</h1>
                <button
                    onClick={() => startWorkout()}
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-lg"
                >
                    Start Workout
                </button>
            </div>
        )
    }

    const nameById = new Map(exercises.map((e) => [e.id, e.name]))

    // Group sets by exercise, keeping the order they were first used
    const grouped = new Map<string, SetEntry[]>()
    for (const s of sets ?? []) {
        grouped.set(s.exerciseId, [...(grouped.get(s.exerciseId) ?? []), s])
    }

    const canAdd = exerciseId && Number(weight) >= 0 && weight !== '' && Number(reps) > 0

    async function handleAdd() {
        if (!canAdd || !workout) return
        await addSet(workout.id, exerciseId, Number(weight), Number(reps))
        setReps('') // keep weight and exercise, since the next set is usually similar
        startRest(120)
    }

    return (
        // Start Workout screen
        <div className="min-h-[calc(100vh-5rem)] bg-gray-900 text-white p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Workout</h1>
                <button
                    onClick={() => finishWorkout(workout.id)}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                    Finish
                </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 space-y-3 mb-6">
                <select
                    value={exerciseId}
                    onChange={(e) => setExerciseId(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg p-3"
                >
                    <option value="">Choose exercise...</option>
                    {exercises.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.name}
                        </option>
                    ))}
                </select>
                {lastTime && lastTime.length > 0 && (
                    <p className="text-sm text-gray-400">
                        Last time: {lastTime.map((s) => `${s.weight}×${s.reps}`).join(', ')}
                    </p>
                )}

                <div className="flex gap-3">
                    <input
                        type="number"
                        inputMode="decimal"
                        placeholder="Weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-1/2 bg-gray-700 rounded-lg p-3"
                    />
                    <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Reps"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="w-1/2 bg-gray-700 rounded-lg p-3"
                    />
                </div>

                <button
                    onClick={handleAdd}
                    disabled={!canAdd}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 text-black font-semibold py-3 rounded-lg"
                >
                    Add Set
                </button>
            </div>

            <div className="space-y-4">
                {[...grouped.entries()].map(([exId, exSets]) => (
                    <div key={exId} className="bg-gray-800 rounded-xl p-4">
                        <h2 className="font-semibold mb-2">{nameById.get(exId)}</h2>
                        <ul className="space-y-1">
                            {exSets?.map((s) => (
                                <li key={s.id} className="flex justify-between text-sm">
                                    <span>
                                        Set {s.setNumber}: {s.weight} × {s.reps}
                                    </span>
                                    <button
                                        onClick={() => deleteSet(s.id)}
                                        className="text-gray-400 hover:text-red-400"
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}