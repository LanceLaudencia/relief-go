<template>
  <ion-page class="admin-page">
    <!-- Existing admin menu, restyled. Hover on desktop and tap on touch are preserved. -->
    <ion-menu
      content-id="admin-main"
      menu-id="admin-menu"
      type="overlay"
      side="start"
      class="rg-admin-menu"
    >
      <ion-header @mouseenter="cancelClose" @mouseleave="scheduleClose">
        <ion-toolbar class="menu-toolbar">
          <div class="menu-heading">
            <span class="menu-brand">Relief<span>GO</span><sup>♥</sup></span>
            <small>ADMINISTRATION</small>
          </div>
        </ion-toolbar>
      </ion-header>

      <ion-content class="menu-content" @mouseenter="cancelClose" @mouseleave="scheduleClose">
        <div class="menu-profile">
          <span class="menu-avatar">{{ userInitials }}</span>
          <div>
            <span>ADMINISTRATOR ACCOUNT</span>
            <strong>{{ fullName }}</strong>
          </div>
        </div>
        <p class="menu-label">MANAGEMENT TOOLS</p>
        <ion-list lines="none" class="nav">
          <ion-menu-toggle :auto-hide="true">
            <ion-item button detail="false" router-link="/admin/campaigns" class="menu-link">
              <ion-icon slot="start" :icon="megaphoneOutline" />
              <ion-label>Campaign Management</ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" class="menu-chevron" />
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="true">
            <ion-item button detail="false" router-link="/admin/donations" class="menu-link">
              <ion-icon slot="start" :icon="heartOutline" />
              <ion-label>Verify Donations</ion-label>
              <ion-badge v-if="stats && stats.pendingDonations > 0" slot="end" color="warning">
                {{ stats.pendingDonations }}
              </ion-badge>
              <ion-icon v-else slot="end" :icon="chevronForwardOutline" class="menu-chevron" />
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="true">
            <ion-item button detail="false" router-link="/admin/expenses" class="menu-link">
              <ion-icon slot="start" :icon="receiptOutline" />
              <ion-label>Review Expenses</ion-label>
              <ion-badge v-if="stats && stats.pendingExpenses > 0" slot="end" color="warning">
                {{ stats.pendingExpenses }}
              </ion-badge>
              <ion-icon v-else slot="end" :icon="chevronForwardOutline" class="menu-chevron" />
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="true">
            <ion-item button detail="false" router-link="/admin/users" class="menu-link">
              <ion-icon slot="start" :icon="peopleOutline" />
              <ion-label>User Management</ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" class="menu-chevron" />
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="true">
            <ion-item button detail="false" router-link="/admin/reports" class="menu-link">
              <ion-icon slot="start" :icon="barChartOutline" />
              <ion-label>Reports</ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" class="menu-chevron" />
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="true">
            <ion-item button detail="false" router-link="/admin/audit-logs" class="menu-link">
              <ion-icon slot="start" :icon="documentTextOutline" />
              <ion-label>Audit Logs</ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" class="menu-chevron" />
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
        <div class="menu-footer">Small acts. Big hearts. <span>✦</span></div>
      </ion-content>
    </ion-menu>

    <!-- Admin screen -->
    <div class="ion-page" id="admin-main">
      <ion-header class="admin-header">
        <ion-toolbar class="admin-toolbar">
          <div class="navbar-inner">
            <div class="navbar-left">
              <ion-button
                class="menu-trigger"
                fill="clear"
                aria-label="Open administration menu"
                @pointerenter="onButtonHover"
                @pointerleave="onButtonLeave"
                @click="toggleMenu"
              >
                <ion-icon slot="icon-only" :icon="menuOutline" />
              </ion-button>
              <router-link class="brand" to="/welcome">Relief<span>GO</span><sup>♥</sup></router-link>
              <span class="brand-divider"></span>
              <span class="page-label">ADMIN DASHBOARD</span>
            </div>
            <div class="navbar-right">
              <div class="topbar-user" aria-label="Administrator profile">
                <span class="topbar-avatar">{{ userInitials }}</span>
                <span class="topbar-identity"><strong>{{ fullName }}</strong><small>ADMINISTRATOR</small></span>
              </div>
              <ion-button class="logout-button" fill="outline" @click="handleLogout">
                <ion-icon slot="start" :icon="logOutOutline" />
                <span>LOG OUT</span>
              </ion-button>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

      <ion-content class="admin-content">
        <div class="dashboard-wrap">
          <section class="welcome-banner" aria-labelledby="admin-welcome-heading">
            <div class="welcome-text">
              <p class="eyebrow gold-text">YOUR BAYANIHAN COMMAND CENTER ✦</p>
              <h1 id="admin-welcome-heading">Hello, <em>{{ firstName }}!</em></h1>
              <p>Oversee every campaign, protect every donation, and help kindness reach the people who need it.</p>
              <div class="hero-actions">
                <router-link to="/admin/donations">
                  <ion-icon :icon="checkmarkCircleOutline" /> Verify Donations
                  <ion-icon :icon="arrowForwardOutline" />
                </router-link>
                <router-link to="/admin/reports">
                  View Reports <ion-icon :icon="arrowForwardOutline" />
                </router-link>
              </div>
            </div>
            <div class="hero-admin-card">
              <span class="hero-avatar">{{ userInitials }}</span>
              <div>
                <span class="eyebrow gold-text">ADMINISTRATOR ACCOUNT</span>
                <strong>{{ fullName }}</strong>
                <small>ReliefGO platform management</small>
              </div>
            </div>
          </section>

          <div v-if="loading" class="state-box" role="status">
            <ion-spinner name="crescent" />
            <h2>Gathering your dashboard</h2>
            <p>Loading verified figures and campaign insights...</p>
          </div>

          <div v-else-if="errorMessage" class="state-box error-state" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h2>Something went wrong</h2>
            <p>{{ errorMessage }}</p>
          </div>

          <template v-else-if="stats && charts">
            <section class="overview-section" aria-labelledby="overview-heading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">AT A GLANCE</p>
                  <h2 id="overview-heading">Your platform <em>overview.</em></h2>
                  <p>Current figures based on your ReliefGO records.</p>
                </div>
                <router-link to="/admin/reports" class="section-link">VIEW REPORTS <ion-icon :icon="arrowForwardOutline" /></router-link>
              </div>

              <div class="stat-grid">
                <router-link to="/admin/users" class="stat-card">
                  <ion-icon :icon="peopleOutline" class="stat-icon" />
                  <span class="stat-label">REGISTERED USERS</span>
                  <strong>{{ stats.totalUsers }}</strong>
                  <small>Total registered accounts</small>
                  <ion-icon :icon="arrowForwardOutline" class="stat-arrow" />
                </router-link>
                <router-link to="/admin/campaigns" class="stat-card">
                  <ion-icon :icon="megaphoneOutline" class="stat-icon" />
                  <span class="stat-label">ACTIVE CAMPAIGNS</span>
                  <strong>{{ stats.activeCampaigns }}</strong>
                  <small>Live fundraising efforts</small>
                  <ion-icon :icon="arrowForwardOutline" class="stat-arrow" />
                </router-link>
                <router-link to="/admin/donations" class="stat-card">
                  <ion-icon :icon="heartOutline" class="stat-icon" />
                  <span class="stat-label">VERIFIED DONATIONS</span>
                  <strong>{{ formatPeso(stats.verifiedDonationsTotal) }}</strong>
                  <small>Confirmed giving to date</small>
                  <ion-icon :icon="arrowForwardOutline" class="stat-arrow" />
                </router-link>
                <router-link to="/admin/donations" class="stat-card attention-card">
                  <ion-icon :icon="timeOutline" class="stat-icon" />
                  <span class="stat-label">DONATIONS TO VERIFY</span>
                  <strong>{{ stats.pendingDonations }}</strong>
                  <small>Awaiting verification</small>
                  <ion-icon :icon="arrowForwardOutline" class="stat-arrow" />
                </router-link>
                <router-link to="/admin/expenses" class="stat-card attention-card">
                  <ion-icon :icon="warningOutline" class="stat-icon" />
                  <span class="stat-label">EXPENSES TO REVIEW</span>
                  <strong>{{ stats.pendingExpenses }}</strong>
                  <small>Awaiting review</small>
                  <ion-icon :icon="arrowForwardOutline" class="stat-arrow" />
                </router-link>
                <router-link to="/admin/expenses" class="stat-card">
                  <ion-icon :icon="walletOutline" class="stat-icon" />
                  <span class="stat-label">APPROVED EXPENSES</span>
                  <strong>{{ formatPeso(stats.approvedExpensesTotal) }}</strong>
                  <small>Documented and approved</small>
                  <ion-icon :icon="arrowForwardOutline" class="stat-arrow" />
                </router-link>
              </div>
            </section>

            <section class="deadline-card" aria-labelledby="deadline-heading">
              <div class="deadline-icon"><ion-icon :icon="timeOutline" /></div>
              <div class="deadline-content">
                <div class="deadline-heading-row">
                  <div>
                    <p class="eyebrow">TIMELY OVERSIGHT</p>
                    <h2 id="deadline-heading">Campaigns nearing <em>their deadline.</em></h2>
                    <p>Active campaigns ending within the next 7 days</p>
                  </div>
                  <router-link to="/admin/campaigns" class="section-link">MANAGE CAMPAIGNS <ion-icon :icon="arrowForwardOutline" /></router-link>
                </div>
                <p v-if="stats.nearingDeadline.length === 0" class="empty-deadline">
                  <ion-icon :icon="checkmarkCircleOutline" /> No campaigns are ending this week.
                </p>
                <ion-list v-else lines="none" class="deadline-list">
                  <ion-item
                    v-for="item in stats.nearingDeadline"
                    :key="item.id"
                    button
                    detail="false"
                    :router-link="`/campaigns/${item.id}`"
                    class="deadline-item"
                  >
                    <ion-icon slot="start" :icon="megaphoneOutline" />
                    <ion-label>{{ item.title }}</ion-label>
                    <ion-note slot="end">{{ item.days }} {{ item.days === 1 ? 'day' : 'days' }} left</ion-note>
                    <ion-icon slot="end" :icon="chevronForwardOutline" />
                  </ion-item>
                </ion-list>
              </div>
            </section>

            <section class="insights-section" aria-labelledby="insights-heading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">THE BIGGER PICTURE</p>
                  <h2 id="insights-heading">Insights & <em>accountability.</em></h2>
                  <p>Explore donation trends, campaign activity, and responsible distribution.</p>
                </div>
                <router-link to="/admin/reports" class="section-link">OPEN FULL REPORTS <ion-icon :icon="arrowForwardOutline" /></router-link>
              </div>

              <div class="chart-grid">
                <article class="chart-card">
                  <header class="chart-heading">
                    <div><p class="chart-kicker">DONATION TRENDS</p><h3>Verified donations by month</h3></div>
                    <span class="chart-icon"><ion-icon :icon="barChartOutline" /></span>
                  </header>
                  <div v-if="hasMonthly" class="chart-box"><Bar :data="monthlyChart" :options="barOptions" /></div>
                  <p v-else class="chart-empty">No verified donations in the last 6 months.</p>
                </article>

                <article class="chart-card">
                  <header class="chart-heading">
                    <div><p class="chart-kicker">CAUSES WE SUPPORT</p><h3>Campaigns by category</h3></div>
                    <span class="chart-icon"><ion-icon :icon="megaphoneOutline" /></span>
                  </header>
                  <div v-if="charts.categories.length > 0" class="chart-box"><Doughnut :data="categoryChart" :options="doughnutOptions" /></div>
                  <p v-else class="chart-empty">No campaigns yet.</p>
                </article>

                <article class="chart-card">
                  <header class="chart-heading">
                    <div><p class="chart-kicker">FUNDRAISING OVERVIEW</p><h3>Fundraising progress</h3><small>Top live campaigns: raised vs. goal</small></div>
                    <span class="chart-icon"><ion-icon :icon="shieldCheckmarkOutline" /></span>
                  </header>
                  <div v-if="charts.progress.length > 0" class="chart-box"><Bar :data="progressChart" :options="progressOptions" /></div>
                  <p v-else class="chart-empty">No active campaigns yet.</p>
                </article>

                <article class="chart-card">
                  <header class="chart-heading">
                    <div><p class="chart-kicker">VERIFICATION TRACKER</p><h3>Donation statuses</h3></div>
                    <span class="chart-icon"><ion-icon :icon="checkmarkCircleOutline" /></span>
                  </header>
                  <div v-if="charts.statuses.length > 0" class="chart-box"><Doughnut :data="statusChart" :options="doughnutOptions" /></div>
                  <p v-else class="chart-empty">No donations yet.</p>
                </article>

                <article class="chart-card">
                  <header class="chart-heading">
                    <div><p class="chart-kicker">RESOURCE ALLOCATION</p><h3>Verified expenses by category</h3></div>
                    <span class="chart-icon"><ion-icon :icon="receiptOutline" /></span>
                  </header>
                  <div v-if="charts.expenseCategories.length > 0" class="chart-box"><Doughnut :data="expenseChart" :options="doughnutOptions" /></div>
                  <p v-else class="chart-empty">No verified expenses yet.</p>
                </article>
              </div>
            </section>
          </template>
          <footer class="admin-footer">
            <span>Relief<span class="footer-go">GO</span> ♥</span>
            <small>Stories of bayanihan live here.</small>
          </footer>
        </div>
      </ion-content>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonMenu,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonButton,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonSpinner,
  menuController,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline,
  logOutOutline,
  menuOutline,
  peopleOutline,
  megaphoneOutline,
  heartOutline,
  timeOutline,
  receiptOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
  barChartOutline,
  documentTextOutline,
  walletOutline,
  warningOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { Bar, Doughnut } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';
import { CHART_COLORS } from '../utils/chartSetup';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import {
  computeAdminCharts,
  computeAdminStats,
  loadAdminData,
} from '../services/adminDataService';
import type { AdminCharts, AdminStats } from '../services/adminDataService';
import { formatPeso } from '../utils/format';

const router = useRouter();

const fullName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Admin');
const firstName = computed(() => fullName.value.split(/\s+/)[0] || 'Admin');
const userInitials = computed(() => {
  const words = fullName.value.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0]![0]! + words[words.length - 1]![0]! : words[0]?.slice(0, 2) || 'AD').toUpperCase();
});

const stats = ref<AdminStats | null>(null);
const charts = ref<AdminCharts | null>(null);
const loading = ref(true);
const errorMessage = ref('');

onIonViewWillEnter(async () => {
  if (!stats.value) loading.value = true;
  errorMessage.value = '';

  try {
    const data = await loadAdminData();
    stats.value = computeAdminStats(data);
    charts.value = computeAdminCharts(data);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the dashboard.';
  } finally {
    loading.value = false;
  }
});

/* ---------- Sidebar hover / toggle ---------- */

const MENU_ID = 'admin-menu';
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function cancelClose() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = undefined;
}

function scheduleClose() {
  cancelClose();
  closeTimer = setTimeout(() => {
    menuController.close(MENU_ID);
  }, 250);
}

// Hover only applies to a mouse; touch devices use the tap (click) instead.
function onButtonHover(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return;
  cancelClose();
  menuController.open(MENU_ID);
}

function onButtonLeave(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return;
  scheduleClose();
}

function toggleMenu() {
  cancelClose();
  menuController.toggle(MENU_ID);
}

async function handleLogout() {
  await logoutUser();
  router.replace('/welcome');
}

/* ---------- Chart data ---------- */

const hasMonthly = computed(() => charts.value?.monthly.some((m) => m.value > 0) ?? false);

const monthlyChart = computed<ChartData<'bar'>>(() => ({
  labels: charts.value?.monthly.map((m) => m.label) ?? [],
  datasets: [
    {
      label: 'Verified donations (₱)',
      data: charts.value?.monthly.map((m) => m.value) ?? [],
      backgroundColor: '#c66b46',
      borderRadius: 6,
    },
  ],
}));

const progressChart = computed<ChartData<'bar'>>(() => ({
  labels: charts.value?.progress.map((p) => p.label) ?? [],
  datasets: [
    {
      label: 'Raised (₱)',
      data: charts.value?.progress.map((p) => p.raised) ?? [],
      backgroundColor: '#183c2c',
      borderRadius: 4,
    },
    {
      label: 'Goal (₱)',
      data: charts.value?.progress.map((p) => p.goal) ?? [],
      backgroundColor: '#e7c77f',
      borderRadius: 4,
    },
  ],
}));

function doughnutData(items: { label: string; value: number }[] | undefined): ChartData<'doughnut'> {
  return {
    labels: items?.map((item) => item.label) ?? [],
    datasets: [
      {
        data: items?.map((item) => item.value) ?? [],
        backgroundColor: CHART_COLORS,
      },
    ],
  };
}

const categoryChart = computed(() => doughnutData(charts.value?.categories));
const statusChart = computed(() => doughnutData(charts.value?.statuses));
const expenseChart = computed(() => doughnutData(charts.value?.expenseCategories));

const barOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
};

const progressOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: { legend: { position: 'bottom' } },
  scales: { x: { beginAtZero: true } },
};

const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
};
</script>

<style scoped>
/* ReliefGO brand system — styling only. The admin services and chart data remain untouched. */
.admin-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --paper: #fffaf0;
  --gold: #e8ae4c;
  --terracotta: #c66b46;
  --border: #e9ddc7;
  --muted: #697568;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  color: var(--forest);
  background: var(--cream);
}
.admin-page * { box-sizing: border-box; }
.admin-page h1, .admin-page h2, .admin-page h3, .admin-page p { margin-top: 0; }
.admin-page h1, .admin-page h2, .admin-page h3, .admin-page .brand,
.admin-page .menu-brand { font-family: Georgia, 'Times New Roman', serif; }
.admin-page a { text-decoration: none; }

/* Navbar */
.admin-header { box-shadow: none; }
.admin-header::after { display: none; }
.admin-toolbar {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-start: 0;
  --padding-end: 0;
  --min-height: 73px;
  border-bottom: 1px solid var(--border);
}
.navbar-inner {
  min-height: 72px;
  width: 100%;
  padding: 7px clamp(17px, 3.2vw, 55px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.navbar-left, .navbar-right { display: flex; align-items: center; gap: 14px; min-width: 0; }
.menu-trigger { --color: var(--forest); --padding-start: 5px; --padding-end: 5px; margin: 0; font-size: 23px; }
.brand { font-size: clamp(25px, 2.1vw, 33px); line-height: 1; letter-spacing: -1.9px; color: var(--forest); font-weight: 700; white-space: nowrap; }
.brand span, .brand sup { color: var(--terracotta); }
.brand sup { font-size: 12px; margin-left: 2px; vertical-align: top; }
.brand-divider { width: 1px; height: 23px; background: #d9ccb4; margin-left: 4px; }
.page-label { white-space: nowrap; font-size: 10px; font-weight: 800; letter-spacing: 1.25px; }
.topbar-user { display: flex; align-items: center; gap: 10px; }
.topbar-avatar { display: flex; align-items: center; justify-content: center; width: 39px; height: 39px; border-radius: 50%; background: var(--gold); color: var(--deep); font: 700 14px Georgia, serif; flex: none; }
.topbar-identity { display: flex; flex-direction: column; line-height: 1.3; gap: 4px; }
.topbar-identity strong { font-size: 12px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.topbar-identity small { font-size: 9px; letter-spacing: 1.2px; font-weight: 800; color: var(--terracotta); }
.logout-button { --background: transparent; --color: var(--forest); --border-color: #cfbf9f; --border-width: 1px; --border-radius: 24px; --box-shadow: none; font-weight: 800; font-size: 10px; letter-spacing: 1px; min-height: 37px; }
.logout-button:hover { --background: #efe8d6; }

/* Sidebar */
.rg-admin-menu { --width: min(355px, 87vw); --background: var(--cream); }
.rg-admin-menu::part(container) { border-radius: 0 24px 24px 0; box-shadow: 7px 0 35px rgba(16,42,32,.17); }
.menu-toolbar { --background: var(--forest); --min-height: 108px; }
.menu-heading { padding: 20px 25px; display: flex; flex-direction: column; gap: 7px; }
.menu-brand { font-size: 30px; font-weight: 700; letter-spacing: -1.5px; color: #fff8e7; }
.menu-brand span, .menu-brand sup { color: var(--gold); }
.menu-brand sup { font-size: 13px; margin-left: 3px; }
.menu-heading small { font-size: 9px; color: #e8c77f; font-weight: 800; letter-spacing: 2px; }
.menu-content { --background: #f8f3e4; --padding-top: 20px; }
.menu-profile { margin: 0 18px 28px; padding: 17px; border: 1px solid var(--border); border-radius: 18px; display: flex; gap: 13px; align-items: center; background: #fffaf0; }
.menu-avatar { width: 49px; height: 49px; display: grid; place-items: center; flex: none; background: var(--gold); border-radius: 50%; font: 700 18px Georgia, serif; color: var(--deep); }
.menu-profile > div { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.menu-profile > div span { font-size: 9px; font-weight: 800; letter-spacing: 1px; color: var(--terracotta); }
.menu-profile strong { font-family: Georgia, serif; font-size: 17px; font-weight: 500; overflow-wrap: anywhere; }
.menu-label { margin: 0 29px 12px; font-size: 10px; font-weight: 800; color: var(--terracotta); letter-spacing: 1.8px; }
.nav { padding: 0 13px; background: transparent; }
.menu-link { --background: transparent; --background-hover: #eee1c7; --border-radius: 12px; --padding-start: 15px; --inner-padding-end: 14px; --min-height: 52px; margin-bottom: 4px; font-size: 13px; font-weight: 700; color: var(--forest); }
.menu-link ion-icon[slot="start"] { font-size: 20px; color: var(--terracotta); margin-right: 13px; }
.menu-link .menu-chevron { color: #839285; font-size: 14px; }
.menu-link ion-badge { --background: #e8ae4c; --color: #183c2c; }
.menu-footer { margin: 32px 22px; border-top: 1px solid var(--border); padding: 22px 4px; color: var(--muted); font-family: Georgia, serif; font-style: italic; font-size: 13px; }
.menu-footer span { color: var(--terracotta); }

/* Main page */
.admin-content { --background: #f8f3e4; --padding-top: 0; --padding-bottom: 0; --padding-start: 0; --padding-end: 0; }
.dashboard-wrap { max-width: 1490px; width: 100%; margin: 0 auto; padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 20px; }
.welcome-banner {
  border-radius: 22px;
  min-height: 238px;
  padding: clamp(25px, 3.1vw, 49px) clamp(25px, 4vw, 63px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  overflow: hidden;
  background: radial-gradient(circle at 72% 105%, rgba(232,174,76,.11), transparent 42%), linear-gradient(115deg,#183c2c 0%,#102a20 100%);
  color: #fff8e7;
}
.welcome-text { max-width: 690px; min-width: 0; }
.eyebrow { margin: 0 0 12px; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: var(--terracotta); }
.gold-text { color: #e8ae4c; }
.welcome-text h1 { font-size: clamp(35px, 3.55vw, 55px); font-weight: 400; letter-spacing: -1.8px; line-height: 1.15; margin: 0 0 13px; }
.welcome-text h1 em { color: #e8ae4c; font-weight: 400; }
.welcome-text > p:not(.eyebrow) { font-size: 13px; line-height: 1.8; max-width: 560px; color: #d8e4d7; margin: 0; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px 19px; margin-top: 23px; }
.hero-actions a { display: inline-flex; align-items: center; gap: 9px; font-size: 10px; font-weight: 800; letter-spacing: .7px; text-transform: uppercase; color: #fff8e7; border-bottom: 1px solid rgba(232,174,76,.5); padding-bottom: 6px; }
.hero-actions a ion-icon { color: #e8ae4c; font-size: 17px; }
.hero-actions a:hover { color: #e8ae4c; }
.hero-admin-card { display: flex; align-items: center; gap: 16px; padding: 20px; border: 1px solid rgba(255,248,231,.2); background: rgba(255,248,231,.07); border-radius: 18px; min-width: 300px; max-width: 385px; width: 35%; }
.hero-avatar { width: 70px; height: 70px; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--gold); color: var(--deep); font: 500 27px Georgia,serif; }
.hero-admin-card > div { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.hero-admin-card .eyebrow { font-size: 9px; margin: 0; line-height: 1.5; letter-spacing: 1.5px; }
.hero-admin-card strong { font: 500 clamp(19px,1.8vw,25px) Georgia,serif; overflow-wrap: anywhere; line-height: 1.25; }
.hero-admin-card small { font-size: 11px; color: #d6e1d3; }

/* Sections */
.overview-section { margin-top: 31px; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin: 0 0 20px; }
.section-heading h2 { font-size: clamp(26px, 2.35vw, 38px); font-weight: 400; letter-spacing: -.8px; margin: 0 0 7px; line-height: 1.12; }
.section-heading h2 em, .deadline-card h2 em { color: var(--terracotta); font-weight: 400; }
.section-heading p:not(.eyebrow) { color: var(--muted); margin: 0; font-size: 12px; line-height: 1.5; }
.section-link { display: inline-flex; gap: 9px; align-items: center; color: var(--forest); font-size: 10px; font-weight: 800; letter-spacing: 1px; white-space: nowrap; padding: 5px 0; }
.section-link:hover { color: var(--terracotta); }
.section-link ion-icon { font-size: 17px; }
.stat-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 13px; }
.stat-card { position: relative; min-width: 0; min-height: 160px; display: flex; flex-direction: column; padding: 21px 17px 20px; border: 1px solid var(--border); border-radius: 17px; background: #fffaf0; color: var(--forest); transition: transform .18s, box-shadow .18s, border-color .18s; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 22px rgba(24,60,44,.09); border-color: #d6b781; }
.stat-card:focus-visible { outline: 3px solid var(--gold); outline-offset: 3px; }
.stat-icon { color: var(--terracotta); font-size: 24px; flex: none; margin-bottom: 17px; }
.stat-label { color: #a85636; font-size: 9px; font-weight: 800; letter-spacing: 1.35px; line-height: 1.6; min-height: 29px; }
.stat-card strong { font: 500 clamp(21px, 1.9vw, 30px) Georgia, serif; margin-top: 3px; line-height: 1.25; overflow-wrap: anywhere; }
.stat-card small { color: var(--muted); margin-top: 6px; font-size: 10.5px; line-height: 1.45; }
.stat-arrow { position: absolute; right: 12px; top: 15px; color: #b8a68d; font-size: 15px; }
.attention-card { background: #fff7e5; }

/* Deadline card */
.deadline-card { display: flex; gap: 19px; background: #fffaf0; border: 1px solid var(--border); border-radius: 20px; margin-top: 20px; padding: 27px 28px; }
.deadline-icon { flex: none; display: grid; place-items: center; width: 50px; height: 50px; border-radius: 14px; color: var(--terracotta); background: #f5e6cb; }
.deadline-icon ion-icon { font-size: 25px; }
.deadline-content { flex: 1; min-width: 0; }
.deadline-heading-row { display: flex; justify-content: space-between; gap: 14px; align-items: center; }
.deadline-card .eyebrow { margin: 1px 0 7px; }
.deadline-card h2 { font-weight: 400; font-size: clamp(20px,2vw,28px); letter-spacing: -.6px; margin: 0 0 6px; }
.deadline-heading-row p:not(.eyebrow) { font-size: 11px; color: var(--muted); margin: 0; }
.empty-deadline { display: flex; align-items: center; gap: 9px; margin: 20px 0 0; padding: 15px 17px; background: #eef2e5; border-radius: 11px; color: #416750; font-size: 12px; }
.empty-deadline ion-icon { font-size: 19px; flex: none; }
.deadline-list { background: transparent; margin-top: 12px; padding: 0; }
.deadline-item { --background: transparent; --min-height: 49px; --border-color: var(--border); color: var(--forest); font-size: 13px; }
.deadline-item ion-icon { color: var(--terracotta); }
.deadline-item ion-note { color: var(--muted); font-size: 11px; }

/* Live charts */
.insights-section { margin-top: 42px; }
.chart-grid { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 16px; }
.chart-card { grid-column: span 2; min-width: 0; padding: 25px 22px 22px; background: #fffaf0; border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 5px 20px rgba(16,42,32,.035); }
.chart-card:nth-child(n+4) { grid-column: span 3; }
.chart-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; min-height: 79px; }
.chart-heading h3 { font-size: clamp(18px,1.5vw,23px); font-weight: 400; line-height: 1.23; letter-spacing: -.4px; margin: 0 0 5px; }
.chart-heading small { font-size: 11px; color: var(--muted); line-height: 1.4; }
.chart-kicker { color: var(--terracotta); font-size: 9px; font-weight: 800; letter-spacing: 1.6px; margin: 0 0 10px; }
.chart-icon { width: 35px; height: 35px; border-radius: 11px; flex: none; display: grid; place-items: center; background: #f4e7d1; color: var(--terracotta); }
.chart-icon ion-icon { font-size: 19px; }
.chart-box { width: 100%; height: 300px; position: relative; margin-top: 10px; }
.chart-card:nth-child(3) .chart-box { height: 300px; }
.chart-empty { min-height: 255px; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--muted); font-size: 12px; line-height: 1.7; border: 1px dashed #e0d3bc; border-radius: 14px; background: #f8f2e5; padding: 22px; margin: 15px 0 0; }
.admin-footer { display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); margin-top: 45px; padding: 20px 0; color: var(--muted); }
.admin-footer > span { font: 700 20px Georgia,serif; color: var(--forest); letter-spacing: -.5px; }
.admin-footer .footer-go { color: var(--terracotta); }
.admin-footer small { font-size: 11px; }

/* Loading/error panels */
.state-box { margin-top: 26px; padding: 74px 20px; text-align: center; background: #fffaf0; border: 1px solid var(--border); border-radius: 22px; }
.state-box ion-spinner { --color: var(--terracotta); width: 36px; height: 36px; }
.state-icon { font-size: 44px; color: var(--terracotta); }
.state-box h2 { font-size: 27px; font-weight: 400; margin: 17px 0 8px; }
.state-box p { color: var(--muted); font-size: 13px; }

@media (max-width: 1210px) {
  .stat-grid { grid-template-columns: repeat(3,minmax(0,1fr)); }
  .chart-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .chart-card, .chart-card:nth-child(n+4) { grid-column: auto; }
  .chart-card:last-child { grid-column: 1 / -1; }
}
@media (max-width: 840px) {
  .welcome-banner { align-items: flex-start; flex-direction: column; }
  .hero-admin-card { width: 100%; max-width: 430px; min-width: 0; }
  .navbar-right { gap: 6px; }
  .topbar-user { display: none; }
  .page-label { font-size: 9px; }
  .dashboard-wrap { padding: 19px 20px; }
}
@media (max-width: 630px) {
  .brand-divider, .page-label { display: none; }
  .navbar-inner { padding: 8px 11px; gap: 9px; }
  .navbar-left { gap: 4px; }
  .menu-trigger { font-size: 23px; }
  .brand { font-size: 27px; }
  .logout-button { font-size: 9px; --padding-start: 11px; --padding-end: 11px; }
  .logout-button ion-icon { margin-right: 4px; }
  .dashboard-wrap { padding: 14px 13px; }
  .welcome-banner { padding: 30px 23px; border-radius: 17px; gap: 25px; }
  .welcome-text h1 { font-size: 37px; }
  .welcome-text > p:not(.eyebrow) { font-size: 12px; }
  .hero-admin-card { padding: 15px; }
  .hero-avatar { width: 58px; height: 58px; font-size: 23px; }
  .overview-section { margin-top: 27px; }
  .section-heading { align-items: flex-start; flex-direction: column; gap: 9px; }
  .stat-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
  .stat-card { min-height: 157px; padding: 17px 13px; }
  .stat-card strong { font-size: 22px; }
  .stat-label { font-size: 8px; }
  .stat-icon { margin-bottom: 13px; }
  .deadline-card { padding: 19px 15px; gap: 10px; }
  .deadline-icon { width: 37px; height: 37px; }
  .deadline-icon ion-icon { font-size: 20px; }
  .deadline-heading-row { align-items: flex-start; flex-direction: column; }
  .chart-grid { grid-template-columns: 1fr; gap: 12px; }
  .chart-card, .chart-card:nth-child(n+4), .chart-card:last-child { grid-column: auto; }
  .chart-card { padding: 20px 16px; }
  .chart-box { height: 280px; }
  .chart-card:nth-child(3) .chart-box { height: 280px; }
}
@media (max-width: 370px) {
  .stat-grid { grid-template-columns: 1fr; }
  .stat-card { min-height: 145px; }
  .brand { font-size: 25px; }
}
@media (prefers-reduced-motion: reduce) {
  .stat-card { transition: none; }
}
</style>