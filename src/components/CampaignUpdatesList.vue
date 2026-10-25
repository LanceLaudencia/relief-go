<template>
  <div class="updates">
    <p v-if="updates.length === 0" class="muted">The organizer has not posted any updates yet.</p>

    <ion-card v-for="update in updates" :key="update.id">
      <img v-if="update.imageUrl" :src="update.imageUrl" :alt="update.title" class="photo" />
      <ion-card-header>
        <ion-card-subtitle>{{ formatDate(update.createdAt) }}</ion-card-subtitle>
        <ion-card-title>{{ update.title }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p class="message">{{ update.message }}</p>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/vue';
import type { CampaignUpdate } from '../models/CampaignUpdate';
import { formatDate } from '../utils/format';

defineProps<{
  updates: CampaignUpdate[];
}>();
</script>

<style scoped>
ion-card {
  margin: 10px 0;
}

.photo {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
}

.message {
  margin: 0;
  white-space: pre-line;
}

.muted {
  color: #7b8794;
}
</style>