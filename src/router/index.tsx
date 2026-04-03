import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spinner } from '@/components/ui/Badge'
import { ProtectedRoute, GuestRoute } from '@/components/auth/ProtectedRoute'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const ExplorePage = lazy(() => import('@/pages/ExplorePage').then(m => ({ default: m.ExplorePage })))
const CampaignDetailPage = lazy(() => import('@/pages/CampaignDetailPage').then(m => ({ default: m.CampaignDetailPage })))
const CreateCampaignPage = lazy(() => import('@/pages/CreateCampaignPage').then(m => ({ default: m.CreateCampaignPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/SignupPage').then(m => ({ default: m.SignupPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

import { RootLayout } from '@/pages/RootLayout'

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-deep">
        <Spinner size="lg" />
      </div>
    }>
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <PageSuspense><HomePage /></PageSuspense>,
      },
      {
        path: 'explore',
        element: <PageSuspense><ExplorePage /></PageSuspense>,
      },
      {
        path: 'campaigns/:slug',
        element: <PageSuspense><CampaignDetailPage /></PageSuspense>,
      },
      {
        path: 'login',
        element: <PageSuspense><GuestRoute><LoginPage /></GuestRoute></PageSuspense>,
      },
      {
        path: 'signup',
        element: <PageSuspense><GuestRoute><SignupPage /></GuestRoute></PageSuspense>,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'campaigns/new',
            element: <PageSuspense><CreateCampaignPage /></PageSuspense>,
          },
          {
            path: 'dashboard',
            element: <PageSuspense><DashboardPage /></PageSuspense>,
          },
          {
            path: 'profile/:username',
            element: <PageSuspense><ProfilePage /></PageSuspense>,
          },
        ],
      },
      {
        path: '*',
        element: <PageSuspense><NotFoundPage /></PageSuspense>,
      },
    ],
  },
])
