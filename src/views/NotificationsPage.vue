<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button :default-href="backHref"></ion-back-button>
        </ion-buttons>
        <ion-title>Notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="unreadCount === 0" @click="handleMarkAll">Mark all read</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-wrapper">
        <div v-if="notifications.length === 0" class="state-box">
          <ion-icon :icon="notificationsOffOutline" class="state-icon"></ion-icon>
          <h3>No notifications yet</h3>
          <p>You will be notified here when something changes on your campaigns or donations.</p>
        </div>

        <ion-list v-else lines="full">
          <ion-item
            v-for="item in notifications"
            :key="item.id"
            button
            :detail="true"
            :class="{ unread: !item.isRead }"
            @click="openNotification(item)"
          >
            <ion-icon slot="start" :icon="iconFor(item.type)" :color="item.isRead ? 'medium' : 'primary'"></ion-icon>
            <ion-label class="ion-text-wrap">
              <h3>{{ item.title }}</h3>
              <p>{{ item.message }}</p>
              <p class="time">{{ formatTime(item.createdAt) }}</p>
            </ion-label>
            <ion-button
              slot="end"
              fill="clear"
              color="medium"
              aria-label="Delete notification"
              @click.stop="handleDelete(item)"
            >
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  cashOutline,
  heartOutline,
  megaphoneOutline,
  notificationsOffOutline,
  trashOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import {
  deleteNotification,
  markAllAsRead,
  markAsRead,
  notifications,
  startNotificationListener,
  unreadCount,
} from '../services/notificationService';
import type { AppNotification, NotificationType } from '../models/Notification';
import { dashboardPathForRole } from '../utils/roles';
import { showToast } from '../utils/ui';

const router = useRouter();

const backHref = computed(() =>
  currentUser.value ? dashboardPathForRole(currentUser.value.role) : '/welcome'
);

// Makes sure the live list is running, even after a page refresh
onIonViewWillEnter(() => {
  if (currentUser.value) startNotificationListener(currentUser.value.uid);
});

function iconFor(type: NotificationType): string {
  if (type === 'donation') return heartOutline;
  if (type === 'expense') return cashOutline;
  return megaphoneOutline;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

async function openNotification(item: AppNotification) {
  const user = currentUser.value;
  if (!user) return;

  if (!item.isRead) {
    try {
      await markAsRead(user.uid, item.id);
    } catch (error) {
      console.error(error); // still open the page even if marking failed
    }
  }
  router.push(item.link);
}

async function handleMarkAll() {
  const user = currentUser.value;
  if (!user) return;

  try {
    const unreadIds = notifications.value.filter((n) => !n.isRead).map((n) => n.id);
    await markAllAsRead(user.uid, unreadIds);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Could not update.', 'danger');
  }
}

async function handleDelete(item: AppNotification) {
  const user = currentUser.value;
  if (!user) return;

  try {
    await deleteNotification(user.uid, item.id);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Could not delete.', 'danger');
  }
}
</script>

<style scoped>
.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

.unread {
  --background: var(--rg-green-soft);
}

.unread h3 {
  font-weight: 800;
}

.time {
  font-size: 0.75rem;
  color: #7b8794;
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