import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import WorkoutLogger from './features/workout/WorkoutLogger'
import HistoryPage from './features/history/HistoryPage'
import RestTimer from './features/workout/RestTimer'
import ProgressPage from './features/progress/ProgressPage'


const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex-1 text-center py-4 font-semibold ${isActive ? 'text-green-400' : 'text-gray-400'
  }`

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        <Routes>
          <Route path="/" element={<WorkoutLogger />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Routes>

        <RestTimer />

        <nav className="fixed bottom-0 inset-x-0 bg-gray-800 border-t border-gray-700 flex">
          <NavLink to="/" end className={linkClass}>
            Workout
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            History
          </NavLink>
          <NavLink to="/progress" className={linkClass}>   {/* <-- NEW LINES */}
            Progress
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  )
}