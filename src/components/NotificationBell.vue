<template>
  <ion-button class="bell" router-link="/notifications" aria-label="Notifications">
    <ion-icon slot="icon-only" :icon="notificationsOutline"></ion-icon>
    <ion-badge v-if="unreadCount > 0" color="danger" class="badge">
      {{ unreadCount > 9 ? '9+' : unreadCount }}
    </ion-badge>
  </ion-button>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { IonBadge, IonButton, IonIcon } from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import {
  startNotificationListener,
  stopNotificationListener,
  unreadCount,
} from '../services/notificationService';

// Start listening when someone is logged in, and stop when they log out
watch(
  () => currentUser.value?.uid,
  (uid) => {
    if (uid) startNotificationListener(uid);
    else stopNotificationListener();
  },
  { immediate: true }
);
</script>

<style scoped>
.bell {
  position: relative;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  padding: 2px 5px;
  font-size: 0.65rem;
  line-height: 1;
  border-radius: 999px;
}
</style>