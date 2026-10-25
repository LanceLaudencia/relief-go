<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>My Campaigns</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <ion-button expand="block" shape="round" router-link="/organizer/campaigns/new">
          <ion-icon slot="start" :icon="addOutline"></ion-icon>
          Start a New Campaign
        </ion-button>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading your campaigns...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="campaigns.length === 0" class="state-box">
          <ion-icon :icon="documentTextOutline" class="state-icon"></ion-icon>
          <h3>No campaigns yet</h3>
          <p>Start your first campaign to begin raising funds.</p>
        </div>

        <ion-card v-for="campaign in campaigns" v-else :key="campaign.id">
          <ion-card-header>
            <ion-chip :color="campaignStatusColor(campaign.status)">
              {{ campaign.status }}
            </ion-chip>
            <ion-card-title>{{ campaign.title }}</ion-card-title>
            <ion-card-subtitle>
              {{ campaign.category }} • Goal {{ formatPeso(campaign.goalAmount) }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <p>Deadline: {{ formatDate(campaign.deadline) }}</p>

            <p v-if="campaign.status === 'Suspended'" class="note reason">
              <strong>Suspended by an administrator:</strong>
              {{ campaign.rejectionReason || 'No reason given.' }}
            </p>

            <div class="actions">
              <ion-button v-if="canEdit(campaign)" size="small" :router-link="`/organizer/campaigns/${campaign.id}/edit`">
                Edit
              </ion-button>
              <template v-if="isPublic(campaign)">
                <ion-button size="small" :router-link="`/organizer/campaigns/${campaign.id}/expenses`">
                  Expenses
                </ion-button>
                <ion-button size="small" :router-link="`/organizer/campaigns/${campaign.id}/updates`">
                  Updates
                </ion-button>
                <ion-button
                  size="small"
                  fill="outline"
                  :router-link="`/campaigns/${campaign.id}/transparency`"
                >
                  Transparency report
                </ion-button>
                <ion-button
                  size="small"
                  fill="outline"
                  :router-link="`/campaigns/${campaign.id}`"
                >
                  View public page
                </ion-button>
              </template>
            </div>
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
import { addOutline, alertCircleOutline, documentTextOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getMyCampaigns } from '../services/campaignService';
import { EDITABLE_STATUSES, PUBLIC_STATUSES } from '../models/Campaign';
import type { Campaign } from '../models/Campaign';
import { formatDate, formatPeso } from '../utils/format';
import { campaignStatusColor } from '../utils/ui';

const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');

const canEdit = (campaign: Campaign) => EDITABLE_STATUSES.includes(campaign.status);
const isPublic = (campaign: Campaign) => PUBLIC_STATUSES.includes(campaign.status);

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  if (!user) return;

  if (campaigns.value.length === 0) loading.value = true;
  errorMessage.value = '';

  try {
    campaigns.value = await getMyCampaigns(user.uid);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load campaigns.';
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
  margin: 16px 0 0;
}

.note {
  margin: 8px 0;
  font-size: 0.9rem;
  color: #52606d;
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