import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts'
import { db } from '../../db/db'
import { bestOneRMByDay, weeklyVolume, estimate1RM } from '../../lib/calc'

const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const tooltipStyle = {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: 8,
    color: '#fff',
}

export default function ProgressPage() {
    const [exerciseId, setExerciseId] = useState('')

    const exercises = useLiveQuery(() =>
        db.exercises.orderBy('name').filter((e) => !e.deleted).toArray()
    )

    const exerciseSets = useLiveQuery(
        async () =>
            exerciseId
                ? await db.sets
                    .where('exerciseId')
                    .equals(exerciseId)
                    .filter((s) => !s.deleted)
                    .toArray()
                : [],
        [exerciseId]
    )

    const allSets = useLiveQuery(() => db.sets.filter((s) => !s.deleted).toArray())

    if (!exercises || !exerciseSets || !allSets) return null

    const oneRMData = bestOneRMByDay(exerciseSets).map((d) => ({
        label: formatDate(d.date),
        oneRM: Math.round(d.oneRM),
    }))

    const volumeData = weeklyVolume(allSets).map((w) => ({
        label: formatDate(w.weekStart),
        volume: w.volume,
    }))

    const heaviest = exerciseSets.reduce((max, s) => Math.max(max, s.weight), 0)
    const best1RM = exerciseSets.reduce(
        (max, s) => Math.max(max, estimate1RM(s.weight, s.reps)),
        0
    )

    return (
        <div className="p-4 max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Progress</h1>

            <section className="space-y-3">
                <select
                    value={exerciseId}
                    onChange={(e) => setExerciseId(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg p-3"
                >
                    <option value="">Choose exercise...</option>
                    {exercises.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.name}
                        </option>
                    ))}
                </select>

                {exerciseId && exerciseSets.length === 0 && (
                    <p className="text-gray-400 text-sm">No sets logged for this exercise yet.</p>
                )}

                {exerciseSets.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800 rounded-xl p-4">
                                <div className="text-xs text-gray-400">Heaviest weight</div>
                                <div className="text-2xl font-bold">{heaviest}</div>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4">
                                <div className="text-xs text-gray-400">Best est. 1RM</div>
                                <div className="text-2xl font-bold">{Math.round(best1RM)}</div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-4">
                            <h2 className="font-semibold mb-2">Estimated 1RM</h2>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={oneRMData}>
                                        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                                        <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Line
                                            type="monotone"
                                            dataKey="oneRM"
                                            stroke="#4ade80"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <section className="bg-gray-800 rounded-xl p-4">
                <h2 className="font-semibold mb-2">Weekly volume (all exercises)</h2>
                {volumeData.length === 0 ? (
                    <p className="text-gray-400 text-sm">Log some sets to see your volume.</p>
                ) : (
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData}>
                                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                                <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="volume" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>
        </div>
    )
}