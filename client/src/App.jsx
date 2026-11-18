import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import StudentPage from './pages/StudentPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<StudentPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
