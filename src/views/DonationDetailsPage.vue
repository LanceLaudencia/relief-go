<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/donor/donations"></ion-back-button>
        </ion-buttons>
        <ion-title>Donation Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="state-box">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Loading donation...</p>
      </div>

      <div v-else-if="!donation" class="state-box">
        <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
        <h3>Donation not found</h3>
        <p>{{ errorMessage || 'This donation does not exist or is not yours.' }}</p>
        <ion-button shape="round" router-link="/donor/donations">Back to My Donations</ion-button>
      </div>

      <div v-else class="page-wrapper">
        <ion-card>
          <ion-card-header>
            <ion-chip :color="donationStatusColor(donation.status)">{{ donation.status }}</ion-chip>
            <ion-card-title>{{ formatPeso(donation.amount) }}</ion-card-title>
            <ion-card-subtitle>{{ donation.campaignTitle }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <p v-if="donation.status === 'Pending Verification'" class="status-note">
              Your donation is waiting for an administrator to verify the payment. It is not yet
              counted toward the campaign.
            </p>
            <p v-else-if="donation.status === 'Verified'" class="status-note good">
              Thank you! Your payment was verified on {{ formatDate(donation.verificationDate) }}
              and now counts toward the campaign.
            </p>
            <p v-else-if="donation.status === 'Rejected'" class="status-note bad">
              <strong>Rejected:</strong> {{ donation.rejectionReason || 'No reason given.' }}
              If you believe this is a mistake, please contact the administrator.
            </p>

            <p><strong>Payment method:</strong> {{ donation.paymentMethod }}</p>
            <p><strong>Reference number:</strong> {{ donation.referenceNumber }}</p>
            <p><strong>Name on account:</strong> {{ donation.senderName }}</p>
            <p><strong>Submitted:</strong> {{ formatDate(donation.transactionDate) }}</p>
            <p>
              <strong>Public name:</strong>
              {{ donation.isAnonymous ? 'Hidden (shown as Anonymous)' : donation.donorName }}
            </p>

            <ion-button
              expand="block"
              shape="round"
              fill="outline"
              :router-link="`/campaigns/${donation.campaignId}`"
            >
              View campaign
            </ion-button>
          </ion-card-content>
        </ion-card>
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
import { alertCircleOutline } from 'ionicons/icons';
import { getDonation } from '../services/donationService';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { donationStatusColor } from '../utils/ui';

const route = useRoute();

// Read once when the page is created
const donationId = String(route.params.id);

const donation = ref<Donation | null>(null);
const loading = ref(true);
const errorMessage = ref('');

onIonViewWillEnter(async () => {
  if (!donation.value) loading.value = true;
  errorMessage.value = '';

  try {
    donation.value = await getDonation(donationId);
  } catch (error) {
    donation.value = null;
    errorMessage.value = error instanceof Error ? error.message : '';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-wrapper {
  max-width: 560px;
  margin: 0 auto;
}

ion-card-content p {
  margin: 6px 0;
}

.status-note {
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff7e0;
  font-size: 0.9rem;
}

.status-note.good {
  background: var(--rg-green-soft);
}

.status-note.bad {
  background: #fde8e8;
  color: #b42318;
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