<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/campaigns/${campaignId}`"></ion-back-button>
        </ion-buttons>
        <ion-title>Donate</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="state-box">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Loading campaign...</p>
      </div>

      <div v-else-if="blockMessage" class="state-box">
        <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
        <p>{{ blockMessage }}</p>
        <ion-button shape="round" router-link="/campaigns">Back to campaigns</ion-button>
      </div>

      <div v-else-if="campaign" class="form-wrapper">
        <ion-card class="summary">
          <ion-card-header>
            <ion-card-subtitle>You are donating to</ion-card-subtitle>
            <ion-card-title>{{ campaign.title }}</ion-card-title>
          </ion-card-header>
        </ion-card>

        <!-- Step 1: amount and payment method -->
        <div v-if="step === 1">
          <h3>1. Amount and payment method</h3>

          <div class="chips">
            <ion-chip
              v-for="value in QUICK_AMOUNTS"
              :key="value"
              color="primary"
              :outline="Number(amount) !== value"
              @click="amount = String(value)"
            >
              {{ formatPeso(value) }}
            </ion-chip>
          </div>

          <ion-input
            v-model="amount"
            type="number"
            inputmode="decimal"
            label="Donation amount (₱)"
            label-placement="floating"
            fill="outline"
            class="field"
          ></ion-input>

          <ion-select
            v-model="paymentMethod"
            label="Payment method"
            label-placement="floating"
            fill="outline"
            interface="popover"
            class="field"
          >
            <ion-select-option v-for="method in PAYMENT_METHODS" :key="method" :value="method">
              {{ method }}
            </ion-select-option>
          </ion-select>

          <ion-toggle :checked="hideName" class="field" @ionChange="onHideNameChange">
            Hide my name from the public donor list
          </ion-toggle>

          <ion-text v-if="errorMessage" color="danger">
            <p class="error">{{ errorMessage }}</p>
          </ion-text>

          <ion-button expand="block" shape="round" @click="goToPayment">Continue</ion-button>
        </div>

        <!-- Step 2: payment instructions and details -->
        <div v-else>
          <h3>2. Send your payment</h3>
          <ion-card>
            <ion-card-content>
              <p>
                Send exactly <strong>{{ formatPeso(Number(amount)) }}</strong> using
                <strong>{{ paymentMethod }}</strong> to:
              </p>
              <p class="account-name">{{ account.accountName }}</p>
              <p class="account-number">{{ account.accountNumber }}</p>
              <ion-button size="small" fill="outline" @click="copyNumber">Copy number</ion-button>
              <ol class="steps">
                <li v-for="(line, index) in account.instructions" :key="index">{{ line }}</li>
              </ol>
            </ion-card-content>
          </ion-card>

          <h3>3. Enter your payment details</h3>
          <ion-input
            v-model="referenceNumber"
            label="Reference number from your receipt"
            label-placement="floating"
            fill="outline"
            :maxlength="50"
            class="field"
          ></ion-input>
          <ion-input
            v-model="senderName"
            label="Name on your GCash/Maya account"
            label-placement="floating"
            fill="outline"
            :maxlength="100"
            class="field"
          ></ion-input>

          <p class="notice">
            Submitting this form does not move any money. Your donation counts toward the campaign
            only after an administrator verifies your payment.
          </p>

          <ion-text v-if="errorMessage" color="danger">
            <p class="error">{{ errorMessage }}</p>
          </ion-text>

          <ion-button expand="block" shape="round" :disabled="submitting" @click="handleSubmit">
            <ion-spinner v-if="submitting" name="crescent"></ion-spinner>
            <span v-else>I have paid. Submit my donation</span>
          </ion-button>
          <ion-button expand="block" shape="round" fill="clear" :disabled="submitting" @click="step = 1">
            Back
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonChip,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner,
  IonText,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { Clipboard } from '@capacitor/clipboard';
import { alertCircleOutline } from 'ionicons/icons';
import { PAYMENT_ACCOUNTS } from '../config/paymentInfo';
import { currentUser } from '../services/authState';
import { getCampaignById } from '../services/campaignService';
import { createDonation, normalizeReference } from '../services/donationService';
import { MAX_DONATION, MIN_DONATION, PAYMENT_METHODS } from '../models/Donation';
import type { PaymentMethod } from '../models/Donation';
import type { Campaign } from '../models/Campaign';
import { daysLeft, formatPeso } from '../utils/format';
import { confirmAction, showToast } from '../utils/ui';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const route = useRoute();
const router = useRouter();

// Read once when the page is created
const campaignId = String(route.params.id);

const campaign = ref<Campaign | null>(null);
const loading = ref(true);
const blockMessage = ref('');
const step = ref(1);

const amount = ref('');
const paymentMethod = ref<PaymentMethod>('GCash');
const hideName = ref(false);
const referenceNumber = ref('');
const senderName = ref('');

const submitting = ref(false);
const errorMessage = ref('');

const account = computed(() => PAYMENT_ACCOUNTS[paymentMethod.value]);

function onHideNameChange(event: CustomEvent) {
  hideName.value = Boolean(event.detail.checked);
}

function resetForm() {
  step.value = 1;
  amount.value = '';
  paymentMethod.value = 'GCash';
  hideName.value = false;
  referenceNumber.value = '';
  senderName.value = currentUser.value?.displayName ?? '';
  errorMessage.value = '';
  blockMessage.value = '';
}

onIonViewWillEnter(async () => {
  resetForm();
  loading.value = true;
  try {
    campaign.value = await getCampaignById(campaignId);
    if (!campaign.value) {
      blockMessage.value = 'This campaign is not available for donations.';
    } else if (campaign.value.organizerId === currentUser.value?.uid) {
      blockMessage.value = 'You cannot donate to your own campaign.';
    } else if (daysLeft(campaign.value.deadline) === 0) {
      blockMessage.value = 'This campaign has reached its deadline and no longer accepts donations.';
    }
  } catch (error) {
    blockMessage.value = error instanceof Error ? error.message : 'Could not load the campaign.';
  } finally {
    loading.value = false;
  }
});

function goToPayment() {
  const value = Number(amount.value);
  if (!Number.isFinite(value) || value < MIN_DONATION) {
    errorMessage.value = `The minimum donation is ${formatPeso(MIN_DONATION)}.`;
    return;
  }
  if (value > MAX_DONATION) {
    errorMessage.value = `The maximum donation is ${formatPeso(MAX_DONATION)}.`;
    return;
  }
  errorMessage.value = '';
  step.value = 2;
}

async function copyNumber() {
  try {
    await Clipboard.write({ string: account.value.accountNumber });
    await showToast('Account number copied.');
  } catch (error) {
    console.error('Copy failed:', error);
    await showToast('Could not copy. Please copy the number manually.', 'danger');
  }
}

function validateDetails(): string {
  const reference = normalizeReference(referenceNumber.value);
  if (reference.length < 6 || reference.length > 40) {
    return 'Please enter the reference number from your payment receipt (6 to 40 letters or digits).';
  }
  if (senderName.value.trim().length < 2) {
    return 'Please enter the name on your GCash/Maya account.';
  }
  return '';
}

async function handleSubmit() {
  errorMessage.value = validateDetails();
  if (errorMessage.value) return;

  const user = currentUser.value;
  if (!user || !campaign.value) return;

  const reference = normalizeReference(referenceNumber.value);
  const ok = await confirmAction(
    'Submit donation',
    `Submit ${formatPeso(Number(amount.value))} via ${paymentMethod.value} with reference ${reference}? Please make sure you already sent the payment.`,
    'Submit'
  );
  if (!ok) return;

  submitting.value = true;
  try {
    const id = await createDonation(campaign.value, user, {
      amount: Number(amount.value),
      paymentMethod: paymentMethod.value,
      referenceNumber: referenceNumber.value,
      senderName: senderName.value,
      isAnonymous: hideName.value,
    });
    await showToast('Donation submitted. An administrator will verify your payment.');
    router.replace(`/donor/donations/${id}`);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not submit the donation.';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.form-wrapper {
  max-width: 520px;
  margin: 0 auto;
}

.summary {
  margin: 0 0 8px;
}

h3 {
  margin: 20px 0 10px;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.field {
  margin-bottom: 14px;
}

.account-name {
  margin: 12px 0 0;
  font-weight: 700;
}

.account-number {
  margin: 2px 0 8px;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--ion-color-primary);
}

.steps {
  margin: 14px 0 0;
  padding-left: 20px;
  color: #52606d;
  font-size: 0.9rem;
}

.notice {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--rg-green-soft);
  font-size: 0.85rem;
  color: #1f2933;
}

.error {
  margin: 0 0 12px;
  font-size: 0.9rem;
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