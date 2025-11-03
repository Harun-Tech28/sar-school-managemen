import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/RoleGuard'
import { LoginPage } from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { TeacherDashboard } from '@/pages/TeacherDashboard'
import { StudentDashboard } from '@/pages/StudentDashboard'
import { ParentDashboard } from '@/pages/ParentDashboard'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Component to handle role-based redirection
const RoleBasedRedirect = () => {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect based on role
  switch (role) {
    case 'admin':
      return <Navigate to="/admin" replace />
    case 'teacher':
      return <Navigate to="/teacher" replace />
    case 'student':
      return <Navigate to="/student" replace />
    case 'parent':
      return <Navigate to="/parent" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes with role-based access */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/*"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/parent/*"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['parent']}>
                    <ParentDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Root route - redirect based on role */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
