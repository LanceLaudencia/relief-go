<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>My Dashboard</ion-title>
        <ion-buttons slot="end">
          <NotificationBell />
          <ion-button @click="handleLogout">
            <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
            Log out
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="wrapper">
        <h2>Hello, {{ currentUser?.displayName }}!</h2>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading your dashboard...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <template v-else>
          <h3>As a donor</h3>
          <div class="stat-grid">
            <div class="stat">
              <strong>{{ formatPeso(donatedTotal) }}</strong>
              <span>Verified donations</span>
            </div>
            <div class="stat">
              <strong>{{ verifiedCount }}</strong>
              <span>Donations verified</span>
            </div>
            <div class="stat warn">
              <strong>{{ pendingCount }}</strong>
              <span>Waiting for verification</span>
            </div>
          </div>

          <ion-card>
            <ion-card-header>
              <ion-card-title>Recent donations</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p v-if="recentDonations.length === 0" class="muted">
                You have not donated yet. Pick a campaign to support.
              </p>
              <ion-list v-else lines="full">
                <ion-item
                  v-for="donation in recentDonations"
                  :key="donation.id"
                  button
                  :router-link="`/donor/donations/${donation.id}`"
                >
                  <ion-label>
                    <h4>{{ donation.campaignTitle }}</h4>
                    <p>{{ formatDate(donation.transactionDate) }}</p>
                  </ion-label>
                  <ion-chip slot="end" :color="donationStatusColor(donation.status)">
                    {{ formatPeso(donation.amount) }}
                  </ion-chip>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <ion-button expand="block" shape="round" router-link="/campaigns">
            Browse Campaigns
          </ion-button>
          <ion-button expand="block" shape="round" fill="outline" router-link="/donor/donations">
            All My Donations
          </ion-button>

          <h3>As a fundraiser</h3>
          <div class="stat-grid">
            <div class="stat">
              <strong>{{ campaigns.length }}</strong>
              <span>My campaigns</span>
            </div>
            <div class="stat">
              <strong>{{ formatPeso(raisedTotal) }}</strong>
              <span>Raised across my campaigns</span>
            </div>
          </div>

          <ion-card v-for="campaign in liveCampaigns" :key="campaign.id">
            <ion-card-header>
              <ion-card-title>{{ campaign.title }}</ion-card-title>
              <ion-card-subtitle>
                {{ campaign.verifiedDonorCount }} verified
                {{ campaign.verifiedDonorCount === 1 ? 'donor' : 'donors' }} •
                Deadline {{ formatDate(campaign.deadline) }}
              </ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <CampaignProgress :raised="campaign.verifiedTotal" :goal="campaign.goalAmount" />
            </ion-card-content>
          </ion-card>
          <p v-if="campaigns.length === 0" class="muted">
            You have not started a campaign yet.
          </p>

          <ion-button expand="block" shape="round" router-link="/organizer/campaigns/new">
            Start a Campaign
          </ion-button>
          <ion-button expand="block" shape="round" fill="outline" router-link="/organizer/campaigns">
            My Campaigns
          </ion-button>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline, logOutOutline } from 'ionicons/icons';
import CampaignProgress from '../components/CampaignProgress.vue';
import NotificationBell from '../components/NotificationBell.vue';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import { getMyCampaigns } from '../services/campaignService';
import { getMyDonations } from '../services/donationService';
import type { Campaign } from '../models/Campaign';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { donationStatusColor } from '../utils/ui';

const router = useRouter();

const donations = ref<Donation[]>([]);
const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');

const verifiedDonations = computed(() => donations.value.filter((d) => d.status === 'Verified'));
const donatedTotal = computed(() =>
  verifiedDonations.value.reduce((sum, donation) => sum + donation.amount, 0)
);
const verifiedCount = computed(() => verifiedDonations.value.length);
const pendingCount = computed(
  () => donations.value.filter((d) => d.status === 'Pending Verification').length
);
const recentDonations = computed(() => donations.value.slice(0, 3));

const raisedTotal = computed(() =>
  campaigns.value.reduce((sum, campaign) => sum + campaign.verifiedTotal, 0)
);
const liveCampaigns = computed(() => campaigns.value.filter((c) => c.status === 'Active'));

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  if (!user) return;

  if (donations.value.length === 0 && campaigns.value.length === 0) loading.value = true;
  errorMessage.value = '';

  try {
    const [myDonations, myCampaigns] = await Promise.all([
      getMyDonations(user.uid),
      getMyCampaigns(user.uid),
    ]);
    donations.value = myDonations;
    campaigns.value = myCampaigns;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the dashboard.';
  } finally {
    loading.value = false;
  }
});

async function handleLogout() {
  await logoutUser();
  router.replace('/welcome');
}
</script>

<style scoped>
.wrapper {
  max-width: 560px;
  margin: 0 auto;
  padding-top: 8px;
}

h2 {
  font-weight: 800;
  color: var(--ion-color-primary);
}

h3 {
  margin: 24px 0 8px;
  font-weight: 700;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 8px;
}

.stat {
  padding: 14px 10px;
  border-radius: 16px;
  background: var(--rg-green-soft);
  text-align: center;
}

.stat.warn {
  background: #fff7e0;
}

.stat strong {
  display: block;
  font-size: 1.1rem;
  color: var(--ion-color-primary);
}

.stat span {
  font-size: 0.8rem;
  color: #52606d;
}

ion-card {
  margin: 12px 0;
}

.muted {
  color: #7b8794;
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