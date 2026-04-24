import { createBrowserRouter } from 'react-router-dom'

import { Root, RootErrorBoundary } from '@/routes/root'
import { PublicLayout } from '@/routes/_public/_layout'
import { LandingPage } from '@/routes/_public/landing'
import { AboutPage } from '@/routes/_public/about'
import { ApplyFirmPage, ApplyFirmThanksPage } from '@/routes/_public/apply-firm'
import { AuthLayout } from '@/routes/_auth/_layout'
import { SignInPage } from '@/routes/_auth/sign-in'
import { SignUpPage } from '@/routes/_auth/sign-up'
import { VerifyPage } from '@/routes/_auth/verify'
import { ResetPasswordPage } from '@/routes/_auth/reset-password'
import { CallbackPage } from '@/routes/_auth/callback'
import { MemberLayout } from '@/routes/_member/_layout'
import { MemberDashboardPage } from '@/routes/_member/dashboard'
import { MemberProfilePage } from '@/routes/_member/profile'
import { MemberRenewalPage } from '@/routes/_member/renewal'
import { RegisterIndividualPage } from '@/routes/_member/register/individual'
import { RegisterGuestPage } from '@/routes/_member/register/guest'
import { FirmAdminLayout } from '@/routes/_firm/_layout'
import { FirmAdminDashboardPage } from '@/routes/_firm/dashboard'
import { FirmEmployeesPage } from '@/routes/_firm/employees'
import { AdminLayout } from '@/routes/_admin/_layout'
import { AdminDashboardPage } from '@/routes/_admin/dashboard'
import { AdminApprovalsPage } from '@/routes/_admin/approvals'
import { AdminProfileChangesPage } from '@/routes/_admin/profile-changes'
import { AdminFirmApplicationsPage } from '@/routes/_admin/firm-applications'

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
          { path: 'apply-firm', element: <ApplyFirmPage /> },
          { path: 'apply-firm/thanks', element: <ApplyFirmThanksPage /> },
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
          { path: 'register/guest', element: <RegisterGuestPage /> },
        ],
      },
      {
        element: <MemberLayout />,
        children: [
          { path: 'dashboard', element: <MemberDashboardPage /> },
          { path: 'profile', element: <MemberProfilePage /> },
          { path: 'renewal', element: <MemberRenewalPage /> },
        ],
      },
      {
        path: 'firm',
        element: <FirmAdminLayout />,
        children: [
          { index: true, element: <FirmAdminDashboardPage /> },
          { path: 'dashboard', element: <FirmAdminDashboardPage /> },
          { path: 'employees', element: <FirmEmployeesPage /> },
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
          { path: 'firm-applications', element: <AdminFirmApplicationsPage /> },
        ],
      },
    ],
  },
])
