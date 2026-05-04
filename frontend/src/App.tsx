import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import AuthPage from './pages/AuthPage'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import CompanyDetailPage from './pages/CompanyDetailPage'
import ExperienceForm from './pages/ExperienceForm'
import AdminPanel from './pages/AdminPanel'
import AdminLoginPage from './pages/AdminLoginPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import IntroAnimation from './components/IntroAnimation'

function App() {
  const { isAuthenticated } = useAuthStore()
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    // Check if intro has been shown before
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro')
    if (hasSeenIntro === 'true') {
      setShowIntro(false)
    }
  }, [])

  const handleIntroComplete = () => {
    setShowIntro(false)
    sessionStorage.setItem('hasSeenIntro', 'true')
  }

  return (
    <Router>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:companyName"
          element={
            <ProtectedRoute>
              <CompanyDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience/new"
          element={
            <ProtectedRoute>
              <Layout>
                <ExperienceForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <ExperienceForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Layout>
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
