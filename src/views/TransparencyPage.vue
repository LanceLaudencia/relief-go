<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/campaigns/${campaignId}`"></ion-back-button>
        </ion-buttons>
        <ion-title>Transparency Report</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="state-box">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Loading report...</p>
      </div>

      <div v-else-if="errorMessage || !data" class="state-box">
        <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
        <h3>Report not available</h3>
        <p>{{ errorMessage || 'This campaign does not exist or is not available to the public.' }}</p>
        <ion-button shape="round" router-link="/campaigns">Back to campaigns</ion-button>
      </div>

      <div v-else class="page-wrapper">
        <h1>{{ data.campaign.title }}</h1>
        <p class="subtitle">Organized by {{ data.campaign.organizerName }}</p>
        <TransparencyReport :summary="data.summary" :expenses="data.expenses" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';
import TransparencyReport from '../components/TransparencyReport.vue';
import { getTransparencyData } from '../services/transparencyService';
import type { TransparencyData } from '../services/transparencyService';

const route = useRoute();

// Read once when the page is created
const campaignId = String(route.params.id);

const data = ref<TransparencyData | null>(null);
const loading = ref(true);
const errorMessage = ref('');

onIonViewWillEnter(async () => {
  if (!data.value) loading.value = true;
  errorMessage.value = '';

  try {
    data.value = await getTransparencyData(campaignId);
  } catch (error) {
    data.value = null;
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the report.';
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

h1 {
  margin: 0 0 4px;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ion-color-primary);
}

.subtitle {
  margin: 0 0 8px;
  color: #52606d;
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