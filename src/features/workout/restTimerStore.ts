import { create } from 'zustand'

interface RestTimerState {
    endsAt: number | null
    start: (seconds: number) => void
    add: (seconds: number) => void
    stop: () => void
}

export const useRestTimer = create<RestTimerState>((set) => ({
    endsAt: null,
    start: (seconds) => set({ endsAt: Date.now() + seconds * 1000 }),
    add: (seconds) =>
        set((s) => (s.endsAt ? { endsAt: s.endsAt + seconds * 1000 } : s)),
    stop: () => set({ endsAt: null }),
}))