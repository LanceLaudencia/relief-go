<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/welcome"></ion-back-button>
        </ion-buttons>
        <ion-title>Campaigns</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <ion-searchbar
          v-model="searchText"
          placeholder="Search campaigns"
          :debounce="200"
        ></ion-searchbar>

        <ion-select
          v-model="selectedCategory"
          label="Category"
          label-placement="floating"
          fill="outline"
          interface="popover"
          class="category-select"
        >
          <ion-select-option value="All">All categories</ion-select-option>
          <ion-select-option
            v-for="category in CAMPAIGN_CATEGORIES"
            :key="category"
            :value="category"
          >
            {{ category }}
          </ion-select-option>
        </ion-select>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading campaigns...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="filteredCampaigns.length === 0" class="state-box">
          <ion-icon :icon="searchOutline" class="state-icon"></ion-icon>
          <h3>No campaigns found</h3>
          <p>Try a different search or category.</p>
        </div>

        <div v-else class="campaign-grid">
          <CampaignCard
            v-for="campaign in filteredCampaigns"
            :key="campaign.id"
            :campaign="campaign"
          />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { searchOutline, alertCircleOutline } from 'ionicons/icons';
import CampaignCard from '../components/CampaignCard.vue';
import { getPublicCampaigns } from '../services/campaignService';
import { CAMPAIGN_CATEGORIES } from '../models/Campaign';
import type { Campaign } from '../models/Campaign';

const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const searchText = ref('');
const selectedCategory = ref('All');

const filteredCampaigns = computed(() => {
  const term = searchText.value.trim().toLowerCase();

  return campaigns.value.filter((campaign) => {
    const matchesCategory =
      selectedCategory.value === 'All' || campaign.category === selectedCategory.value;

    const matchesSearch =
      term === '' ||
      campaign.title.toLowerCase().includes(term) ||
      campaign.description.toLowerCase().includes(term) ||
      campaign.beneficiaryName.toLowerCase().includes(term) ||
      campaign.locationAddress.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });
});

onIonViewWillEnter(async () => {
  if (campaigns.value.length === 0) loading.value = true;
  errorMessage.value = '';

  try {
    campaigns.value = await getPublicCampaigns();
  } catch (error) {
    console.error('Failed to load campaigns:', error);
    errorMessage.value = error instanceof Error ? error.message : 'We could not load the campaigns.';
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

.category-select {
  margin: 8px 0 16px;
}

.campaign-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
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