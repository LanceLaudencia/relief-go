<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Donor Dashboard</ion-title>
        <ion-buttons slot="end">
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
        <p>
          You are logged in as a <strong>donor</strong>
        </p>
        <ion-button expand="block" shape="round" router-link="/campaigns">
          Browse Campaigns
        </ion-button>
        <ion-button expand="block" shape="round" fill="outline" router-link="/donor/donations">
          My Donations
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
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
} from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';

const router = useRouter();

async function handleLogout() {
  await logoutUser();
  router.replace('/welcome');
}
</script>

<style scoped>
.wrapper {
  max-width: 480px;
  margin: 0 auto;
  padding-top: 16px;
}

h2 {
  font-weight: 800;
  color: var(--ion-color-primary);
}
</style>