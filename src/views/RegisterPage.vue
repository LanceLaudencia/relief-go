<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/welcome"></ion-back-button>
        </ion-buttons>
        <ion-title>Create Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-wrapper">
        <h2>Join RELIEF GO</h2>
        <p class="subtitle">Create an account to donate or to raise funds for relief.</p>

        <ion-input
          v-model="displayName"
          label="Full name"
          label-placement="floating"
          fill="outline"
          autocomplete="name"
          class="field"
        ></ion-input>

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
          v-model="phone"
          type="tel"
          label="Mobile number (optional)"
          label-placement="floating"
          fill="outline"
          autocomplete="tel"
          class="field"
        ></ion-input>

        <ion-select
          v-model="role"
          label="I want to join as"
          label-placement="floating"
          fill="outline"
          interface="popover"
          class="field"
        >
          <ion-select-option value="donor">Donor (I want to donate)</ion-select-option>
          <ion-select-option value="organizer">Organizer (I want to raise funds)</ion-select-option>
        </ion-select>

        <ion-input
          v-model="password"
          type="password"
          label="Password (at least 8 characters)"
          label-placement="floating"
          fill="outline"
          autocomplete="new-password"
          class="field"
        >
          <ion-input-password-toggle slot="end"></ion-input-password-toggle>
        </ion-input>

        <ion-input
          v-model="confirmPassword"
          type="password"
          label="Confirm password"
          label-placement="floating"
          fill="outline"
          autocomplete="new-password"
          class="field"
          @keyup.enter="handleRegister"
        >
          <ion-input-password-toggle slot="end"></ion-input-password-toggle>
        </ion-input>

        <ion-text v-if="errorMessage" color="danger">
          <p class="error">{{ errorMessage }}</p>
        </ion-text>

        <ion-button expand="block" shape="round" :disabled="loading" @click="handleRegister">
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Create Account</span>
        </ion-button>

        <div class="links">
          <ion-button fill="clear" size="small" router-link="/login">
            Already have an account? Log in
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonText,
} from '@ionic/vue';
import { registerUser } from '../services/authService';
import { dashboardPathForRole } from '../utils/roles';

const router = useRouter();

const displayName = ref('');
const email = ref('');
const phone = ref('');
const role = ref<'donor' | 'organizer'>('donor');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');

function validate(): string {
  if (!displayName.value.trim()) return 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    return 'Please enter a valid email address.';
  }
  if (password.value.length < 8) return 'Password must be at least 8 characters.';
  if (password.value !== confirmPassword.value) return 'Passwords do not match.';
  return '';
}

async function handleRegister() {
  errorMessage.value = validate();
  if (errorMessage.value) return;

  loading.value = true;
  try {
    const user = await registerUser({
      displayName: displayName.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
      role: role.value,
    });
    router.replace(dashboardPathForRole(user.role));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Registration failed.';
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
  justify-content: center;
  margin-top: 8px;
}
</style>