<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/campaigns"></ion-back-button>
        </ion-buttons>
        <ion-title>Campaign Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="loading" class="state-box">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Loading campaign...</p>
      </div>

      <div v-else-if="!campaign" class="state-box">
        <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
        <h3>Campaign not found</h3>
        <p>This campaign does not exist or is not available to the public.</p>
        <ion-button shape="round" router-link="/campaigns">Back to campaigns</ion-button>
      </div>

      <div v-else class="details-wrapper">
        <div class="hero">
          <img v-if="campaign.imageUrl" :src="campaign.imageUrl" :alt="campaign.title" />
          <div v-else class="hero-placeholder">
            <ion-icon :icon="heartOutline"></ion-icon>
          </div>
        </div>

        <div class="details-body">
          <ion-chip color="secondary">{{ campaign.category }}</ion-chip>
          <h1>{{ campaign.title }}</h1>
          <p class="organizer">Organized by {{ campaign.organizerName }}</p>

          <ion-card class="summary-card">
            <ion-card-content>
              <CampaignProgress
                :raised="campaign.verifiedTotal"
                :goal="campaign.goalAmount"
              />

              <div class="stats">
                <div class="stat">
                  <strong>{{ campaign.verifiedDonorCount }}</strong>
                  <span>Verified donors</span>
                </div>
                <div class="stat">
                  <strong>{{ remainingDays }}</strong>
                  <span>Days left</span>
                </div>
                <div class="stat">
                  <strong>{{ formatDate(campaign.deadline) }}</strong>
                  <span>Deadline</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-button
            expand="block"
            shape="round"
            :disabled="donateDisabled"
            :router-link="`/campaigns/${campaign.id}/donate`"
          >
            Donate Now
          </ion-button>
          <p v-if="donateHint" class="hint">{{ donateHint }}</p>

          <h3>About this campaign</h3>
          <p>{{ campaign.description }}</p>

          <h3>Beneficiary</h3>
          <p><strong>{{ campaign.beneficiaryName }}</strong></p>
          <p>{{ campaign.beneficiaryInfo }}</p>

          <h3>Location</h3>
          <p class="location">
            <ion-icon :icon="locationOutline"></ion-icon>
            {{ campaign.locationAddress }}
          </p>
          <LocationMap
            :latitude="campaign.latitude"
            :longitude="campaign.longitude"
            :address="campaign.locationAddress"
          />

          <h3>Campaign updates</h3>
          <CampaignUpdatesList :updates="updates" />

          <h3>Recent donors</h3>
          <p v-if="donors.length === 0" class="muted">
            No verified donations yet. Be the first to help.
          </p>
          <ion-list v-else lines="full">
            <ion-item v-for="donor in donors" :key="donor.id">
              <ion-label>
                <h4>{{ donor.donorName }}</h4>
                <p>{{ formatDate(donor.verifiedAt) }}</p>
              </ion-label>
              <ion-note slot="end" color="primary">{{ formatPeso(donor.amount) }}</ion-note>
            </ion-item>
          </ion-list>

          <ion-button
            expand="block"
            shape="round"
            fill="outline"
            class="bottom-button"
            :router-link="`/campaigns/${campaign.id}/transparency`"
          >
            View Transparency Report
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
  IonCardContent,
  IonChip,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { heartOutline, locationOutline, alertCircleOutline } from 'ionicons/icons';
import CampaignProgress from '../components/CampaignProgress.vue';
import CampaignUpdatesList from '../components/CampaignUpdatesList.vue';
import LocationMap from '../components/LocationMap.vue';
import { currentUser } from '../services/authState';
import { getCampaignById } from '../services/campaignService';
import { getPublicDonors } from '../services/donationService';
import { getCampaignUpdates } from '../services/updateService';
import { formatDate, formatPeso, daysLeft } from '../utils/format';
import type { Campaign } from '../models/Campaign';
import type { CampaignUpdate } from '../models/CampaignUpdate';
import type { PublicDonor } from '../models/Donation';

const route = useRoute();

// Read once when the page is created
const campaignId = String(route.params.id);

const campaign = ref<Campaign | null>(null);
const donors = ref<PublicDonor[]>([]);
const updates = ref<CampaignUpdate[]>([]);
const loading = ref(true);

const remainingDays = computed(() =>
  campaign.value ? daysLeft(campaign.value.deadline) : 0
);

const isOwnCampaign = computed(
  () => campaign.value !== null && currentUser.value?.uid === campaign.value.organizerId
);

// Everyone except administrators can donate, but not to their own campaign.
// Logged-out visitors are asked to log in first.
const donateDisabled = computed(
  () => currentUser.value?.role === 'admin' || isOwnCampaign.value || remainingDays.value === 0
);

const donateHint = computed(() => {
  const user = currentUser.value;
  if (remainingDays.value === 0) return 'This campaign has reached its deadline.';
  if (!user) return 'You will be asked to log in first.';
  if (user.role === 'admin') return 'Administrator accounts cannot donate.';
  if (isOwnCampaign.value) return 'You cannot donate to your own campaign.';
  return '';
});

onIonViewWillEnter(async () => {
  if (!campaign.value) loading.value = true;

  try {
    campaign.value = await getCampaignById(campaignId);
    donors.value = campaign.value ? await getPublicDonors(campaignId) : [];
  } catch (error) {
    console.error('Failed to load campaign:', error);
    campaign.value = null;
  } finally {
    loading.value = false;
  }

  // Updates load separately, so a problem here never hides the campaign
  if (campaign.value) {
    try {
      updates.value = (await getCampaignUpdates(campaignId)).slice(0, 5);
    } catch (error) {
      console.error('Failed to load updates:', error);
      updates.value = [];
    }
  }
});
</script>

<style scoped>
.details-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

.hero {
  height: 220px;
  overflow: hidden;
}

.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
}

.details-body {
  padding: 16px;
}

h1 {
  margin: 8px 0 4px;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ion-color-primary);
}

h3 {
  margin: 24px 0 6px;
  font-weight: 700;
}

.organizer {
  margin: 0 0 16px;
  color: #52606d;
}

.summary-card {
  margin: 0 0 12px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;
  text-align: center;
}

.stat {
  padding: 10px 4px;
  border-radius: 12px;
  background: var(--rg-green-soft);
}

.stat strong {
  display: block;
  font-size: 0.95rem;
  color: var(--ion-color-primary);
}

.stat span {
  font-size: 0.75rem;
  color: #52606d;
}

.hint {
  margin: 4px 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: #7b8794;
}

.muted {
  color: #7b8794;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
}

.bottom-button {
  margin-top: 24px;
}

.state-box {
  text-align: center;
  padding: 64px 16px;
  color: #52606d;
}

.state-icon {
  font-size: 48px;
  color: var(--ion-color-secondary);
}
</style>