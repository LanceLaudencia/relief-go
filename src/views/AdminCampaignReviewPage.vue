<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Campaign Management</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <ion-segment v-model="segment">
          <ion-segment-button value="live">
            <ion-label>Live ({{ live.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="suspended">
            <ion-label>Suspended ({{ suspended.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="other">
            <ion-label>Other ({{ other.length }})</ion-label>
          </ion-segment-button>
        </ion-segment>

        <p v-if="segment === 'other'" class="note">
          These campaigns have a status from the older approval process, so they are not public. In
          the database, change a campaign's <strong>status</strong> to <strong>Active</strong> to
          make it public.
        </p>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading campaigns...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="visibleCampaigns.length === 0" class="state-box">
          <ion-icon :icon="checkmarkDoneOutline" class="state-icon"></ion-icon>
          <h3>Nothing here</h3>
          <p>There are no campaigns in this list.</p>
        </div>

        <ion-card v-for="campaign in visibleCampaigns" v-else :key="campaign.id">
          <ion-card-header>
            <ion-chip :color="campaignStatusColor(campaign.status)">
              {{ campaign.status }}
            </ion-chip>
            <ion-card-title>{{ campaign.title }}</ion-card-title>
            <ion-card-subtitle>
              by {{ campaign.organizerName }} • {{ campaign.category }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <p><strong>Goal:</strong> {{ formatPeso(campaign.goalAmount) }}</p>
            <p><strong>Verified donations:</strong> {{ formatPeso(campaign.verifiedTotal) }}</p>
            <p>
              <strong>Dates:</strong> {{ formatDate(campaign.startDate) }} to
              {{ formatDate(campaign.deadline) }}
            </p>
            <p><strong>Location:</strong> {{ campaign.locationAddress }}</p>
            <p><strong>Beneficiary:</strong> {{ campaign.beneficiaryName }}</p>
            <p class="info">{{ campaign.beneficiaryInfo }}</p>
            <p><strong>Description:</strong></p>
            <p class="info">{{ campaign.description }}</p>
            <p v-if="campaign.rejectionReason" class="reason">
              <strong>Reason given:</strong> {{ campaign.rejectionReason }}
            </p>

            <div class="actions">
              <template v-if="campaign.status === 'Active'">
                <ion-button size="small" fill="outline" :router-link="`/campaigns/${campaign.id}`">
                  View public page
                </ion-button>
                <ion-button
                  size="small"
                  color="danger"
                  fill="outline"
                  :disabled="busyId === campaign.id"
                  @click="handleSuspend(campaign)"
                >
                  Suspend
                </ion-button>
              </template>

              <ion-button
                v-if="campaign.status === 'Suspended'"
                size="small"
                :disabled="busyId === campaign.id"
                @click="handleReinstate(campaign)"
              >
                Reinstate
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
import { getAllCampaigns, reinstateCampaign, suspendCampaign } from '../services/campaignService';
import type { Campaign } from '../models/Campaign';
import { formatDate, formatPeso } from '../utils/format';
import { askReason, campaignStatusColor, confirmAction, showToast } from '../utils/ui';

const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const segment = ref<string>('live');
const busyId = ref('');

const live = computed(() => campaigns.value.filter((c) => c.status === 'Active'));
const suspended = computed(() => campaigns.value.filter((c) => c.status === 'Suspended'));
const other = computed(() =>
  campaigns.value.filter((c) => c.status !== 'Active' && c.status !== 'Suspended')
);

const visibleCampaigns = computed(() => {
  if (segment.value === 'suspended') return suspended.value;
  if (segment.value === 'other') return other.value;
  return live.value;
});

async function loadCampaigns() {
  errorMessage.value = '';
  try {
    campaigns.value = await getAllCampaigns();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load campaigns.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(async () => {
  if (campaigns.value.length === 0) loading.value = true;
  await loadCampaigns();
});

/** Runs an admin action, then refreshes the list and shows a message. */
async function runAction(campaign: Campaign, action: () => Promise<void>, successMessage: string) {
  busyId.value = campaign.id;
  try {
    await action();
    await loadCampaigns();
    await showToast(successMessage);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Action failed.', 'danger');
  } finally {
    busyId.value = '';
  }
}

async function handleSuspend(campaign: Campaign) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;

  const reason = await askReason(
    'Suspend campaign',
    `Why is "${campaign.title}" being suspended? It will be removed from the public list, and the owner will see this reason.`,
    'Suspend'
  );
  if (!reason) return;

  await runAction(
    campaign,
    () => suspendCampaign(campaign, adminUid, reason),
    'Campaign suspended and removed from the public list.'
  );
}

async function handleReinstate(campaign: Campaign) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;

  const ok = await confirmAction(
    'Reinstate campaign',
    `Make "${campaign.title}" public again?`,
    'Reinstate'
  );
  if (!ok) return;

  await runAction(campaign, () => reinstateCampaign(campaign, adminUid), 'Campaign is public again.');
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

.note {
  margin: 8px 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff7e0;
  font-size: 0.85rem;
}

.info {
  color: #52606d;
  white-space: pre-line;
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