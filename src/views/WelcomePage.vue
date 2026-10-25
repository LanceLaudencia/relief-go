<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="welcome-wrapper">
        <div class="logo-circle">
          <ion-icon :icon="heartOutline" />
        </div>

        <h1>RELIEF GO</h1>
        <p class="tagline">Online Relief Fundraising and Donation Transparency</p>
        <p class="flow">Donate → Track → Verify → Show Proof</p>

        <ion-card class="demo-card">
          <ion-card-header>
            <ion-card-title>Sample Campaign Progress</ion-card-title>
            <ion-card-subtitle>Setup check only. This is not real data.</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p class="amounts">
              <strong>{{ formatPeso(raised) }}</strong> raised of {{ formatPeso(goal) }}
            </p>
            <ion-progress-bar :value="progress"></ion-progress-bar>
            <p class="percent">{{ Math.round(progress * 100) }}% funded</p>
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" shape="round" router-link="/campaigns">
          Browse Campaigns
        </ion-button>

        <template v-if="currentUser">
          <ion-button expand="block" shape="round" fill="outline" :router-link="dashboardPath">
            Go to My Dashboard
          </ion-button>
        </template>
        <template v-else>
          <ion-button expand="block" shape="round" fill="outline" router-link="/login">
            Log In
          </ion-button>
          <ion-button expand="block" shape="round" fill="clear" router-link="/register">
            Create an account
          </ion-button>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonPage,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonProgressBar,
  IonIcon,
} from '@ionic/vue';
import { heartOutline } from 'ionicons/icons';
import { formatPeso, calculateProgress } from '../utils/format';
import { currentUser } from '../services/authState';
import { dashboardPathForRole } from '../utils/roles';

// Sample values only, used to confirm the setup works
const goal = 50000;
const raised = 42000;
const progress = calculateProgress(raised, goal);

const dashboardPath = computed(() =>
  currentUser.value ? dashboardPathForRole(currentUser.value.role) : '/login'
);
</script>

<style scoped>
.welcome-wrapper {
  max-width: 480px;
  margin: 0 auto;
  padding-top: 32px;
  text-align: center;
}

.logo-circle {
  width: 84px;
  height: 84px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
}

h1 {
  margin: 8px 0 4px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--ion-color-primary);
}

.tagline {
  margin: 0 0 6px;
  color: #52606d;
}

.flow {
  margin: 0 0 20px;
  font-weight: 600;
  color: var(--ion-color-secondary-shade);
}

.demo-card {
  margin: 0 0 20px;
  text-align: left;
}

.amounts {
  margin: 0 0 10px;
}

.percent {
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: #52606d;
}
</style>