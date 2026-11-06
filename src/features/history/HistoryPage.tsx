import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import type { SetEntry } from '../../db/types'

export default function HistoryPage() {
    const history = useLiveQuery(async () => {
        const workouts = await db.workouts
            .filter((w) => !!w.endedAt && !w.deleted)
            .toArray()
        workouts.sort((a, b) => b.startedAt - a.startedAt)

        const exercises = await db.exercises.toArray()
        const names = new Map(exercises.map((e) => [e.id, e.name]))

        return Promise.all(
            workouts.map(async (workout) => {
                const sets = await db.sets
                    .where('workoutId')
                    .equals(workout.id)
                    .filter((s) => !s.deleted)
                    .sortBy('completedAt')

                const byExercise = new Map<string, SetEntry[]>()
                for (const s of sets) {
                    byExercise.set(s.exerciseId, [...(byExercise.get(s.exerciseId) ?? []), s])
                }

                return {
                    workout,
                    volume: sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
                    groups: [...byExercise.entries()].map(([id, exSets]) => ({
                        name: names.get(id) ?? 'Unknown exercise',
                        sets: exSets,
                    })),
                }
            })
        )
    })

    if (!history) return null

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">History</h1>

            {history.length === 0 && (
                <p className="text-gray-400">No finished workouts yet.</p>
            )}

            <div className="space-y-4">
                {history.map(({ workout, volume, groups }) => {
                    const minutes = Math.round(
                        ((workout.endedAt ?? workout.startedAt) - workout.startedAt) / 60000
                    )
                    return (
                        <div key={workout.id} className="bg-gray-800 rounded-xl p-4">
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold">
                                    {new Date(workout.startedAt).toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                                <span className="text-sm text-gray-400">
                                    {minutes} min · {volume.toLocaleString()} total volume
                                </span>
                            </div>
                            {groups.map((g) => (
                                <div key={g.name} className="mt-2">
                                    <div className="text-sm font-medium">{g.name}</div>
                                    <div className="text-sm text-gray-400">
                                        {g.sets.map((s) => `${s.weight}×${s.reps}`).join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}