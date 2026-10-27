<template>
  <ion-page>
    <!-- Sidebar -->
    <ion-menu content-id="admin-main" menu-id="admin-menu" type="overlay">
      <ion-header @mouseenter="cancelClose" @mouseleave="scheduleClose">
        <ion-toolbar color="primary">
          <ion-title>Admin menu</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content @mouseenter="cancelClose" @mouseleave="scheduleClose">
        <ion-list lines="full" class="nav">
          <ion-menu-toggle :auto-hide="false">
            <ion-item button detail router-link="/admin/campaigns">
              <ion-label>Campaign Management</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button detail router-link="/admin/donations">
              <ion-label>Verify Donations</ion-label>
              <ion-badge v-if="stats && stats.pendingDonations > 0" slot="end" color="warning">
                {{ stats.pendingDonations }}
              </ion-badge>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button detail router-link="/admin/expenses">
              <ion-label>Review Expenses</ion-label>
              <ion-badge v-if="stats && stats.pendingExpenses > 0" slot="end" color="warning">
                {{ stats.pendingExpenses }}
              </ion-badge>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button detail router-link="/admin/users">
              <ion-label>User Management</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button detail router-link="/admin/reports">
              <ion-label>Reports</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button detail router-link="/admin/audit-logs">
              <ion-label>Audit Logs</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Main content -->
    <div class="ion-page" id="admin-main">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-button
              aria-label="Toggle menu"
              @pointerenter="onButtonHover"
              @pointerleave="onButtonLeave"
              @click="toggleMenu"
            >
              <ion-icon slot="icon-only" :icon="menuOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Admin Dashboard</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="handleLogout">
              <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
              Log out
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <div class="wrapper">
          <h2>Hello, {{ currentUser?.displayName }}!</h2>

          <div v-if="loading" class="state-box">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
            <p>Loading dashboard...</p>
          </div>

          <div v-else-if="errorMessage" class="state-box">
            <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
            <h3>Something went wrong</h3>
            <p>{{ errorMessage }}</p>
          </div>

          <template v-else-if="stats && charts">
            <div class="stat-grid">
              <div class="stat">
                <strong>{{ stats.totalUsers }}</strong>
                <span>Registered users</span>
              </div>
              <div class="stat">
                <strong>{{ stats.activeCampaigns }}</strong>
                <span>Active campaigns</span>
              </div>
              <div class="stat">
                <strong>{{ formatPeso(stats.verifiedDonationsTotal) }}</strong>
                <span>Verified donations</span>
              </div>
              <div class="stat warn">
                <strong>{{ stats.pendingDonations }}</strong>
                <span>Donations to verify</span>
              </div>
              <div class="stat warn">
                <strong>{{ stats.pendingExpenses }}</strong>
                <span>Expenses to review</span>
              </div>
              <div class="stat">
                <strong>{{ formatPeso(stats.approvedExpensesTotal) }}</strong>
                <span>Approved documented expenses</span>
              </div>
            </div>

            <ion-card>
              <ion-card-header>
                <ion-card-title>Campaigns nearing their deadline</ion-card-title>
                <ion-card-subtitle>Active campaigns ending within 7 days</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p v-if="stats.nearingDeadline.length === 0" class="muted">
                  No campaigns are ending this week.
                </p>
                <ion-list v-else lines="none">
                  <ion-item
                    v-for="item in stats.nearingDeadline"
                    :key="item.id"
                    button
                    :router-link="`/campaigns/${item.id}`"
                  >
                    <ion-label>{{ item.title }}</ion-label>
                    <ion-note slot="end">{{ item.days }} {{ item.days === 1 ? 'day' : 'days' }}</ion-note>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>

            <div class="chart-grid">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Verified donations by month</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div v-if="hasMonthly" class="chart-box">
                    <Bar :data="monthlyChart" :options="barOptions" />
                  </div>
                  <p v-else class="muted">No verified donations in the last 6 months.</p>
                </ion-card-content>
              </ion-card>

              <ion-card>
                <ion-card-header>
                  <ion-card-title>Campaigns by category</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div v-if="charts.categories.length > 0" class="chart-box">
                    <Doughnut :data="categoryChart" :options="doughnutOptions" />
                  </div>
                  <p v-else class="muted">No campaigns yet.</p>
                </ion-card-content>
              </ion-card>

              <ion-card>
                <ion-card-header>
                  <ion-card-title>Fundraising progress</ion-card-title>
                  <ion-card-subtitle>Top live campaigns: raised vs. goal</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <div v-if="charts.progress.length > 0" class="chart-box">
                    <Bar :data="progressChart" :options="progressOptions" />
                  </div>
                  <p v-else class="muted">No active campaigns yet.</p>
                </ion-card-content>
              </ion-card>

              <ion-card>
                <ion-card-header>
                  <ion-card-title>Donation statuses</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div v-if="charts.statuses.length > 0" class="chart-box">
                    <Doughnut :data="statusChart" :options="doughnutOptions" />
                  </div>
                  <p v-else class="muted">No donations yet.</p>
                </ion-card-content>
              </ion-card>

              <ion-card>
                <ion-card-header>
                  <ion-card-title>Verified expenses by category</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div v-if="charts.expenseCategories.length > 0" class="chart-box">
                    <Doughnut :data="expenseChart" :options="doughnutOptions" />
                  </div>
                  <p v-else class="muted">No verified expenses yet.</p>
                </ion-card-content>
              </ion-card>
            </div>
          </template>
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
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner,
  menuController,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline, logOutOutline, menuOutline } from 'ionicons/icons';
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
      backgroundColor: '#43a047',
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
      backgroundColor: '#1b5e20',
      borderRadius: 4,
    },
    {
      label: 'Goal (₱)',
      data: charts.value?.progress.map((p) => p.goal) ?? [],
      backgroundColor: '#c8e6c9',
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
.wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

h2 {
  font-weight: 800;
  color: var(--ion-color-primary);
}

/* Sidebar nav (was the top list) */
.nav {
  padding: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin: 16px 0;
}

.stat {
  padding: 14px 10px;
  border-radius: 16px;
  background: var(--rg-green-soft);
  text-align: center;
}

.stat.warn {
  background: #fff7e0;
}

.stat strong {
  display: block;
  font-size: 1.15rem;
  color: var(--ion-color-primary);
}

.stat span {
  font-size: 0.8rem;
  color: #52606d;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 4px 12px;
}

.chart-grid ion-card {
  margin: 8px 0;
}

.chart-box {
  position: relative;
  height: 260px;
}

.muted {
  color: #7b8794;
}

.state-box {
  text-align: center;
  padding: 40px 16px;
  color: #52606d;
}

.state-icon {
  font-size: 48px;
  color: var(--ion-color-secondary);
}
</style>