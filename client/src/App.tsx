import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './state/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/dashboard/Home'
import MembersPage from './pages/members/MembersPage'
import ProjectsPage from './pages/projects/ProjectsPage'
import BoardPage from './pages/projects/BoardPage'
import TasksPage from './pages/tasks/TasksPage'
import AdminPage from './pages/admin/AdminPage'
import ProfilePage from './pages/profile/ProfilePage'
import AppLayout from './components/layout/AppLayout'
import CompaniesNetworkPage from './pages/network/CompaniesNetworkPage'
import PerformanceAnalyticsPage from './pages/analytics/PerformanceAnalyticsPage'
import FeedbackSubmissionForm from './components/Feedback/FeedbackSubmissionForm'
import UserFeedbackDashboard from './components/Feedback/UserFeedbackDashboard'
import AdminFeedbackDashboard from './components/Feedback/AdminFeedbackDashboard'

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const loc = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <Protected>
              <AppLayout>
                <Home />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/members"
          element={
            <Protected>
              <AppLayout>
                <MembersPage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/projects"
          element={
            <Protected>
              <AppLayout>
                <ProjectsPage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/projects/board"
          element={
            <Protected>
              <AppLayout>
                <BoardPage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/tasks"
          element={
            <Protected>
              <AppLayout>
                <TasksPage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Protected>
              <AppLayout>
                <AdminPage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/network"
          element={
            <Protected>
              <AppLayout>
                <CompaniesNetworkPage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/analytics"
          element={
            <Protected>
              <AppLayout>
                <PerformanceAnalyticsPage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/performance"
          element={
            <Protected>
              <AppLayout>
                <PerformanceAnalyticsPage />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/feedback/submit"
          element={
            <Protected>
              <AppLayout>
                <FeedbackSubmissionForm />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/feedback/my-feedback"
          element={
            <Protected>
              <AppLayout>
                <UserFeedbackDashboard />
              </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <Protected>
              <AppLayout>
                <AdminFeedbackDashboard />
              </AppLayout>
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
