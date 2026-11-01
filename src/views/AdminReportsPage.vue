<template>
  <ion-page class="rg-reports-page">
    <ion-header class="reports-header">
      <ion-toolbar class="reports-toolbar">
        <div class="nav-inner">
          <router-link to="/welcome" class="brand" aria-label="ReliefGO welcome page">
            Relief<span>GO</span><sup>♥</sup>
          </router-link>
          <span class="nav-divider" aria-hidden="true"></span>
          <span class="nav-page-name">ADMIN REPORTS</span>
          <router-link to="/admin" class="back-to-dashboard">
            <ion-icon :icon="arrowBackOutline" /> BACK TO DASHBOARD
          </router-link>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="reports-content">
      <main class="page-wrapper">
        <section class="hero-banner" aria-labelledby="report-page-heading">
          <div class="hero-copy">
            <p class="eyebrow hero-eyebrow">RELIEFGO ADMINISTRATION ✦</p>
            <h1 id="report-page-heading">Reports <em>&amp; insights.</em></h1>
            <p>Explore donations, expenses, and campaigns. Filter your records and export the results with confidence.</p>
          </div>
          <div class="admin-identity" aria-label="Administrator profile">
            <span class="identity-avatar">{{ userInitials }}</span>
            <div class="identity-details">
              <span class="eyebrow hero-eyebrow">ADMINISTRATOR ACCOUNT</span>
              <strong>{{ fullName }}</strong>
              <small>Data and reporting center</small>
            </div>
          </div>
        </section>

        <section class="reports-workspace" aria-labelledby="report-workspace-heading">
          <div class="section-head">
            <div>
              <p class="eyebrow">YOUR REPORTING WORKSPACE</p>
              <h2 id="report-workspace-heading">Every number <em>tells a story.</em></h2>
              <p class="section-description">Choose a report to review actual records from ReliefGO.</p>
            </div>
          </div>

          <ion-segment v-model="reportType" class="report-tabs" aria-label="Select report type">
            <ion-segment-button value="donations">
              <ion-icon :icon="heartOutline" />
              <ion-label>Donations</ion-label>
            </ion-segment-button>
            <ion-segment-button value="expenses">
              <ion-icon :icon="receiptOutline" />
              <ion-label>Expenses</ion-label>
            </ion-segment-button>
            <ion-segment-button value="campaigns">
              <ion-icon :icon="megaphoneOutline" />
              <ion-label>Campaigns</ion-label>
            </ion-segment-button>
          </ion-segment>

          <div v-if="loading" class="state-box" role="status">
            <ion-spinner name="crescent" />
            <h3>Gathering your reports</h3>
            <p>Loading live ReliefGO records...</p>
          </div>

          <div v-else-if="errorMessage" class="state-box error-state" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h3>Something went wrong</h3>
            <p>{{ errorMessage }}</p>
          </div>

          <template v-else-if="table">
            <section class="filters-panel" aria-labelledby="filters-heading">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">REFINE YOUR RESULTS</p>
                  <h3 id="filters-heading"><ion-icon :icon="optionsOutline" /> Report filters</h3>
                </div>
                <button class="clear-button" type="button" @click="clearFilters">
                  <ion-icon :icon="refreshOutline" /> CLEAR FILTERS
                </button>
              </div>

              <div class="filter-grid">
                <div class="field-wrap">
                  <label class="field-label">Campaign</label>
                  <ion-select
                    v-model="filters.campaignId"
                    aria-label="Campaign"
                    fill="outline"
                    interface="popover"
                    class="rg-field"
                  >
                    <ion-select-option :value="ALL">All campaigns</ion-select-option>
                    <ion-select-option v-for="item in campaignOptions" :key="item.id" :value="item.id">
                      {{ item.title }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <div class="field-wrap">
                  <label class="field-label">Campaign category</label>
                  <ion-select
                    v-model="filters.category"
                    aria-label="Campaign category"
                    fill="outline"
                    interface="popover"
                    class="rg-field"
                  >
                    <ion-select-option :value="ALL">All categories</ion-select-option>
                    <ion-select-option v-for="item in CAMPAIGN_CATEGORIES" :key="item" :value="item">
                      {{ item }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <div class="field-wrap">
                  <label class="field-label">Status</label>
                  <ion-select
                    v-model="filters.status"
                    aria-label="Status"
                    fill="outline"
                    interface="popover"
                    class="rg-field"
                  >
                    <ion-select-option :value="ALL">All statuses</ion-select-option>
                    <ion-select-option v-for="item in statusOptions" :key="item" :value="item">
                      {{ item }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <div class="field-wrap">
                  <label class="field-label">From date</label>
                  <ion-input
                    v-model="filters.dateFrom"
                    type="date"
                    aria-label="From date"
                    fill="outline"
                    class="rg-field"
                  ></ion-input>
                </div>
                <div class="field-wrap">
                  <label class="field-label">To date</label>
                  <ion-input
                    v-model="filters.dateTo"
                    type="date"
                    aria-label="To date"
                    fill="outline"
                    class="rg-field"
                  ></ion-input>
                </div>
              </div>
            </section>

            <div class="summary-grid" aria-label="Report summary">
              <div class="summary-card">
                <ion-icon :icon="documentTextOutline" class="summary-icon" />
                <span class="summary-label">MATCHING RECORDS</span>
                <strong>{{ table.rows.length }}</strong>
                <small>Based on the selected filters</small>
              </div>
              <div class="summary-card">
                <ion-icon :icon="shieldCheckmarkOutline" class="summary-icon" />
                <span class="summary-label">{{ table.totalLabel }}</span>
                <strong>{{ formatPeso(table.totalAmount) }}</strong>
                <small>Calculated from matching records</small>
              </div>
            </div>

            <section class="results-panel" aria-labelledby="results-heading">
              <div class="results-heading">
                <div>
                  <p class="eyebrow">DETAILED RECORDS</p>
                  <h3 id="results-heading">{{ reportTitle }} <em>report.</em></h3>
                  <p>View your filtered records or download the full dataset.</p>
                </div>
                <ion-button
                  class="download-button"
                  :disabled="table.rows.length === 0"
                  @click="handleDownload"
                >
                  <ion-icon slot="start" :icon="downloadOutline" /> DOWNLOAD CSV
                  <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>
              </div>

              <div v-if="table.rows.length === 0" class="empty-results">
                <span class="empty-icon"><ion-icon :icon="documentTextOutline" /></span>
                <p class="eyebrow">NO MATCHING DATA</p>
                <h4>No records match these filters.</h4>
                <p>Try a different campaign, category, status, or date range.</p>
                <button class="empty-clear" type="button" @click="clearFilters">CLEAR FILTERS <ion-icon :icon="arrowForwardOutline" /></button>
              </div>

              <template v-else>
                <div class="table-scroll" role="region" aria-label="Filtered report records" tabindex="0">
                  <table>
                    <thead>
                      <tr>
                        <th v-for="col in table.columns" :key="col.key" scope="col">{{ col.label }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in shownRows" :key="index">
                        <td
                          v-for="col in table.columns"
                          :key="col.key"
                          :class="{ num: col.type === 'money' || col.type === 'number' }"
                        >
                          {{ displayCell(col, row[col.key]) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p v-if="table.rows.length > MAX_SHOWN" class="table-note">
                  Showing the first {{ MAX_SHOWN }} of {{ table.rows.length }} records. The downloaded CSV contains all records.
                </p>
              </template>
            </section>
          </template>
        </section>
        <footer class="page-footer">
          <span>Small acts. Big hearts. <b>♥</b></span>
          <span>ReliefGO Administration</span>
        </footer>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline, documentTextOutline, downloadOutline,
  arrowBackOutline, arrowForwardOutline, heartOutline, receiptOutline,
  megaphoneOutline, optionsOutline, refreshOutline, shieldCheckmarkOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { loadAdminData } from '../services/adminDataService';
import type { AdminData } from '../services/adminDataService';
import {
  ALL,
  REPORT_STATUS_OPTIONS,
  buildReport,
  downloadCsv,
  reportToCsv,
} from '../services/reportService';
import type { ReportColumn, ReportFilters, ReportType } from '../services/reportService';
import { CAMPAIGN_CATEGORIES } from '../models/Campaign';
import { formatDate, formatPeso } from '../utils/format';
import { showToast } from '../utils/ui';

const MAX_SHOWN = 100;

// Presentation only. Name and initials come from the existing authentication state.
const fullName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Admin');
const userInitials = computed(() => {
  const parts = fullName.value.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : fullName.value.slice(0, 2)).toUpperCase();
});


const data = ref<AdminData | null>(null);
const loading = ref(true);
const errorMessage = ref('');

const reportType = ref<string>('donations');
const type = computed(() => reportType.value as ReportType);
const reportTitle = computed(() => ({
  donations: 'Donation',
  expenses: 'Expense',
  campaigns: 'Campaign',
})[type.value]);

const filters = reactive<ReportFilters>({
  campaignId: ALL,
  category: ALL,
  status: ALL,
  dateFrom: '',
  dateTo: '',
});

const statusOptions = computed(() => REPORT_STATUS_OPTIONS[type.value]);

const campaignOptions = computed(() =>
  (data.value?.campaigns ?? [])
    .map((c) => ({ id: c.id, title: c.title }))
    .sort((a, b) => a.title.localeCompare(b.title))
);

const table = computed(() => (data.value ? buildReport(type.value, data.value, filters) : null));
const shownRows = computed(() => table.value?.rows.slice(0, MAX_SHOWN) ?? []);

// Each report type has its own statuses, so reset that filter when switching
watch(reportType, () => {
  filters.status = ALL;
});

function clearFilters() {
  filters.campaignId = ALL;
  filters.category = ALL;
  filters.status = ALL;
  filters.dateFrom = '';
  filters.dateTo = '';
}

function displayCell(column: ReportColumn, value: string | number | undefined): string {
  if (value === undefined || value === '') return '';
  if (column.type === 'money') return formatPeso(Number(value));
  if (column.type === 'date') return formatDate(String(value));
  return String(value);
}

function handleDownload() {
  if (!table.value) return;
  const csv = reportToCsv(table.value);
  const today = new Date().toLocaleDateString('en-CA');
  downloadCsv(`relief-go-${type.value}-report-${today}.csv`, csv);
  showToast('Report downloaded.');
}

onIonViewWillEnter(async () => {
  if (!data.value) loading.value = true;
  errorMessage.value = '';

  try {
    data.value = await loadAdminData();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the data.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Same ReliefGO brand palette used by the redesigned Admin Dashboard. */
.rg-reports-page {
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
.rg-reports-page * { box-sizing: border-box; }
.rg-reports-page h1, .rg-reports-page h2, .rg-reports-page h3,
.rg-reports-page h4, .rg-reports-page p { margin-top: 0; }
.rg-reports-page h1, .rg-reports-page h2, .rg-reports-page h3,
.rg-reports-page h4, .brand, .summary-card strong { font-family: Georgia, 'Times New Roman', serif; }
.rg-reports-page a { color: inherit; text-decoration: none; }

/* Navbar: ReliefGO on left, back navigation on right. */
.reports-header { box-shadow: none; }
.reports-header::after { display: none; }
.reports-toolbar {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-start: 0;
  --padding-end: 0;
  --min-height: 73px;
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  min-height: 72px;
  padding: 8px clamp(17px, 3.2vw, 55px);
  display: flex; align-items: center; gap: 17px;
}
.brand { font-size: clamp(25px, 2.1vw, 33px); line-height: 1; letter-spacing: -1.9px; font-weight: 700; white-space: nowrap; }
.brand span, .brand sup { color: var(--terracotta); }
.brand sup { font-size: 12px; margin-left: 2px; vertical-align: top; }
.nav-divider { height: 22px; width: 1px; background: #d9ccb4; }
.nav-page-name { font-size: 10px; letter-spacing: 1.25px; font-weight: 800; white-space: nowrap; }
.back-to-dashboard {
  margin-left: auto; min-height: 39px; display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; border-radius: 24px; border: 1px solid #d9ccb4; padding: 10px 15px;
  font-size: 10px; letter-spacing: .9px; font-weight: 800; white-space: nowrap;
  transition: background .2s;
}
.back-to-dashboard ion-icon { font-size: 16px; }
.back-to-dashboard:hover { background: #ede4d1; }

.reports-content { --background: #f8f3e4; --padding-top: 0; --padding-bottom: 0; --padding-start: 0; --padding-end: 0; }
.page-wrapper { width: 100%; max-width: 1490px; margin: auto; padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 32px; }
.hero-banner {
  min-height: 237px; border-radius: 22px; overflow: hidden;
  background: radial-gradient(circle at 72% 105%, rgba(232,174,76,.11), transparent 42%), linear-gradient(115deg,#183c2c,#102a20);
  color: #fff8e7; display: flex; align-items: center; justify-content: space-between;
  gap: 25px; padding: clamp(25px, 3.1vw, 49px) clamp(25px, 4vw, 63px);
}
.hero-copy { min-width: 0; max-width: 705px; }
.eyebrow { margin: 0 0 11px; font-size: 10px; font-weight: 800; letter-spacing: 1.8px; color: var(--terracotta); }
.hero-eyebrow { color: var(--gold); }
.hero-banner h1 { font-size: clamp(35px, 3.8vw, 58px); font-weight: 400; line-height: 1.11; letter-spacing: -2.1px; margin-bottom: 13px; }
.hero-banner h1 em { color: var(--gold); font-weight: 400; }
.hero-copy > p:last-child { color: #e1e6d7; font-size: 13px; line-height: 1.8; max-width: 550px; margin: 0; }
.admin-identity {
  display: flex; align-items: center; gap: 16px; flex: 0 0 auto;
  min-width: 300px; max-width: 420px;
  padding: 17px; border: 1px solid rgba(255,255,255,.21); border-radius: 17px;
  background: rgba(255,255,255,.07);
}
.identity-avatar { width: 66px; height: 66px; flex: 0 0 66px; display: grid; place-items: center; border-radius: 50%; background: var(--gold); color: var(--deep); font: 700 24px Georgia,serif; }
.identity-details { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.identity-details .eyebrow { font-size: 9px; margin: 0; }
.identity-details strong { font: 500 clamp(18px, 1.5vw, 23px) Georgia,serif; overflow-wrap: anywhere; }
.identity-details small { color: #e1e6d7; font-size: 11px; }

.reports-workspace { margin-top: 31px; }
.section-head { display: flex; justify-content: space-between; margin-bottom: 21px; }
.section-head h2 { font-weight: 400; font-size: clamp(27px, 2.65vw, 40px); letter-spacing: -1.3px; line-height: 1.1; margin-bottom: 9px; }
.section-head h2 em { color: var(--terracotta); font-weight: 400; }
.section-description { font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 0; }

/* Report type tabs */
.report-tabs {
  --background: #fffaf0; padding: 5px; border: 1px solid var(--border);
  border-radius: 17px; max-width: 710px; min-height: 56px; margin-bottom: 22px;
}
.report-tabs ion-segment-button {
  --color: var(--forest); --color-checked: var(--forest); --indicator-color: var(--gold);
  --indicator-box-shadow: none; --border-radius: 12px;
  font-size: 12px; font-weight: 800; letter-spacing: .2px;
  min-height: 46px; text-transform: none;
}
.report-tabs ion-segment-button ion-icon { display: inline-block; font-size: 16px; margin: 0 5px 0 0; vertical-align: middle; }
.report-tabs ion-segment-button ion-label { display: inline-block; vertical-align: middle; }

/* Filters: labels are external, so there is no overlap with selected values. */
.filters-panel, .results-panel { background: var(--paper); border: 1px solid var(--border); border-radius: 20px; }
.filters-panel { padding: clamp(18px, 2.6vw, 32px); margin-bottom: 20px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 21px; }
.panel-heading h3 { font-size: clamp(21px, 1.9vw, 28px); font-weight: 400; margin: 0; display: flex; align-items: center; gap: 9px; }
.panel-heading h3 ion-icon { font-size: 21px; color: var(--terracotta); }
.clear-button, .empty-clear { background: transparent; border: 0; cursor: pointer; color: var(--forest); font: 800 10px 'DM Sans',sans-serif; letter-spacing: 1.1px; display: inline-flex; align-items: center; gap: 8px; padding: 9px 2px; }
.clear-button ion-icon, .empty-clear ion-icon { font-size: 16px; }
.clear-button:hover, .empty-clear:hover { color: var(--terracotta); }
.filter-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
.field-wrap { min-width: 0; }
.field-label { display: block; font-size: 10px; text-transform: uppercase; font-weight: 800; color: #536257; margin-bottom: 8px; letter-spacing: 1.2px; }
.rg-field {
  --background: #fffdf7; --color: var(--forest);
  --border-color: #d9cbb4; --border-radius: 11px;
  --highlight-color-focused: var(--forest);
  width: 100%; min-height: 50px; font-size: 13px;
}
.rg-field::part(native) { min-height: 50px; }

.summary-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 17px; margin-bottom: 23px; }
.summary-card { background: var(--paper); border: 1px solid var(--border); border-radius: 18px; min-height: 176px; padding: 21px 25px; display: flex; flex-direction: column; align-items: flex-start; }
.summary-icon { font-size: 24px; color: var(--terracotta); margin-bottom: 14px; }
.summary-label { color: var(--terracotta); font-size: 10px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase; overflow-wrap: anywhere; }
.summary-card strong { display: block; margin: 5px 0; font-size: clamp(26px, 3vw, 42px); font-weight: 400; letter-spacing: -1px; line-height: 1.2; overflow-wrap: anywhere; }
.summary-card small { font-size: 11px; color: var(--muted); }

.results-panel { padding: clamp(18px, 2.6vw, 32px); }
.results-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 19px; }
.results-heading h3 { font-size: clamp(25px, 2.5vw, 35px); font-weight: 400; letter-spacing: -1px; margin-bottom: 8px; }
.results-heading h3 em { color: var(--terracotta); font-weight: 400; }
.results-heading p:last-child { font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 0; }
.download-button { --background: var(--gold); --color: var(--deep); --border-radius: 26px; --box-shadow: none; font-size: 10px; font-weight: 800; letter-spacing: .6px; min-height: 44px; margin: 0; flex-shrink: 0; }
.download-button:hover { --background: #f0bc62; }
.download-button[disabled] { opacity: .45; }
.table-scroll { max-width: 100%; overflow: auto; border: 1px solid #e6dccb; border-radius: 13px; background: #fffdf8; }
.table-scroll:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; }
th, td { padding: 15px 16px; border-bottom: 1px solid #efe6d8; text-align: left; vertical-align: middle; white-space: nowrap; }
th { position: sticky; top: 0; z-index: 1; background: #e9eee4; color: var(--forest); text-transform: uppercase; font-size: 10px; letter-spacing: .8px; font-weight: 800; }
tbody tr:nth-child(even) { background: #fcf8ed; }
tbody tr:hover { background: #f5eedf; }
tbody tr:last-child td { border-bottom: 0; }
td.num { text-align: right; font-variant-numeric: tabular-nums; }
.table-note { color: var(--muted); font-size: 11px; margin: 13px 0 0; line-height: 1.6; }
.empty-results { text-align: center; padding: 40px 20px 48px; background: #fffcf6; border: 1px dashed #decdb1; border-radius: 16px; }
.empty-icon { display: inline-grid; place-items: center; width: 70px; height: 70px; border-radius: 50%; background: #f4e6ca; color: var(--terracotta); margin-bottom: 18px; }
.empty-icon ion-icon { font-size: 33px; }
.empty-results h4 { font-size: 26px; font-weight: 400; margin-bottom: 9px; }
.empty-results > p:last-of-type { color: var(--muted); font-size: 12px; line-height: 1.7; }
.empty-results .eyebrow { color: var(--terracotta); }

.state-box { padding: 52px 22px; text-align: center; border: 1px solid var(--border); border-radius: 18px; background: var(--paper); color: var(--forest); }
.state-box ion-spinner, .state-icon { color: var(--terracotta); font-size: 39px; }
.state-box h3 { font-size: 25px; font-weight: 400; margin: 15px 0 10px; }
.state-box p { font-size: 13px; color: var(--muted); margin-bottom: 0; }
.error-state .state-icon { color: #af4d3d; }
.page-footer { display: flex; justify-content: space-between; gap: 12px; padding: 30px 3px 5px; font-size: 11px; color: var(--muted); }
.page-footer b { color: var(--terracotta); }

@media (max-width: 950px) {
  .hero-banner { align-items: flex-start; flex-direction: column; gap: 23px; }
  .admin-identity { min-width: 0; width: min(100%,420px); }
  .filter-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
@media (max-width: 610px) {
  .nav-inner { min-height: 65px; gap: 9px; padding-inline: 15px; }
  .brand { font-size: 26px; }
  .nav-divider { display: none; }
  .nav-page-name { display: none; }
  .back-to-dashboard { font-size: 9px; letter-spacing: .15px; padding: 10px 9px; }
  .back-to-dashboard ion-icon { font-size: 14px; }
  .page-wrapper { padding: 16px 13px 24px; }
  .hero-banner { padding: 25px 21px; min-height: 0; border-radius: 18px; }
  .hero-banner h1 { font-size: clamp(31px, 8vw, 42px); }
  .hero-copy > p:last-child { font-size: 12px; }
  .admin-identity { gap: 11px; padding: 13px; }
  .identity-avatar { width: 52px; height: 52px; flex-basis: 52px; font-size: 18px; }
  .identity-details strong { font-size: 18px; }
  .reports-workspace { margin-top: 27px; }
  .report-tabs ion-segment-button { font-size: 10px; min-width: 0; }
  .report-tabs ion-segment-button ion-icon { display: none; }
  .filter-grid { grid-template-columns: 1fr; gap: 13px; }
  .filters-panel, .results-panel { padding: 19px 15px; }
  .panel-heading, .results-heading { flex-direction: column; align-items: flex-start; }
  .summary-grid { gap: 10px; }
  .summary-card { padding: 16px 12px; min-height: 152px; }
  .summary-icon { font-size: 20px; margin-bottom: 9px; }
  .summary-label { font-size: 9px; letter-spacing: .9px; }
  .summary-card strong { font-size: clamp(20px, 5.5vw, 28px); }
  .summary-card small { font-size: 10px; }
  .download-button { width: 100%; }
  .page-footer { flex-direction: column; text-align: center; }
}
</style>