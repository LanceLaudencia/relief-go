<template>
  <ion-card button :router-link="`/campaigns/${campaign.id}`" class="campaign-card">
    <div class="card-image">
      <img v-if="campaign.imageUrl" :src="campaign.imageUrl" :alt="campaign.title" />
      <div v-else class="image-placeholder">
        <ion-icon :icon="heartOutline" />
      </div>
      <span class="category-badge">{{ campaign.category }}</span>
    </div>

    <ion-card-header>
      <ion-card-title>{{ campaign.title }}</ion-card-title>
      <ion-card-subtitle>{{ campaign.beneficiaryName }}</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <CampaignProgress :raised="campaign.verifiedTotal" :goal="campaign.goalAmount" />
      <p class="days-left">
        <ion-icon :icon="timeOutline" />
        {{ remainingText }}
      </p>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
} from '@ionic/vue';
import { heartOutline, timeOutline } from 'ionicons/icons';
import CampaignProgress from './CampaignProgress.vue';
import type { Campaign } from '../models/Campaign';
import { daysLeft } from '../utils/format';

const props = defineProps<{
  campaign: Campaign;
}>();

const remainingText = computed(() => {
  const days = daysLeft(props.campaign.deadline);
  if (days === 0) return 'Deadline reached';
  return days === 1 ? '1 day left' : `${days} days left`;
});
</script>

<style scoped>
.campaign-card {
  margin: 0;
}

.card-image {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
}

.category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.92);
  color: var(--ion-color-primary);
}

.days-left {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 0;
  font-size: 0.9rem;
  color: #52606d;
}
</style>