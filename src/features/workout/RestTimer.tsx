import { useEffect, useState } from 'react'
import { useRestTimer } from './restTimerStore'

export default function RestTimer() {
    const endsAt = useRestTimer((s) => s.endsAt)
    const add = useRestTimer((s) => s.add)
    const stop = useRestTimer((s) => s.stop)
    const [now, setNow] = useState(Date.now())

    // Tick while a timer is running
    useEffect(() => {
        if (!endsAt) return
        setNow(Date.now())
        const id = setInterval(() => setNow(Date.now()), 250)
        return () => clearInterval(id)
    }, [endsAt])

    const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0

    // Finish: buzz (where supported) and clear
    useEffect(() => {
        if (endsAt && remaining === 0) {
            navigator.vibrate?.(300)
            stop()
        }
    }, [endsAt, remaining, stop])

    if (!endsAt) return null

    const minutes = Math.floor(remaining / 60)
    const seconds = String(remaining % 60).padStart(2, '0')

    return (
        <div className="fixed bottom-16 inset-x-0 px-4">
            <div className="max-w-md mx-auto bg-gray-800 border border-gray-700 rounded-xl p-3 flex items-center justify-between shadow-lg">
                <div>
                    <div className="text-xs text-gray-400">Rest</div>
                    <div className="text-2xl font-bold tabular-nums">
                        {minutes}:{seconds}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => add(15)}
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-semibold"
                    >
                        +15s
                    </button>
                    <button
                        onClick={stop}
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-semibold"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    )
}