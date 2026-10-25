<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/donor"></ion-back-button>
        </ion-buttons>
        <ion-title>My Donations</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading your donations...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="donations.length === 0" class="state-box">
          <ion-icon :icon="heartOutline" class="state-icon"></ion-icon>
          <h3>No donations yet</h3>
          <p>When you donate to a campaign, it will appear here.</p>
          <ion-button shape="round" router-link="/campaigns">Browse Campaigns</ion-button>
        </div>

        <ion-card
          v-for="donation in donations"
          v-else
          :key="donation.id"
          button
          :router-link="`/donor/donations/${donation.id}`"
        >
          <ion-card-header>
            <ion-chip :color="donationStatusColor(donation.status)">{{ donation.status }}</ion-chip>
            <ion-card-title>{{ formatPeso(donation.amount) }}</ion-card-title>
            <ion-card-subtitle>{{ donation.campaignTitle }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            {{ donation.paymentMethod }} • {{ formatDate(donation.transactionDate) }}
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline, heartOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getMyDonations } from '../services/donationService';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { donationStatusColor } from '../utils/ui';

const donations = ref<Donation[]>([]);
const loading = ref(true);
const errorMessage = ref('');

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  if (!user) return;

  if (donations.value.length === 0) loading.value = true;
  errorMessage.value = '';

  try {
    donations.value = await getMyDonations(user.uid);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load donations.';
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

ion-card {
  margin: 12px 0 0;
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