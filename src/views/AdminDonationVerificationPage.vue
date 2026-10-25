<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Donation Verification</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <ion-segment v-model="segment">
          <ion-segment-button value="pending">
            <ion-label>Pending ({{ pending.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="verified">
            <ion-label>Verified ({{ verified.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="rejected">
            <ion-label>Rejected ({{ rejected.length }})</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading donations...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="visibleDonations.length === 0" class="state-box">
          <ion-icon :icon="checkmarkDoneOutline" class="state-icon"></ion-icon>
          <h3>Nothing here</h3>
          <p>There are no donations in this list.</p>
        </div>

        <ion-card v-for="donation in visibleDonations" v-else :key="donation.id">
          <ion-card-header>
            <ion-chip :color="donationStatusColor(donation.status)">{{ donation.status }}</ion-chip>
            <ion-card-title>{{ formatPeso(donation.amount) }}</ion-card-title>
            <ion-card-subtitle>{{ donation.campaignTitle }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <p><strong>Method:</strong> {{ donation.paymentMethod }}</p>
            <p><strong>Reference number:</strong> {{ donation.referenceNumber }}</p>
            <p><strong>Name on account:</strong> {{ donation.senderName }}</p>
            <p><strong>Donor account:</strong> {{ donation.donorName }}</p>
            <p><strong>Submitted:</strong> {{ formatDate(donation.transactionDate) }}</p>
            <p v-if="donation.isAnonymous"><em>Donor chose to appear as Anonymous.</em></p>
            <p v-if="donation.rejectionReason" class="reason">
              <strong>Reason:</strong> {{ donation.rejectionReason }}
            </p>

            <div v-if="donation.status === 'Pending Verification'" class="actions">
              <ion-button
                size="small"
                :disabled="busyId === donation.id"
                @click="handleVerify(donation)"
              >
                Verify
              </ion-button>
              <ion-button
                size="small"
                color="danger"
                fill="outline"
                :disabled="busyId === donation.id"
                @click="handleReject(donation)"
              >
                Reject
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
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
import { alertCircleOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getAllDonations, rejectDonation, verifyDonation } from '../services/donationService';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { askReason, confirmAction, donationStatusColor, showToast } from '../utils/ui';

const donations = ref<Donation[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const segment = ref<string>('pending');
const busyId = ref('');

const pending = computed(() => donations.value.filter((d) => d.status === 'Pending Verification'));
const verified = computed(() => donations.value.filter((d) => d.status === 'Verified'));
const rejected = computed(() =>
  donations.value.filter((d) => d.status === 'Rejected' || d.status === 'Refunded')
);

const visibleDonations = computed(() => {
  if (segment.value === 'verified') return verified.value;
  if (segment.value === 'rejected') return rejected.value;
  return pending.value;
});

async function loadDonations() {
  errorMessage.value = '';
  try {
    donations.value = await getAllDonations();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load donations.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(async () => {
  if (donations.value.length === 0) loading.value = true;
  await loadDonations();
});

/** Runs an admin action, then refreshes the list and shows a message. */
async function runAction(donation: Donation, action: () => Promise<void>, successMessage: string) {
  busyId.value = donation.id;
  try {
    await action();
    await loadDonations();
    await showToast(successMessage);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Action failed.', 'danger');
    await loadDonations();
  } finally {
    busyId.value = '';
  }
}

async function handleVerify(donation: Donation) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;

  const ok = await confirmAction(
    'Verify donation',
    `Verify ${formatPeso(donation.amount)} with reference ${donation.referenceNumber}? Only verify after you have confirmed that this exact reference number and amount appear in your GCash/Maya transaction history.`,
    'Verify'
  );
  if (!ok) return;

  await runAction(
    donation,
    () => verifyDonation(donation, adminUid),
    'Donation verified. The campaign total was updated.'
  );
}

async function handleReject(donation: Donation) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;

  const reason = await askReason(
    'Reject donation',
    'Why is this donation being rejected? The donor will see this reason.',
    'Reject'
  );
  if (!reason) return;

  await runAction(
    donation,
    () => rejectDonation(donation, adminUid, reason),
    'Donation rejected.'
  );
}
</script>

<style scoped>
.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

ion-segment {
  margin-bottom: 8px;
}

ion-card {
  margin: 16px 0 0;
}

ion-card-content p {
  margin: 4px 0;
}

.reason {
  color: #b42318;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
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