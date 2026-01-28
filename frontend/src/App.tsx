import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './components/auth-layout'
import LoginForm from './components/login-form'
import RegisterForm from './components/register-form'
import KanbanBoard from './components/kanban-board'
import Dashboard from './components/dashboard'
import CalendarView from './components/calendar-view'
import CommandPalette from './components/command-palette'
import ProfilePage from './components/profile-page'
import ActivityLogs from './components/activity-logs'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <AuthLayout>
            <LoginForm />
          </AuthLayout>
        } />
        <Route path="/signup" element={
          <AuthLayout>
            <RegisterForm />
          </AuthLayout>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <KanbanBoard />
            <CommandPalette />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarView />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/logs" element={
          <ProtectedRoute>
            <ActivityLogs />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
