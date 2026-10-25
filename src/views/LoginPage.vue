<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/welcome"></ion-back-button>
        </ion-buttons>
        <ion-title>Log In</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-wrapper">
        <h2>Welcome back</h2>
        <p class="subtitle">Log in to donate, manage campaigns, or review submissions.</p>

        <ion-input
          v-model="email"
          type="email"
          label="Email"
          label-placement="floating"
          fill="outline"
          autocomplete="email"
          class="field"
        ></ion-input>

        <ion-input
          v-model="password"
          type="password"
          label="Password"
          label-placement="floating"
          fill="outline"
          autocomplete="current-password"
          class="field"
          @keyup.enter="handleLogin"
        >
          <ion-input-password-toggle slot="end"></ion-input-password-toggle>
        </ion-input>

        <ion-text v-if="errorMessage" color="danger">
          <p class="error">{{ errorMessage }}</p>
        </ion-text>

        <ion-button expand="block" shape="round" :disabled="loading" @click="handleLogin">
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Log In</span>
        </ion-button>

        <div class="links">
          <ion-button fill="clear" size="small" router-link="/forgot-password">
            Forgot password?
          </ion-button>
          <ion-button fill="clear" size="small" router-link="/register">
            Create an account
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
  IonSpinner,
  IonText,
} from '@ionic/vue';
import { loginUser } from '../services/authService';
import { dashboardPathForRole } from '../utils/roles';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Please enter your email and password.';
    return;
  }

  loading.value = true;
  try {
    const user = await loginUser(email.value, password.value);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '';
    const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '';
    router.replace(safeRedirect || dashboardPathForRole(user.role));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-wrapper {
  max-width: 420px;
  margin: 0 auto;
  padding-top: 16px;
}

h2 {
  margin: 0 0 4px;
  font-weight: 800;
  color: var(--ion-color-primary);
}

.subtitle {
  margin: 0 0 20px;
  color: #52606d;
}

.field {
  margin-bottom: 14px;
}

.error {
  margin: 0 0 12px;
  font-size: 0.9rem;
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
</style>