<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>User Management</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <ion-searchbar
          v-model="searchText"
          placeholder="Search by name or email"
          :debounce="200"
        ></ion-searchbar>

        <p class="summary">
          {{ users.length }} accounts • {{ suspendedCount }} suspended
        </p>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading users...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="state-box">
          <ion-icon :icon="peopleOutline" class="state-icon"></ion-icon>
          <h3>No users found</h3>
        </div>

        <template v-else>
          <ion-card v-for="user in filteredUsers" :key="user.uid">
            <ion-card-header>
              <div class="chips">
                <ion-chip :color="user.role === 'admin' ? 'tertiary' : 'secondary'">
                  {{ roleLabel(user.role) }}
                </ion-chip>
                <ion-chip :color="user.isSuspended ? 'danger' : 'success'">
                  {{ user.isSuspended ? 'Suspended' : 'Active' }}
                </ion-chip>
              </div>
              <ion-card-title>{{ user.displayName }}</ion-card-title>
              <ion-card-subtitle>{{ user.email }}</ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <p v-if="user.phone"><strong>Mobile:</strong> {{ user.phone }}</p>
              <p><strong>Joined:</strong> {{ formatDate(user.createdAt) }}</p>

              <ion-button
                v-if="canManage(user)"
                size="small"
                :color="user.isSuspended ? 'primary' : 'danger'"
                :fill="user.isSuspended ? 'solid' : 'outline'"
                :disabled="busyId === user.uid"
                @click="handleToggle(user)"
              >
                {{ user.isSuspended ? 'Reactivate' : 'Suspend' }}
              </ion-button>
              <p v-else class="muted">
                {{ user.uid === currentUser?.uid ? 'This is your account.' : 'Administrator accounts cannot be suspended here.' }}
              </p>
            </ion-card-content>
          </ion-card>
        </template>
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
  IonSearchbar,
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
import { alertCircleOutline, peopleOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getAllUsers, setUserSuspended } from '../services/userService';
import type { AppUser, UserRole } from '../models/User';
import { formatDate } from '../utils/format';
import { askReason, confirmAction, showToast } from '../utils/ui';

const users = ref<AppUser[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const searchText = ref('');
const busyId = ref('');

const suspendedCount = computed(() => users.value.filter((u) => u.isSuspended).length);

const filteredUsers = computed(() => {
  const term = searchText.value.trim().toLowerCase();
  if (!term) return users.value;
  return users.value.filter(
    (u) => u.displayName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
  );
});

function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Administrator' : 'Member';
}

/** Admins can suspend regular accounts, but not other admins or themselves. */
function canManage(user: AppUser): boolean {
  return user.role !== 'admin' && user.uid !== currentUser.value?.uid;
}

async function loadUsers() {
  errorMessage.value = '';
  try {
    users.value = await getAllUsers();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load users.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(async () => {
  if (users.value.length === 0) loading.value = true;
  await loadUsers();
});

async function handleToggle(user: AppUser) {
  if (user.isSuspended) {
    const ok = await confirmAction(
      'Reactivate account',
      `Allow ${user.displayName} to log in again?`,
      'Reactivate'
    );
    if (!ok) return;
    await runAction(user, '', false, 'Account reactivated.');
    return;
  }

  const reason = await askReason(
    'Suspend account',
    `Why is ${user.displayName}'s account being suspended? They will not be able to log in. Their campaigns stay online unless you suspend them separately.`,
    'Suspend'
  );
  if (!reason) return;
  await runAction(user, reason, true, 'Account suspended.');
}

async function runAction(user: AppUser, reason: string, suspended: boolean, message: string) {
  busyId.value = user.uid;
  try {
    await setUserSuspended(user, suspended, reason);
    await loadUsers();
    await showToast(message);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Action failed.', 'danger');
  } finally {
    busyId.value = '';
  }
}
</script>

<style scoped>
.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

.summary {
  margin: 0 0 8px;
  color: #52606d;
  font-size: 0.9rem;
}

ion-card {
  margin: 12px 0;
}

ion-card-content p {
  margin: 4px 0 10px;
}

.chips {
  display: flex;
  gap: 4px;
}

.muted {
  color: #7b8794;
  font-size: 0.85rem;
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
