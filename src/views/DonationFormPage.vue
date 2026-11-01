<template>
  <ion-page class="rg-donate-page">
    <ion-header class="rg-header">
      <nav class="rg-navbar" aria-label="Donation navigation">
        <router-link to="/welcome" class="rg-brand" aria-label="ReliefGO home">
          Relief<span>GO</span><b>♥</b>
        </router-link>
        <router-link :to="`/campaigns/${campaignId}`" class="nav-back">
          <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
          <span>BACK TO CAMPAIGN</span>
        </router-link>
      </nav>
    </ion-header>

    <ion-content class="rg-content">
      <div class="page-shell">
        <main class="page-main">
          <section v-if="loading" class="feedback-card" aria-live="polite">
            <ion-spinner name="crescent" />
            <h2>Preparing your donation...</h2>
            <p>Loading the campaign information.</p>
          </section>

          <section v-else-if="blockMessage || !campaign" class="feedback-card" role="alert">
            <ion-icon class="feedback-icon" :icon="alertCircleOutline" aria-hidden="true" />
            <h2>Donation unavailable</h2>
            <p>{{ blockMessage || 'This campaign is currently unavailable.' }}</p>
            <router-link to="/campaigns" class="text-action">
              EXPLORE CAMPAIGNS
              <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
            </router-link>
          </section>

          <div v-else class="donation-layout">
            <!-- Campaign identity panel. Live campaign title is loaded from database. -->
            <aside class="campaign-panel">
              <div>
                <p class="eyebrow">GIVE WITH HEART <span>✦</span></p>
                <h1>Make <em>kindness</em> go further.</h1>
                <p class="panel-description">
                  Every contribution can make a meaningful difference.
                  Support a cause that matters and follow its journey with ReliefGO.
                </p>
              </div>

              <div class="campaign-context">
                <span class="context-icon" aria-hidden="true"><ion-icon :icon="heartOutline" /></span>
                <p>YOU ARE SUPPORTING</p>
                <h2>{{ campaign.title }}</h2>
                <span class="campaign-category">{{ campaign.category }}</span>
              </div>

              <div class="panel-bottom">
                <ion-icon :icon="shieldCheckmarkOutline" aria-hidden="true" />
                <span>Donation records are verified before they count toward fundraising totals.</span>
              </div>
            </aside>

            <!-- Two-step form; existing payment and submit services are unchanged. -->
            <section class="donation-panel" aria-labelledby="donate-heading">
              <div class="form-topline">
                <p class="form-eyebrow">YOUR BAYANIHAN JOURNEY</p>
                <span class="step-counter">STEP {{ step }} OF 2</span>
              </div>
              <div class="step-progress" aria-label="Donation progress">
                <span class="step-segment" :class="{ active: step >= 1 }"></span>
                <span class="step-segment" :class="{ active: step >= 2 }"></span>
              </div>

              <template v-if="step === 1">
                <h2 id="donate-heading">Your <em>donation.</em></h2>
                <p class="form-description">
                  Choose how much you'd like to give and how you'll send your payment.
                </p>

                <div class="form-section-label">
                  <ion-icon :icon="heartOutline" aria-hidden="true" />
                  <h3>Choose an amount</h3>
                </div>
                <div class="amount-grid" aria-label="Suggested donation amounts">
                  <button
                    v-for="value in QUICK_AMOUNTS"
                    :key="value"
                    type="button"
                    class="amount-option"
                    :class="{ selected: Number(amount) === value }"
                    :aria-pressed="Number(amount) === value"
                    @click="amount = String(value)"
                  >
                    {{ formatPeso(value) }}
                  </button>
                </div>

                <div class="field-group">
                  <label class="field-label" for="donation-amount">DONATION AMOUNT (₱)</label>
                  <ion-input
                    id="donation-amount"
                    v-model="amount"
                    type="number"
                    inputmode="decimal"
                    aria-label="Donation amount in pesos"
                    placeholder="Enter your amount"
                    fill="outline"
                    class="rg-field"
                  ></ion-input>
                </div>

                <div class="field-group">
                  <label class="field-label" for="donation-method">PAYMENT METHOD</label>
                  <ion-select
                    id="donation-method"
                    v-model="paymentMethod"
                    interface="popover"
                    fill="outline"
                    aria-label="Payment method"
                    class="rg-field rg-select"
                  >
                    <ion-select-option v-for="method in PAYMENT_METHODS" :key="method" :value="method">
                      {{ method }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <div class="privacy-row">
                  <div>
                    <strong>Give anonymously</strong>
                    <p>Hide my name from the public donor list.</p>
                  </div>
                  <ion-toggle
                    aria-label="Hide my name from the public donor list"
                    :checked="hideName"
                    @ionChange="onHideNameChange"
                  ></ion-toggle>
                </div>

                <ion-text v-if="errorMessage" color="danger" role="alert" aria-live="polite">
                  <p class="form-error">{{ errorMessage }}</p>
                </ion-text>

                <ion-button expand="block" class="gold-button" @click="goToPayment">
                  CONTINUE TO PAYMENT
                  <ion-icon slot="end" :icon="arrowForwardOutline" aria-hidden="true" />
                </ion-button>

                <p class="form-footnote">
                  <ion-icon :icon="lockClosedOutline" aria-hidden="true" />
                  You'll review payment instructions before submitting anything.
                </p>
              </template>

              <template v-else>
                <h2 id="donate-heading">Complete your <em>gift.</em></h2>
                <p class="form-description">
                  Send the payment using the account information below, then submit its reference.
                </p>

                <div class="payment-summary">
                  <div class="payment-summary-top">
                    <ion-icon :icon="walletOutline" aria-hidden="true" />
                    <span>PAYMENT INSTRUCTIONS</span>
                  </div>
                  <div class="payment-pair">
                    <span>Amount to send</span>
                    <strong>{{ formatPeso(Number(amount)) }}</strong>
                  </div>
                  <div class="payment-pair">
                    <span>Via</span>
                    <strong>{{ paymentMethod }}</strong>
                  </div>
                  <div class="payment-divider"></div>
                  <p class="account-label">ACCOUNT NAME</p>
                  <strong class="account-name">{{ account.accountName }}</strong>
                  <p class="account-label account-label-number">ACCOUNT NUMBER</p>
                  <div class="account-number-row">
                    <strong class="account-number">{{ account.accountNumber }}</strong>
                    <button type="button" class="copy-button" @click="copyNumber">
                      <ion-icon :icon="copyOutline" aria-hidden="true" />
                      COPY
                    </button>
                  </div>
                  <ol class="payment-steps">
                    <li v-for="(line, index) in account.instructions" :key="index">{{ line }}</li>
                  </ol>
                </div>

                <div class="form-section-label details-label">
                  <ion-icon :icon="receiptOutline" aria-hidden="true" />
                  <h3>Enter your payment details</h3>
                </div>
                <div class="field-group">
                  <label class="field-label" for="payment-reference">RECEIPT REFERENCE NUMBER</label>
                  <ion-input
                    id="payment-reference"
                    v-model="referenceNumber"
                    aria-label="Reference number from your receipt"
                    placeholder="Enter your receipt reference"
                    fill="outline"
                    :maxlength="50"
                    class="rg-field"
                  ></ion-input>
                </div>
                <div class="field-group">
                  <label class="field-label" for="payment-sender">ACCOUNT HOLDER'S NAME</label>
                  <ion-input
                    id="payment-sender"
                    v-model="senderName"
                    aria-label="Name on your GCash or Maya account"
                    placeholder="Name used for the payment"
                    fill="outline"
                    :maxlength="100"
                    class="rg-field"
                  ></ion-input>
                </div>

                <div class="notice-box">
                  <ion-icon :icon="checkmarkCircleOutline" aria-hidden="true" />
                  <p>
                    This form <strong>does not send money</strong>. Only submit after you have paid.
                    Donations count toward the campaign after administrator verification.
                  </p>
                </div>

                <ion-text v-if="errorMessage" color="danger" role="alert" aria-live="polite">
                  <p class="form-error">{{ errorMessage }}</p>
                </ion-text>

                <ion-button
                  expand="block"
                  class="gold-button"
                  :disabled="submitting"
                  @click="handleSubmit"
                >
                  <ion-spinner v-if="submitting" name="crescent" />
                  <template v-else>
                    I HAVE PAID · SUBMIT DONATION
                    <ion-icon slot="end" :icon="arrowForwardOutline" aria-hidden="true" />
                  </template>
                </ion-button>
                <button type="button" class="back-step" :disabled="submitting" @click="step = 1">
                  <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
                  BACK TO AMOUNT &amp; PAYMENT METHOD
                </button>
              </template>
            </section>
          </div>
        </main>

        <footer class="rg-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
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
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { Clipboard } from '@capacitor/clipboard';
import {
  alertCircleOutline,
  arrowBackOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  copyOutline,
  heartOutline,
  lockClosedOutline,
  receiptOutline,
  shieldCheckmarkOutline,
  walletOutline,
} from 'ionicons/icons';
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
/* ReliefGO: matching cream / forest green / terracotta / mustard visual identity. */
.rg-donate-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --terracotta: #c66b46;
  --gold: #e8ae4c;
  --card: #fff9ed;
  --line: #e9dec9;
  background: var(--cream);
  color: var(--forest);
}
.rg-donate-page, .rg-donate-page * { box-sizing: border-box; }
.rg-donate-page a { text-decoration: none; }
.rg-header { background: var(--cream); box-shadow: none; }
.rg-header::after { display: none; }
.rg-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  min-height: 74px;
  padding: 12px clamp(18px, 4vw, 64px);
  border-bottom: 1px solid #e8deca;
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.rg-brand {
  color: var(--forest);
  font: 700 clamp(29px, 2.5vw, 37px)/1 Georgia, 'Times New Roman', serif;
  letter-spacing: -1.8px;
  white-space: nowrap;
}
.rg-brand span, .rg-brand b { color: var(--terracotta); }
.rg-brand b { font-size: 12px; letter-spacing: 0; vertical-align: top; }
.nav-back {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--forest);
  font: 800 11px/1.3 'DM Sans', 'Segoe UI', Arial, sans-serif;
  letter-spacing: 1.2px;
  white-space: nowrap;
}
.nav-back ion-icon { font-size: 20px; }
.nav-back:hover, .nav-back:focus-visible { color: var(--terracotta); }
.rg-content {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.rg-content::part(background), .rg-content::part(scroll) { background: #f8f3e4; }
.page-shell {
  min-height: calc(100dvh - 74px);
  display: flex;
  flex-direction: column;
  padding: 28px clamp(16px, 4vw, 64px) 0;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.page-main { width: min(100%, 1240px); margin: 0 auto; }
.donation-layout {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  border: 1px solid var(--line);
  border-radius: 21px;
  overflow: hidden;
  background: var(--card);
  box-shadow: 0 13px 34px rgba(25, 57, 39, .045);
}
.campaign-panel {
  position: relative;
  background: linear-gradient(146deg, var(--forest), var(--deep) 94%);
  color: #fff8e8;
  padding: clamp(32px, 4vw, 58px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  min-width: 0;
  isolation: isolate;
}
.campaign-panel::before {
  position: absolute;
  content: '';
  inset: auto -80px 15% auto;
  width: 290px;
  height: 290px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,174,76,.16), transparent 73%);
  z-index: -1;
  pointer-events: none;
}
.eyebrow, .form-eyebrow, .campaign-context > p, .account-label, .field-label,
.payment-summary-top, .step-counter {
  font-weight: 800;
  letter-spacing: 1.65px;
  font-size: 10px;
}
.eyebrow { color: var(--gold); margin: 0 0 19px; }
.eyebrow span { color: #fff8e8; }
.campaign-panel h1 {
  margin: 0 0 19px;
  font: 400 clamp(38px, 3.4vw, 56px)/1.1 Georgia, 'Times New Roman', serif;
  letter-spacing: -1.3px;
  max-width: 440px;
}
.campaign-panel h1 em { color: var(--gold); font-weight: 400; }
.panel-description { margin: 0; color: #d7e2d7; max-width: 430px; font-size: 14px; line-height: 1.8; }
.campaign-context {
  border: 1px solid rgba(255,248,232,.18);
  border-radius: 17px;
  background: rgba(255,248,232,.075);
  padding: 24px;
  min-width: 0;
}
.context-icon {
  display: inline-grid;
  place-items: center;
  width: 49px;
  height: 49px;
  border-radius: 15px;
  margin-bottom: 13px;
  background: rgba(232,174,76,.17);
  color: var(--gold);
  font-size: 28px;
}
.campaign-context > p { margin: 0 0 10px; color: var(--gold); }
.campaign-context h2 {
  margin: 0 0 13px;
  font: 400 clamp(22px, 2.25vw, 32px)/1.22 Georgia, 'Times New Roman', serif;
  overflow-wrap: anywhere;
}
.campaign-category {
  display: inline-block;
  border: 1px solid rgba(255,248,232,.21);
  border-radius: 30px;
  padding: 8px 12px;
  font-size: 11px;
  color: #fff8e8;
}
.panel-bottom { display: flex; gap: 12px; align-items: flex-start; color: #d3e0d6; font-size: 12px; line-height: 1.6; }
.panel-bottom ion-icon { flex: 0 0 22px; color: var(--gold); font-size: 23px; }
.donation-panel { min-width: 0; padding: clamp(25px, 3.4vw, 51px); }
.form-topline { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
.form-eyebrow { color: var(--terracotta); margin: 0; }
.step-counter { white-space: nowrap; color: #738276; }
.step-progress { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0 24px; }
.step-segment { height: 5px; border-radius: 8px; background: #e4e9df; }
.step-segment.active { background: var(--gold); }
.donation-panel > h2 {
  margin: 0 0 11px;
  font: 400 clamp(36px, 3.1vw, 47px)/1.1 Georgia, 'Times New Roman', serif;
  letter-spacing: -1.1px;
  color: var(--forest);
}
.donation-panel > h2 em { font-weight: 400; color: var(--terracotta); }
.form-description { margin: 0 0 26px; font-size: 13px; line-height: 1.7; color: #607263; }
.form-section-label { display: flex; align-items: center; gap: 10px; margin-bottom: 13px; }
.form-section-label ion-icon { font-size: 21px; color: var(--terracotta); }
.form-section-label h3 { font: 400 21px/1.2 Georgia, serif; margin: 0; color: var(--forest); }
.amount-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; margin-bottom: 20px; }
.amount-option {
  appearance: none;
  cursor: pointer;
  border: 1px solid #e5d6be;
  background: #fffdf7;
  color: var(--forest);
  font: 800 12px/1.3 'DM Sans', 'Segoe UI', Arial, sans-serif;
  border-radius: 12px;
  padding: 15px 4px;
  text-align: center;
  transition: background .2s, border-color .2s;
}
.amount-option:hover, .amount-option:focus-visible { border-color: var(--gold); background: #fff4dc; }
.amount-option.selected { border-color: var(--gold); background: #f9e7c2; box-shadow: inset 0 0 0 1px var(--gold); }
.field-group { width: 100%; min-width: 0; margin-bottom: 19px; }
.field-label { display: block; color: var(--forest); margin: 0 0 9px 2px; }
.rg-field {
  display: block;
  width: 100%;
  min-height: 54px;
  font: 500 15px/1.4 'DM Sans', 'Segoe UI', Arial, sans-serif;
  --background: #fffdf7;
  --color: #183c2c;
  --placeholder-color: #8a9286;
  --placeholder-opacity: 1;
  --border-width: 1px;
  --border-color: #d9cfbb;
  --highlight-color-focused: #c66b46;
  --border-radius: 12px;
  --padding-start: 15px;
  --padding-end: 14px;
  --padding-top: 13px;
  --padding-bottom: 13px;
}
.rg-field.ion-focused { --border-color: #c66b46; }
.privacy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: #f3eedf;
  border-radius: 13px;
  padding: 15px 17px;
  margin: 8px 0 20px;
}
.privacy-row strong { display: block; font-size: 13px; color: var(--forest); }
.privacy-row p { margin: 3px 0 0; color: #647265; font-size: 12px; line-height: 1.5; }
.privacy-row ion-toggle { flex: 0 0 auto; --track-background-checked: #e8ae4c; --handle-background-checked: #183c2c; }
.form-error { margin: 0 0 13px; font-size: 12px; line-height: 1.5; }
.gold-button {
  margin: 0;
  width: 100%;
  min-height: 53px;
  --background: #e8ae4c;
  --background-hover: #f2be63;
  --background-activated: #d99e34;
  --color: #102a20;
  --border-radius: 100px;
  --box-shadow: none;
  font: 800 12px/1.2 'DM Sans', 'Segoe UI', Arial, sans-serif;
  letter-spacing: 1.05px;
}
.gold-button ion-icon { font-size: 19px; }
.form-footnote { display: flex; justify-content: center; gap: 8px; align-items: center; text-align: center; color: #6a776c; font-size: 11px; line-height: 1.5; margin: 14px 0 0; }
.form-footnote ion-icon { color: var(--terracotta); flex-shrink: 0; font-size: 15px; }
.payment-summary { border-radius: 17px; border: 1px solid #e9ddc7; padding: 20px; background: #fffdf7; margin-bottom: 22px; }
.payment-summary-top { display: flex; align-items: center; gap: 9px; color: var(--terracotta); margin-bottom: 18px; }
.payment-summary-top ion-icon { font-size: 20px; }
.payment-pair { display: flex; justify-content: space-between; gap: 15px; align-items: baseline; font-size: 13px; color: #687667; margin: 10px 0; }
.payment-pair strong { color: var(--forest); font: 400 20px Georgia, serif; text-align: right; overflow-wrap: anywhere; }
.payment-divider { height: 1px; background: var(--line); margin: 16px 0; }
.account-label { color: var(--terracotta); margin: 0 0 5px; }
.account-label-number { margin-top: 17px; }
.account-name { display: block; font: 400 22px Georgia, serif; color: var(--forest); overflow-wrap: anywhere; }
.account-number-row { display: flex; align-items: center; justify-content: space-between; gap: 13px; }
.account-number { font: 400 clamp(20px, 2.15vw, 30px) Georgia, serif; overflow-wrap: anywhere; color: var(--forest); }
.copy-button { display: inline-flex; align-items: center; gap: 7px; border: 1px solid #dec9a6; background: #fff5df; color: var(--forest); cursor: pointer; border-radius: 10px; padding: 11px 12px; font-size: 10px; font-weight: 800; flex: 0 0 auto; }
.copy-button:hover { background: #f9e6bc; }
.copy-button ion-icon { font-size: 16px; }
.payment-steps { color: #627263; font-size: 12px; line-height: 1.7; margin: 18px 0 0; padding-left: 19px; }
.payment-steps li + li { margin-top: 4px; }
.details-label { margin-top: 8px; }
.notice-box { background: #edf2e7; border: 1px solid #d5e4cf; border-radius: 13px; padding: 15px; display: flex; gap: 10px; align-items: flex-start; margin: 7px 0 20px; }
.notice-box ion-icon { font-size: 21px; flex: 0 0 21px; color: #408b55; }
.notice-box p { margin: 0; color: #4f6553; font-size: 12px; line-height: 1.6; }
.back-step { display: flex; align-items: center; justify-content: center; gap: 8px; background: none; border: 0; cursor: pointer; color: var(--forest); font-weight: 800; font-size: 11px; letter-spacing: 1px; width: 100%; padding: 17px 4px 5px; }
.back-step:hover { color: var(--terracotta); }
.back-step:disabled { cursor: not-allowed; opacity: .55; }
.back-step ion-icon { font-size: 18px; }
.feedback-card { min-height: 55dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 12px; padding: 35px 18px; }
.feedback-icon { font-size: 42px; color: var(--terracotta); }
.feedback-card ion-spinner { color: var(--forest); width: 40px; height: 40px; }
.feedback-card h2 { color: var(--forest); font: 400 36px Georgia, serif; margin: 0; }
.feedback-card p { font-size: 14px; color: #657464; line-height: 1.6; max-width: 460px; margin: 0; }
.text-action { display: flex; align-items: center; gap: 10px; color: var(--deep); background: var(--gold); border-radius: 50px; padding: 13px 21px; margin-top: 15px; font-weight: 800; letter-spacing: 1px; font-size: 11px; }
.text-action ion-icon { font-size: 17px; }
.rg-footer { width: min(100%, 1240px); margin: auto auto 0; padding: 18px 0; display: flex; justify-content: space-between; gap: 14px; color: #697769; font-size: 11px; }
@media (max-width: 980px) {
  .donation-layout { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); }
  .campaign-panel { padding: 30px; gap: 28px; }
  .campaign-panel h1 { font-size: 39px; }
  .donation-panel { padding: 29px; }
}
@media (max-width: 750px) {
  .rg-navbar { min-height: 68px; padding-inline: 17px; }
  .page-shell { padding: 16px 13px 0; }
  .donation-layout { grid-template-columns: 1fr; border-radius: 17px; }
  .campaign-panel { padding: 27px; gap: 20px; }
  .campaign-panel h1 { max-width: 470px; font-size: clamp(34px, 7vw, 44px); margin-bottom: 10px; }
  .panel-description { font-size: 12px; }
  .campaign-context { padding: 16px; }
  .campaign-context h2 { font-size: 23px; }
  .context-icon { display: none; }
  .panel-bottom { display: none; }
  .donation-panel { padding: clamp(20px, 5vw, 30px); }
  .donation-panel > h2 { font-size: 35px; }
  .rg-footer { font-size: 10px; }
}
@media (max-width: 420px) {
  .rg-brand { font-size: 29px; }
  .nav-back { font-size: 9px; }
  .nav-back ion-icon { font-size: 16px; }
  .campaign-panel h1 { font-size: 33px; }
  .amount-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .amount-option { padding: 12px 4px; }
  .form-topline { gap: 8px; }
  .form-eyebrow, .step-counter { font-size: 9px; letter-spacing: .8px; }
  .account-number-row { align-items: flex-start; flex-direction: column; }
  .rg-footer { flex-wrap: wrap; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) { .amount-option { transition: none; } }
</style>