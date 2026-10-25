<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Forgot Password</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-wrapper">
        <h2>Reset your password</h2>
        <p class="subtitle">
          Enter your email and we will send you a link to choose a new password.
        </p>

        <ion-input
          v-model="email"
          type="email"
          label="Email"
          label-placement="floating"
          fill="outline"
          autocomplete="email"
          class="field"
          @keyup.enter="handleReset"
        ></ion-input>

        <ion-text v-if="errorMessage" color="danger">
          <p class="message">{{ errorMessage }}</p>
        </ion-text>
        <ion-text v-if="successMessage" color="success">
          <p class="message">{{ successMessage }}</p>
        </ion-text>

        <ion-button expand="block" shape="round" :disabled="loading" @click="handleReset">
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Send Reset Link</span>
        </ion-button>

        <div class="links">
          <ion-button fill="clear" size="small" router-link="/login">Back to log in</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
} from '@ionic/vue';
import { sendResetEmail } from '../services/authService';

const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

async function handleReset() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errorMessage.value = 'Please enter a valid email address.';
    return;
  }

  loading.value = true;
  try {
    await sendResetEmail(email.value);
    successMessage.value =
      'If an account exists for this email, a reset link has been sent. Please check your inbox and spam folder.';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not send the email.';
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

.message {
  margin: 0 0 12px;
  font-size: 0.9rem;
}

.links {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
</style>