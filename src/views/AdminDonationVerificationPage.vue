<template>
  <ion-page>
    <ion-header class="rg-header">
      <ion-toolbar class="rg-toolbar">
        <div class="nav-inner">
          <router-link to="/admin" class="brand">Relief<span>GO</span><sup>♥</sup></router-link>
          <router-link to="/admin" class="back-link"><ion-icon :icon="arrowBackOutline" /> BACK TO DASHBOARD</router-link>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rg-content">
      <main class="page-wrapper">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">RELIEFGO · ADMINISTRATION</p>
            <h1>Donation <em>Verification.</em></h1>
            <p>Review donation records carefully and keep every act of bayanihan transparent and accountable.</p>
          </div>
          <div class="identity">
            <div class="avatar">{{ initials }}</div>
            <div><span class="identity-label">ADMINISTRATOR ACCOUNT</span><strong>{{ adminName }}</strong><small>Donation oversight</small></div>
          </div>
        </section>

        <section class="stat-grid" aria-label="Donation statistics">
          <div class="stat"><ion-icon :icon="timeOutline" /><span>PENDING VERIFICATION</span><strong>{{ pending.length }}</strong><small>Awaiting payment review</small></div>
          <div class="stat"><ion-icon :icon="checkmarkCircleOutline" /><span>VERIFIED DONATIONS</span><strong>{{ verified.length }}</strong><small>Confirmed contributions</small></div>
          <div class="stat"><ion-icon :icon="closeCircleOutline" /><span>REJECTED / REFUNDED</span><strong>{{ rejected.length }}</strong><small>Not counted as verified</small></div>
        </section>

        <section class="list-section">
          <div class="section-heading">
            <div><p class="eyebrow dark">EVERY CONTRIBUTION MATTERS</p><h2>Review <em>donations.</em></h2><p>Check transaction details before verifying or rejecting a donation.</p></div>
          </div>
          <ion-segment v-model="segment" class="status-tabs">
            <ion-segment-button value="pending"><ion-label>Pending ({{ pending.length }})</ion-label></ion-segment-button>
            <ion-segment-button value="verified"><ion-label>Verified ({{ verified.length }})</ion-label></ion-segment-button>
            <ion-segment-button value="rejected"><ion-label>Rejected ({{ rejected.length }})</ion-label></ion-segment-button>
          </ion-segment>

          <div v-if="loading" class="state-box"><ion-spinner name="crescent" /><p>Loading donations...</p></div>
          <div v-else-if="errorMessage" class="state-box"><ion-icon :icon="alertCircleOutline" class="state-icon" /><h3>Something went wrong</h3><p>{{ errorMessage }}</p></div>
          <div v-else-if="visibleDonations.length === 0" class="state-box"><div class="empty-icon"><ion-icon :icon="checkmarkDoneOutline" /></div><p class="eyebrow dark">ALL CAUGHT UP</p><h3>Nothing here.</h3><p>There are no donations in this list.</p></div>
          <div v-else class="donation-grid">
            <article v-for="donation in visibleDonations" :key="donation.id" class="donation-card">
              <div class="card-top">
                <div><span class="mini-label">DONATION RECORD</span><h3>{{ formatPeso(donation.amount) }}</h3><p>{{ donation.campaignTitle }}</p></div>
                <ion-chip :color="donationStatusColor(donation.status)">{{ donation.status }}</ion-chip>
              </div>
              <div class="details">
                <p><ion-icon :icon="walletOutline" /><span><b>Method:</b> {{ donation.paymentMethod }}</span></p>
                <p><ion-icon :icon="receiptOutline" /><span><b>Reference number:</b> {{ donation.referenceNumber }}</span></p>
                <p><ion-icon :icon="personOutline" /><span><b>Name on account:</b> {{ donation.senderName }}</span></p>
                <p><ion-icon :icon="peopleOutline" /><span><b>Donor account:</b> {{ donation.donorName }}</span></p>
                <p><ion-icon :icon="calendarOutline" /><span><b>Submitted:</b> {{ formatDate(donation.transactionDate) }}</span></p>
              </div>
              <div v-if="donation.isAnonymous" class="notice compact">Donor chose to appear as Anonymous.</div>
              <div v-if="donation.rejectionReason" class="reason"><b>Reason:</b> {{ donation.rejectionReason }}</div>
              <div v-if="donation.status === 'Pending Verification'" class="actions">
                <ion-button class="primary-action" :disabled="busyId === donation.id" @click="handleVerify(donation)">Verify donation</ion-button>
                <ion-button class="danger-action" fill="outline" :disabled="busyId === donation.id" @click="handleReject(donation)">Reject</ion-button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonSegment, IonSegmentButton,
  IonLabel, IonButton, IonChip, IonSpinner, IonIcon, onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline, checkmarkDoneOutline, arrowBackOutline, timeOutline,
  checkmarkCircleOutline, closeCircleOutline, walletOutline, receiptOutline,
  personOutline, peopleOutline, calendarOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getAllDonations, rejectDonation, verifyDonation } from '../services/donationService';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { askReason, confirmAction, donationStatusColor, showToast } from '../utils/ui';

const donations = ref<Donation[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const segment = ref<string>('pending');
const busyId = ref('');

const adminName = computed(() => currentUser.value?.displayName || 'Administrator');
const initials = computed(() => adminName.value.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() || '').join('') || 'A');
const pending = computed(() => donations.value.filter(d => d.status === 'Pending Verification'));
const verified = computed(() => donations.value.filter(d => d.status === 'Verified'));
const rejected = computed(() => donations.value.filter(d => d.status === 'Rejected' || d.status === 'Refunded'));
const visibleDonations = computed(() => segment.value === 'verified' ? verified.value : segment.value === 'rejected' ? rejected.value : pending.value);

async function loadDonations() {
  errorMessage.value = '';
  try { donations.value = await getAllDonations(); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Could not load donations.'; }
  finally { loading.value = false; }
}
onIonViewWillEnter(async () => {
  if (donations.value.length === 0) loading.value = true;
  await loadDonations();
});
async function runAction(donation: Donation, action: () => Promise<void>, successMessage: string) {
  busyId.value = donation.id;
  try {
    await action();
    await loadDonations();
    await showToast(successMessage);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Action failed.', 'danger');
    await loadDonations();
  } finally {
    busyId.value = '';
  }
}
async function handleVerify(donation: Donation) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;
  const ok = await confirmAction(
    'Verify donation',
    `Verify ${formatPeso(donation.amount)} with reference ${donation.referenceNumber}? Only verify after you have confirmed that this exact reference number and amount appear in your GCash/Maya transaction history.`,
    'Verify'
  );
  if (!ok) return;
  await runAction(donation, () => verifyDonation(donation, adminUid), 'Donation verified. The campaign total was updated.');
}
async function handleReject(donation: Donation) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;
  const reason = await askReason('Reject donation', 'Why is this donation being rejected? The donor will see this reason.', 'Reject');
  if (!reason) return;
  await runAction(donation, () => rejectDonation(donation, adminUid, reason), 'Donation rejected.');
}
</script>

<style scoped>
.rg-header{box-shadow:none}.rg-toolbar{--background:#f8f3e4;--color:#143b2b;--min-height:74px;--border-color:#e6dcc6}
.nav-inner{width:min(1480px,calc(100% - 48px));margin:auto;display:flex;align-items:center;justify-content:space-between;min-height:74px;gap:16px}
.brand{font-family:Georgia,serif;font-size:36px;font-weight:bold;color:#123b2a;text-decoration:none;letter-spacing:-1.7px}.brand span{color:#c66b46}.brand sup{font:13px Georgia,serif;color:#c66b46;vertical-align:top}
.back-link{display:flex;align-items:center;gap:8px;color:#123b2a;font-size:11px;font-weight:800;letter-spacing:1px;text-decoration:none;white-space:nowrap}
.rg-content{--background:#f8f3e4;color:#16382a;font-family:'DM Sans','Avenir Next','Segoe UI',Arial,sans-serif}
.page-wrapper{width:min(1460px,calc(100% - 48px));margin:0 auto;padding:24px 0 70px}
.hero{background:radial-gradient(circle at 75% 130%,#38533a 0,transparent 38%),linear-gradient(115deg,#193e2e,#102a20);color:#fff8e7;border-radius:23px;padding:46px 58px;display:flex;align-items:center;justify-content:space-between;gap:30px}
.hero-copy{max-width:700px}.eyebrow,.mini-label{color:#f0b44e;letter-spacing:2px;font-size:11px;font-weight:900;margin:0 0 15px}
.hero h1{font:normal clamp(37px,4.3vw,65px)/1.06 Georgia,serif;letter-spacing:-1.6px;margin:0 0 15px;color:#fff9eb}.hero h1 em{color:#e8ae4c;font-weight:normal}.hero-copy>p:last-child{font-size:14px;line-height:1.7;max-width:640px;margin:0;color:#e7ebdc}
.identity{display:flex;align-items:center;gap:16px;min-width:300px;max-width:400px;padding:19px;border:1px solid #ffffff35;background:#ffffff0e;border-radius:18px}.avatar{flex:none;width:65px;height:65px;border-radius:50%;background:#e8ae4c;color:#153729;display:grid;place-items:center;font:30px Georgia,serif}.identity-label{display:block;color:#f0b44e;font-size:10px;font-weight:900;letter-spacing:1.7px;margin-bottom:6px}.identity strong{display:block;color:#fff8e7;font:25px Georgia,serif;overflow-wrap:anywhere}.identity small{display:block;color:#e7e9da;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:20px 0 34px}.stat{min-width:0;background:#fffaf0;border:1px solid #e9dcc3;border-radius:18px;padding:22px 25px;display:flex;flex-direction:column;align-items:flex-start}.stat ion-icon{color:#c66b46;font-size:23px;margin-bottom:17px}.stat span{color:#c66b46;font-size:10px;font-weight:900;letter-spacing:1.6px}.stat strong{font:38px Georgia,serif;color:#173e2d;margin:8px 0 2px}.stat small{color:#788078;font-size:12px}
.section-heading{margin:0 0 22px}.eyebrow.dark{color:#c66b46;margin-bottom:8px}.section-heading h2{font:normal clamp(32px,3.4vw,49px) Georgia,serif;margin:0;color:#173e2d}.section-heading h2 em{color:#c66b46;font-weight:normal}.section-heading p:last-child{color:#6d796e;font-size:14px;margin:8px 0 0}
.status-tabs{--background:#efe6d2;background:#efe6d2;border-radius:14px;padding:5px;max-width:650px;margin:0 0 20px}.status-tabs ion-segment-button{--color:#315342;--color-checked:#153e2c;--indicator-color:#fffaf0;--border-radius:11px;font-weight:800;min-height:43px}
.notice{background:#fff4d9;border:1px solid #edd8a9;border-radius:14px;padding:18px 22px;margin:12px 0 20px;color:#705b2d;font-size:13px;line-height:1.7}
.donation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.donation-card{min-width:0;border:1px solid #e8dcc6;border-radius:20px;background:#fffaf0;padding:27px;box-shadow:0 8px 25px #253d2810}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.mini-label{display:block;color:#c66b46;margin-bottom:10px}.card-top h3{font:normal 28px/1.18 Georgia,serif;color:#183d2c;margin:0 0 8px;overflow-wrap:anywhere}.card-top p{font-size:13px;color:#7a8178;margin:0}.card-top ion-chip{flex:none;margin:0;text-transform:capitalize}
.amount-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:25px 0 13px}.amount-grid>div{background:#f6eedc;padding:15px;border-radius:12px;min-width:0}.amount-grid span{display:block;color:#a46448;font-size:10px;font-weight:900;letter-spacing:.9px}.amount-grid strong{display:block;font:25px Georgia,serif;color:#153b2a;margin-top:8px;overflow-wrap:anywhere}
.progress-track{height:8px;background:#e5e8d9;border-radius:20px;overflow:hidden}.progress-fill{height:100%;background:#d6a048;border-radius:20px}
.details{margin:22px 0 0}.details p{display:flex;gap:9px;align-items:flex-start;color:#626e64;font-size:13px;line-height:1.5;margin:11px 0}.details ion-icon{color:#c66b46;flex:none;font-size:17px}.details b,.description b{color:#1b4330}
.description{border-top:1px solid #ece2d1;margin-top:16px;padding-top:15px;font-size:13px;line-height:1.6}.description p{color:#69766b;white-space:pre-line;overflow-wrap:anywhere;margin:6px 0 0}
.reason{margin-top:16px;padding:14px;background:#fff0e9;border:1px solid #efc9b7;border-radius:12px;color:#a44530;font-size:13px;line-height:1.5}
.actions{display:flex;flex-wrap:wrap;gap:10px;border-top:1px solid #ece2d1;padding-top:18px;margin-top:20px}.actions ion-button{--border-radius:10px;font-size:11px;font-weight:800;letter-spacing:.2px;min-height:38px;margin:0;text-transform:none}.outline-action{--color:#173e2d;--border-color:#173e2d}.danger-action{--color:#b34d37;--border-color:#b34d37}.primary-action{--background:#173e2d;--color:#fffaf0}
.state-box{text-align:center;padding:68px 24px;background:#fffaf0;border:1px solid #e8dcc6;border-radius:20px;color:#68766c}.state-box h3{font:normal 33px Georgia,serif;color:#173e2d;margin:12px 0}.state-box p{font-size:14px}.state-icon{font-size:46px;color:#c66b46}.empty-icon{height:75px;width:75px;display:grid;place-items:center;margin:0 auto 15px;border-radius:50%;background:#f4e6c8;color:#c66b46;font-size:36px}
@media(max-width:900px){.hero{padding:34px;align-items:stretch;flex-direction:column}.identity{max-width:none;min-width:0}.donation-grid{grid-template-columns:1fr}}
@media(max-width:620px){.nav-inner{width:calc(100% - 30px)}.brand{font-size:29px}.back-link{font-size:9px;letter-spacing:.3px}.page-wrapper{width:calc(100% - 28px);padding-top:16px}.hero{padding:28px 22px;border-radius:18px}.hero h1{font-size:39px}.identity{padding:13px}.avatar{width:53px;height:53px;font-size:23px}.identity strong{font-size:20px}.stat-grid{gap:9px;margin:12px 0 28px}.stat{padding:14px 11px;border-radius:13px}.stat ion-icon{font-size:19px;margin-bottom:12px}.stat span{font-size:8px;letter-spacing:.5px}.stat strong{font-size:29px}.stat small{font-size:10px}.status-tabs ion-segment-button{font-size:11px}.donation-card{padding:19px}.card-top{flex-wrap:wrap}.amount-grid strong{font-size:20px}}

.donation-card .details{margin-top:23px}
.donation-card .details p{margin:14px 0;overflow-wrap:anywhere}
.donation-card .card-top h3{font-size:37px}
.donation-card .card-top p{line-height:1.5}
.notice.compact{margin:16px 0 0;padding:12px 15px}
</style>