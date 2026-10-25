import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { MEMBER_ROLES } from '../models/User';
import type { UserRole } from '../models/User';
import { currentUser, initAuth } from '../services/authState';
import { dashboardPathForRole } from '../utils/roles';

import WelcomePage from '../views/WelcomePage.vue';
import CampaignListPage from '../views/CampaignListPage.vue';
import CampaignDetailsPage from '../views/CampaignDetailsPage.vue';
import TransparencyPage from '../views/TransparencyPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import ForgotPasswordPage from '../views/ForgotPasswordPage.vue';
import NotificationsPage from '../views/NotificationsPage.vue';
import UserDashboardPage from '../views/UserDashboardPage.vue';
import DonationFormPage from '../views/DonationFormPage.vue';
import DonationHistoryPage from '../views/DonationHistoryPage.vue';
import DonationDetailsPage from '../views/DonationDetailsPage.vue';
import MyCampaignsPage from '../views/MyCampaignsPage.vue';
import CreateCampaignPage from '../views/CreateCampaignPage.vue';
import CampaignExpensesPage from '../views/CampaignExpensesPage.vue';
import ExpenseSubmissionPage from '../views/ExpenseSubmissionPage.vue';
import CampaignUpdatesPage from '../views/CampaignUpdatesPage.vue';
import AdminDashboardPage from '../views/AdminDashboardPage.vue';
import AdminCampaignReviewPage from '../views/AdminCampaignReviewPage.vue';
import AdminDonationVerificationPage from '../views/AdminDonationVerificationPage.vue';
import AdminExpenseReviewPage from '../views/AdminExpenseReviewPage.vue';
import AdminUserManagementPage from '../views/AdminUserManagementPage.vue';
import AdminReportsPage from '../views/AdminReportsPage.vue';
import AdminAuditLogsPage from '../views/AdminAuditLogsPage.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/welcome' },

  // Public pages
  { path: '/welcome', name: 'Welcome', component: WelcomePage },
  { path: '/campaigns', name: 'CampaignList', component: CampaignListPage },
  { path: '/campaigns/:id', name: 'CampaignDetails', component: CampaignDetailsPage },
  { path: '/campaigns/:id/transparency', name: 'Transparency', component: TransparencyPage },

  // Guest-only pages (logged-in users are sent to their dashboard)
  { path: '/login', name: 'Login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/admin/login', redirect: '/login' }, // admins use the same login page
  { path: '/register', name: 'Register', component: RegisterPage, meta: { guestOnly: true } },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordPage,
    meta: { guestOnly: true },
  },

  // Any logged-in user
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsPage,
    meta: { requiresAuth: true },
  },

  // Regular accounts: they can both donate and run campaigns
  {
    path: '/dashboard',
    name: 'UserDashboard',
    component: UserDashboardPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  { path: '/donor', redirect: '/dashboard' }, // old address
  { path: '/organizer', redirect: '/dashboard' }, // old address
  {
    path: '/campaigns/:id/donate',
    name: 'DonationForm',
    component: DonationFormPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/donor/donations',
    name: 'DonationHistory',
    component: DonationHistoryPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/donor/donations/:id',
    name: 'DonationDetails',
    component: DonationDetailsPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/organizer/campaigns',
    name: 'MyCampaigns',
    component: MyCampaignsPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/organizer/campaigns/new',
    name: 'CreateCampaign',
    component: CreateCampaignPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/organizer/campaigns/:id/edit',
    name: 'EditCampaign',
    component: CreateCampaignPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/organizer/campaigns/:id/expenses',
    name: 'CampaignExpenses',
    component: CampaignExpensesPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/organizer/campaigns/:id/expenses/new',
    name: 'AddExpense',
    component: ExpenseSubmissionPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/organizer/campaigns/:id/expenses/:expenseId/edit',
    name: 'EditExpense',
    component: ExpenseSubmissionPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },
  {
    path: '/organizer/campaigns/:id/updates',
    name: 'CampaignUpdates',
    component: CampaignUpdatesPage,
    meta: { requiresAuth: true, roles: MEMBER_ROLES },
  },

  // Administrator pages
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboardPage,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/campaigns',
    name: 'AdminCampaignReview',
    component: AdminCampaignReviewPage,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/donations',
    name: 'AdminDonationVerification',
    component: AdminDonationVerificationPage,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/expenses',
    name: 'AdminExpenseReview',
    component: AdminExpenseReviewPage,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/users',
    name: 'AdminUserManagement',
    component: AdminUserManagementPage,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: AdminReportsPage,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/audit-logs',
    name: 'AdminAuditLogs',
    component: AdminAuditLogsPage,
    meta: { requiresAuth: true, roles: ['admin'] },
  },

  // Anything else goes back to the Welcome page (keep this last)
  { path: '/:pathMatch(.*)*', redirect: '/welcome' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  // Wait until Firebase has told us whether someone is logged in
  await initAuth();
  const user = currentUser.value;

  if (to.meta.requiresAuth && !user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && user) {
    return dashboardPathForRole(user.role);
  }

  const allowedRoles = to.meta.roles as UserRole[] | undefined;
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return dashboardPathForRole(user.role);
  }

  return true;
});

export default router;