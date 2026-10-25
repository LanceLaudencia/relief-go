<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Audit Logs</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <ion-segment v-model="segment">
          <ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button>
          <ion-segment-button value="campaign"><ion-label>Campaigns</ion-label></ion-segment-button>
          <ion-segment-button value="donation"><ion-label>Donations</ion-label></ion-segment-button>
          <ion-segment-button value="expense"><ion-label>Expenses</ion-label></ion-segment-button>
          <ion-segment-button value="user"><ion-label>Users</ion-label></ion-segment-button>
        </ion-segment>

        <ion-searchbar
          v-model="searchText"
          placeholder="Search actions, names, details"
          :debounce="200"
        ></ion-searchbar>

        <p class="note">
          Showing the latest 200 actions. Entries cannot be edited or deleted.
        </p>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading logs...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="visibleLogs.length === 0" class="state-box">
          <ion-icon :icon="documentTextOutline" class="state-icon"></ion-icon>
          <h3>No log entries</h3>
          <p>Admin actions will appear here.</p>
        </div>

        <ion-list v-else lines="full">
          <ion-item v-for="log in visibleLogs" :key="log.id">
            <ion-label class="ion-text-wrap">
              <h3>{{ log.action }}</h3>
              <p>{{ log.details }}</p>
              <p class="meta">
                {{ log.adminName }} • {{ formatTime(log.createdAt) }} • {{ log.targetType }}
              </p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
  IonSearchbar,
  IonList,
  IonItem,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline, documentTextOutline } from 'ionicons/icons';
import { getAuditLogs } from '../services/auditService';
import type { AuditLog } from '../models/AuditLog';

const logs = ref<AuditLog[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const segment = ref<string>('all');
const searchText = ref('');

const visibleLogs = computed(() => {
  const term = searchText.value.trim().toLowerCase();
  return logs.value.filter((log) => {
    const matchesType = segment.value === 'all' || log.targetType === segment.value;
    const matchesSearch =
      term === '' ||
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.adminName.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });
});

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

onIonViewWillEnter(async () => {
  if (logs.value.length === 0) loading.value = true;
  errorMessage.value = '';

  try {
    logs.value = await getAuditLogs();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the logs.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

.note {
  margin: 0 0 8px;
  font-size: 0.8rem;
  color: #7b8794;
}

.meta {
  font-size: 0.75rem;
  color: #7b8794;
}

.state-box {
  text-align: center;
  padding: 48px 16px;
  color: #52606d;
}

.state-icon {
  font-size: 48px;
  color: var(--ion-color-secondary);
}
</style>