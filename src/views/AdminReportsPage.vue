<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Reports</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <ion-segment v-model="reportType">
          <ion-segment-button value="donations">
            <ion-label>Donations</ion-label>
          </ion-segment-button>
          <ion-segment-button value="expenses">
            <ion-label>Expenses</ion-label>
          </ion-segment-button>
          <ion-segment-button value="campaigns">
            <ion-label>Campaigns</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading data...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <template v-else-if="table">
          <ion-card class="filters">
            <ion-card-content>
              <ion-select
                v-model="filters.campaignId"
                label="Campaign"
                label-placement="floating"
                fill="outline"
                interface="popover"
                class="field"
              >
                <ion-select-option :value="ALL">All campaigns</ion-select-option>
                <ion-select-option v-for="item in campaignOptions" :key="item.id" :value="item.id">
                  {{ item.title }}
                </ion-select-option>
              </ion-select>

              <ion-select
                v-model="filters.category"
                label="Campaign category"
                label-placement="floating"
                fill="outline"
                interface="popover"
                class="field"
              >
                <ion-select-option :value="ALL">All categories</ion-select-option>
                <ion-select-option v-for="item in CAMPAIGN_CATEGORIES" :key="item" :value="item">
                  {{ item }}
                </ion-select-option>
              </ion-select>

              <ion-select
                v-model="filters.status"
                label="Status"
                label-placement="floating"
                fill="outline"
                interface="popover"
                class="field"
              >
                <ion-select-option :value="ALL">All statuses</ion-select-option>
                <ion-select-option v-for="item in statusOptions" :key="item" :value="item">
                  {{ item }}
                </ion-select-option>
              </ion-select>

              <div class="date-row">
                <ion-input
                  v-model="filters.dateFrom"
                  type="date"
                  label="From"
                  label-placement="stacked"
                  fill="outline"
                ></ion-input>
                <ion-input
                  v-model="filters.dateTo"
                  type="date"
                  label="To"
                  label-placement="stacked"
                  fill="outline"
                ></ion-input>
              </div>

              <ion-button size="small" fill="clear" @click="clearFilters">Clear filters</ion-button>
            </ion-card-content>
          </ion-card>

          <div class="summary">
            <div class="box">
              <strong>{{ table.rows.length }}</strong>
              <span>Records</span>
            </div>
            <div class="box">
              <strong>{{ formatPeso(table.totalAmount) }}</strong>
              <span>{{ table.totalLabel }}</span>
            </div>
          </div>

          <ion-button
            expand="block"
            shape="round"
            :disabled="table.rows.length === 0"
            @click="handleDownload"
          >
            <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
            Download CSV
          </ion-button>

          <div v-if="table.rows.length === 0" class="state-box">
            <ion-icon :icon="documentTextOutline" class="state-icon"></ion-icon>
            <h3>No records match these filters</h3>
          </div>

          <template v-else>
            <div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th v-for="col in table.columns" :key="col.key">{{ col.label }}</th>
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
            <p v-if="table.rows.length > MAX_SHOWN" class="muted">
              Showing the first {{ MAX_SHOWN }} of {{ table.rows.length }} records. The CSV file
              contains all of them.
            </p>
          </template>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline, documentTextOutline, downloadOutline } from 'ionicons/icons';
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

const data = ref<AdminData | null>(null);
const loading = ref(true);
const errorMessage = ref('');

const reportType = ref<string>('donations');
const type = computed(() => reportType.value as ReportType);

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
.page-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

ion-segment {
  margin-bottom: 8px;
}

.filters {
  margin: 8px 0;
}

.field {
  margin-bottom: 12px;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 8px 0 12px;
}

.box {
  padding: 12px 8px;
  border-radius: 16px;
  background: var(--rg-green-soft);
  text-align: center;
}

.box strong {
  display: block;
  color: var(--ion-color-primary);
}

.box span {
  font-size: 0.8rem;
  color: #52606d;
}

.table-scroll {
  margin-top: 16px;
  overflow-x: auto;
  border: 1px solid #e4e7eb;
  border-radius: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th,
td {
  padding: 8px 10px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid #eef0f2;
}

th {
  position: sticky;
  top: 0;
  background: var(--rg-green-soft);
  color: var(--ion-color-primary);
}

td.num {
  text-align: right;
}

.muted {
  color: #7b8794;
  font-size: 0.85rem;
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