import { createBrowserRouter } from 'react-router-dom'

import { Root, RootErrorBoundary } from '@/routes/root'
import { PublicLayout } from '@/routes/_public/_layout'
import { LandingPage } from '@/routes/_public/landing'
import { AboutPage } from '@/routes/_public/about'
import { AuthLayout } from '@/routes/_auth/_layout'
import { SignInPage } from '@/routes/_auth/sign-in'
import { SignUpPage } from '@/routes/_auth/sign-up'
import { VerifyPage } from '@/routes/_auth/verify'
import { ResetPasswordPage } from '@/routes/_auth/reset-password'
import { CallbackPage } from '@/routes/_auth/callback'
import { MemberLayout } from '@/routes/_member/_layout'
import { MemberDashboardPage } from '@/routes/_member/dashboard'
import { MemberProfilePage } from '@/routes/_member/profile'
import { RegisterIndividualPage } from '@/routes/_member/register/individual'
import { RegisterFirmAdminPage } from '@/routes/_member/register/firm-admin'
import { RegisterGuestPage } from '@/routes/_member/register/guest'
import { AdminLayout } from '@/routes/_admin/_layout'
import { AdminDashboardPage } from '@/routes/_admin/dashboard'
import { AdminApprovalsPage } from '@/routes/_admin/approvals'
import { AdminProfileChangesPage } from '@/routes/_admin/profile-changes'

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'about', element: <AboutPage /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'sign-in', element: <SignInPage /> },
          { path: 'sign-up', element: <SignUpPage /> },
          { path: 'verify', element: <VerifyPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
          { path: 'auth/callback', element: <CallbackPage /> },
          { path: 'register/individual', element: <RegisterIndividualPage /> },
          { path: 'register/firm-admin', element: <RegisterFirmAdminPage /> },
          { path: 'register/guest', element: <RegisterGuestPage /> },
        ],
      },
      {
        element: <MemberLayout />,
        children: [
          { path: 'dashboard', element: <MemberDashboardPage /> },
          { path: 'profile', element: <MemberProfilePage /> },
        ],
      },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'approvals', element: <AdminApprovalsPage /> },
          { path: 'profile-changes', element: <AdminProfileChangesPage /> },
        ],
      },
    ],
  },
])
