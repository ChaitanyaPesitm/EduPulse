import { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'

import LandingPage from './pages/LandingPage'
import StudentLogin from './pages/StudentLogin'
import TeacherLogin from './pages/TeacherLogin'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'

// Redirect authenticated users away from public pages
function PublicRoute({ children }) {
  const { user } = useContext(AuthContext)
  if (user) return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
  return children
}

// Protect private pages — redirect to landing if not logged in
function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext)
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/student-login" element={<PublicRoute><StudentLogin /></PublicRoute>} />
      <Route path="/teacher-login" element={<PublicRoute><TeacherLogin /></PublicRoute>} />

      {/* Legacy /login still works → redirect to landing */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {/* Protected */}
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
