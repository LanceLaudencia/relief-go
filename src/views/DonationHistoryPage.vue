<template>
  <ion-page class="rg-donations-page">
    <!-- Same cream navigation used by the ReliefGO donor dashboard -->
    <ion-header class="rg-header">
      <nav class="rg-navbar" aria-label="My Donations navigation">
        <router-link to="/welcome" class="rg-brand" aria-label="ReliefGO home">
          Relief<span>GO</span><b>♥</b>
        </router-link>
        <router-link to="/donor" class="back-link" aria-label="Back to donor dashboard">
          <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
          <span>BACK TO DASHBOARD</span>
        </router-link>
      </nav>
    </ion-header>

    <!-- Donation history should scroll when the user has many records. -->
    <ion-content class="rg-donations-content">
      <div class="page-shell">
        <main class="page-main">
          <!-- Green editorial header, consistent with the ReliefGO palette -->
          <section class="welcome-banner" aria-labelledby="donations-heading">
            <div class="banner-copy">
              <p class="eyebrow">YOUR BAYANIHAN JOURNEY <span>✦</span></p>
              <h1 id="donations-heading">My <em>Donations.</em></h1>
              <p class="banner-description">
                Every act of giving matters. Review the causes you've supported
                and follow the verification of your donations.
              </p>
            </div>
            <div class="profile-card">
              <span class="profile-avatar" aria-hidden="true">{{ userInitials }}</span>
              <div class="profile-copy">
                <span class="profile-label">DONOR ACCOUNT</span>
                <strong>{{ displayName }}</strong>
                <small>Your giving history</small>
              </div>
            </div>
          </section>

          <section v-if="loading" class="feedback-card" aria-live="polite">
            <span class="feedback-icon"><ion-spinner name="crescent" /></span>
            <h2>Gathering your giving history...</h2>
            <p>Loading your donations.</p>
          </section>

          <section v-else-if="errorMessage" class="feedback-card" role="alert">
            <span class="feedback-icon"><ion-icon :icon="alertCircleOutline" /></span>
            <h2>We couldn't load your donations</h2>
            <p>{{ errorMessage }}</p>
            <router-link to="/donor" class="action-button outline-button">
              BACK TO DASHBOARD
              <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
            </router-link>
          </section>

          <template v-else>
            <!-- All metrics below use actual values returned by getMyDonations(). -->
            <section class="stats-grid" aria-label="Your donation summary">
              <div class="stat-box">
                <span class="stat-icon"><ion-icon :icon="heartOutline" aria-hidden="true" /></span>
                <span class="stat-label">VERIFIED GIVING</span>
                <strong>{{ formatPeso(verifiedAmount) }}</strong>
                <small>Confirmed donation amount</small>
              </div>
              <div class="stat-box">
                <span class="stat-icon"><ion-icon :icon="receiptOutline" aria-hidden="true" /></span>
                <span class="stat-label">ALL DONATIONS</span>
                <strong>{{ donations.length }}</strong>
                <small>Donation records</small>
              </div>
              <div class="stat-box">
                <span class="stat-icon"><ion-icon :icon="timeOutline" aria-hidden="true" /></span>
                <span class="stat-label">PENDING REVIEW</span>
                <strong>{{ pendingCount }}</strong>
                <small>Awaiting verification</small>
              </div>
            </section>

            <section class="history-section" aria-labelledby="history-heading">
              <div class="section-heading">
                <div>
                  <p class="section-eyebrow">SMALL ACTS. BIG HEARTS.</p>
                  <h2 id="history-heading">Your giving <em>history.</em></h2>
                  <p>
                    {{ donations.length === 0
                      ? 'Your first act of giving can make a difference.'
                      : `${donations.length} donation ${donations.length === 1 ? 'record' : 'records'} found.` }}
                  </p>
                </div>
              </div>

              <div v-if="donations.length === 0" class="empty-card">
                <div class="empty-icon" aria-hidden="true">
                  <ion-icon :icon="heartOutline" />
                  <span>✦</span>
                </div>
                <p class="empty-kicker">YOUR STORY STARTS HERE</p>
                <h3>No donations yet.</h3>
                <p>
                  When you support a ReliefGO campaign, your donation record
                  and verification status will appear here.
                </p>
                <router-link to="/campaigns" class="action-button">
                  EXPLORE CAMPAIGNS
                  <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                </router-link>
              </div>

              <div v-else class="donation-grid">
                <router-link
                  v-for="donation in donations"
                  :key="donation.id"
                  class="donation-card"
                  :to="`/donor/donations/${donation.id}`"
                  :aria-label="`View donation to ${donation.campaignTitle}`"
                >
                  <div class="donation-card-top">
                    <span class="donation-symbol"><ion-icon :icon="heartOutline" aria-hidden="true" /></span>
                    <ion-chip :color="donationStatusColor(donation.status)" class="status-chip">
                      {{ donation.status }}
                    </ion-chip>
                  </div>
                  <p class="donation-kicker">DONATION RECORD</p>
                  <strong class="donation-amount">{{ formatPeso(donation.amount) }}</strong>
                  <h3 class="campaign-title">{{ donation.campaignTitle }}</h3>
                  <div class="donation-divider"></div>
                  <div class="donation-meta">
                    <span><ion-icon :icon="calendarOutline" aria-hidden="true" /> {{ formatDate(donation.transactionDate) }}</span>
                    <span><ion-icon :icon="cardOutline" aria-hidden="true" /> {{ donation.paymentMethod }}</span>
                  </div>
                  <span class="donation-details">
                    VIEW DONATION DETAILS <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                  </span>
                </router-link>
              </div>
            </section>
          </template>
        </main>

        <footer class="page-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonSpinner,
  IonIcon,
  IonChip,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline,
  heartOutline,
  arrowForwardOutline,
  arrowBackOutline,
  receiptOutline,
  timeOutline,
  calendarOutline,
  cardOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getMyDonations } from '../services/donationService';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { donationStatusColor } from '../utils/ui';

const donations = ref<Donation[]>([]);
const loading = ref(true);
const errorMessage = ref('');

const displayName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Donor');
const userInitials = computed(() => {
  const parts = displayName.value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) || 'R';
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) || '' : '';
  return (first + last).toUpperCase();
});

// These values use the same verification status and amount fields as the existing app.
const verifiedAmount = computed(() => donations.value
  .filter((donation) => donation.status === 'Verified')
  .reduce((total, donation) => total + donation.amount, 0));
const pendingCount = computed(() => donations.value
  .filter((donation) => donation.status === 'Pending Verification').length);

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  if (!user) {
    loading.value = false;
    errorMessage.value = 'Please log in to view your donation history.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  try {
    donations.value = await getMyDonations(user.uid);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load donations.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Match the ReliefGO landing and donor dashboard palette */
.rg-donations-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --terracotta: #c66b46;
  --gold: #e8ae4c;
  --muted: #667365;
  color: var(--forest);
  background: var(--cream);
}
.rg-donations-content {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.rg-donations-content::part(background),
.rg-donations-content::part(scroll) { background: #f8f3e4; }
.rg-donations-page, .rg-donations-page * { box-sizing: border-box; }
.rg-donations-page a { text-decoration: none; }
.rg-header { box-shadow: none; background: var(--cream); }
.rg-header::after { display: none; }
.rg-navbar {
  width: 100%;
  min-height: 75px;
  padding: 8px clamp(20px, 4vw, 64px);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  background: var(--cream);
  border-bottom: 1px solid #e7ddc8;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--forest);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.05px;
}
.back-link {
  margin-left: auto;
  justify-content: center;
  white-space: nowrap;
  padding: 10px 14px;
  border: 1px solid #e1d5bd;
  border-radius: 999px;
  transition: background .2s, color .2s;
}
.back-link ion-icon { font-size: 19px; }
.back-link:hover, .back-link:focus-visible {
  color: var(--terracotta);
  background: #fff9ed;
}
.rg-brand {
  color: var(--forest);
  white-space: nowrap;
  font: 700 clamp(27px, 2.6vw, 35px)/1 Georgia, 'Times New Roman', serif;
  letter-spacing: -2px;
}
.rg-brand span, .rg-brand b { color: var(--terracotta); }
.rg-brand b { font-size: 12px; letter-spacing: 0; vertical-align: top; }
.page-shell {
  width: 100%;
  min-height: calc(100dvh - 75px);
  display: flex;
  flex-direction: column;
  padding: 22px clamp(20px, 4vw, 64px) 0;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.page-main { width: min(100%, 1380px); margin: 0 auto; }
.welcome-banner {
  border-radius: 20px;
  background: linear-gradient(120deg, #183c2c 0%, #102a20 100%);
  color: #fff8e8;
  min-height: 205px;
  padding: clamp(25px, 3vw, 42px) clamp(26px, 4vw, 60px);
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(230px, .7fr);
  gap: 35px;
  align-items: center;
  overflow: hidden;
  position: relative;
}
.welcome-banner::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 174, 76, .10), transparent 67%);
  right: 17%; bottom: -65%;
  pointer-events: none;
}
.banner-copy, .profile-card { position: relative; z-index: 1; min-width: 0; }
.eyebrow, .section-eyebrow, .profile-label, .stat-label, .donation-kicker, .empty-kicker {
  font-size: 10px;
  letter-spacing: 1.7px;
  font-weight: 800;
}
.eyebrow { margin: 0 0 13px; color: var(--gold); }
.eyebrow span { color: #fff8e8; }
.banner-copy h1 {
  margin: 0 0 10px;
  font: 400 clamp(36px, 4vw, 57px)/1.08 Georgia, 'Times New Roman', serif;
  letter-spacing: -1.6px;
}
.banner-copy h1 em { color: var(--gold); font-weight: 400; }
.banner-description { margin: 0; max-width: 580px; color: #d8e0d5; font-size: 13px; line-height: 1.7; }
.profile-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px;
  background: rgba(255, 248, 232, .07);
  border: 1px solid rgba(255, 248, 232, .19);
  border-radius: 17px;
}
.profile-avatar {
  flex: 0 0 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--gold);
  color: var(--deep);
  font: 700 25px Georgia, serif;
}
.profile-copy { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.profile-copy .profile-label { color: var(--gold); }
.profile-copy strong { font: 400 clamp(19px, 1.9vw, 25px)/1.2 Georgia, serif; overflow-wrap: anywhere; }
.profile-copy small { color: #d8e0d5; font-size: 11px; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 19px;
}
.stat-box {
  min-width: 0;
  background: #fff9ed;
  border: 1px solid #eadfca;
  border-radius: 17px;
  padding: 18px 22px 19px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-icon { color: var(--terracotta); font-size: 24px; margin-bottom: 2px; }
.stat-label { color: var(--terracotta); }
.stat-box strong { color: var(--forest); font: 400 clamp(24px, 2.5vw, 38px)/1.1 Georgia, serif; overflow-wrap: anywhere; }
.stat-box small { color: #6a7466; font-size: 11px; }
.history-section { padding: 35px 0 38px; }
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  margin-bottom: 23px;
}
.section-eyebrow { color: var(--terracotta); margin: 0 0 7px; }
.section-heading h2 { color: var(--forest); font: 400 clamp(29px, 3vw, 43px)/1.16 Georgia, serif; letter-spacing: -.8px; margin: 0 0 7px; }
.section-heading h2 em { font-weight: 400; color: var(--terracotta); }
.section-heading p:not(.section-eyebrow) { font-size: 13px; color: #687568; margin: 0; }
.empty-card {
  min-height: 285px;
  border: 1px solid #e4dac7;
  background: #fff9ed;
  border-radius: 20px;
  padding: 33px 24px 36px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.empty-icon { position: relative; width: 67px; height: 67px; display: grid; place-items: center; background: #f4e7ca; border-radius: 50%; color: var(--terracotta); margin-bottom: 15px; }
.empty-icon ion-icon { font-size: 34px; }
.empty-icon span { position: absolute; top: 7px; right: 5px; color: #b99042; font-size: 16px; }
.empty-kicker { color: var(--terracotta); margin: 0 0 8px; }
.empty-card h3, .feedback-card h2 { color: var(--forest); font: 400 31px Georgia, serif; margin: 0 0 10px; }
.empty-card > p:not(.empty-kicker), .feedback-card > p { color: #6b756b; font-size: 13px; line-height: 1.65; max-width: 450px; margin: 0 0 20px; }
.action-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 11px;
  background: var(--gold);
  border-radius: 50px;
  color: var(--deep);
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 800;
  padding: 14px 21px;
  transition: background .2s, transform .2s;
}
.action-button:hover { background: #f2bd63; transform: translateY(-2px); }
.action-button ion-icon { font-size: 17px; }
.outline-button { background: transparent; border: 1px solid var(--forest); }
.outline-button:hover { background: #f3ead9; }
.feedback-card {
  width: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  padding: 40px 24px;
}
.feedback-icon { color: var(--terracotta); font-size: 38px; margin-bottom: 15px; }
.feedback-icon ion-spinner { width: 38px; height: 38px; color: var(--forest); }
.donation-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 17px; }
.donation-card {
  display: block;
  min-width: 0;
  color: var(--forest);
  padding: 23px;
  border-radius: 19px;
  border: 1px solid #e5dac5;
  background: #fff9ed;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.donation-card:hover { border-color: var(--gold); box-shadow: 0 12px 28px rgba(18, 45, 30, .08); transform: translateY(-3px); }
.donation-card-top { display: flex; justify-content: space-between; align-items: center; gap: 9px; }
.donation-symbol { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: #f5e7d1; color: var(--terracotta); font-size: 23px; }
.status-chip { margin: 0; font-weight: 700; font-size: 11px; height: auto; min-height: 28px; max-width: 75%; }
.donation-kicker { color: var(--terracotta); margin: 25px 0 5px; }
.donation-amount { color: var(--forest); display: block; font: 400 34px/1.15 Georgia, serif; overflow-wrap: anywhere; }
.campaign-title { font: 400 20px/1.25 Georgia, serif; margin: 10px 0 0; overflow-wrap: anywhere; }
.donation-divider { height: 1px; background: #e5dac5; margin: 19px 0 14px; }
.donation-meta { display: flex; flex-wrap: wrap; gap: 10px 18px; color: #69776c; font-size: 12px; }
.donation-meta span { display: inline-flex; align-items: center; gap: 5px; }
.donation-meta ion-icon { color: #b7805a; font-size: 15px; }
.donation-details { display: inline-flex; align-items: center; gap: 8px; color: var(--terracotta); font-weight: 800; font-size: 10px; letter-spacing: 1px; margin-top: 19px; }
.donation-details ion-icon { font-size: 16px; }
.page-footer {
  width: min(100%, 1380px);
  margin: auto auto 0;
  padding: 17px 0;
  border-top: 1px solid #e7ddc8;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font: 11px 'DM Sans', 'Segoe UI', sans-serif;
  color: #6b7769;
}
@media (max-width: 950px) {
  .welcome-banner { grid-template-columns: 1fr; gap: 17px; }
  .profile-card { max-width: 450px; }
}
@media (max-width: 700px) {
  .rg-navbar { min-height: 67px; padding: 10px 16px; gap: 9px; }
  .rg-brand { font-size: 28px; }
  .back-link { padding: 9px 11px; font-size: 9px; letter-spacing: .6px; }
  .back-link ion-icon { font-size: 16px; }
  .page-shell { min-height: calc(100dvh - 67px); padding: 15px 14px 0; }
  .welcome-banner { padding: 26px 22px; min-height: 0; border-radius: 16px; }
  .banner-copy h1 { font-size: clamp(35px, 8vw, 44px); }
  .banner-description { font-size: 12px; }
  .stats-grid { gap: 10px; }
  .stat-box { padding: 13px; }
  .stat-label { font-size: 9px; letter-spacing: .7px; }
  .stat-box strong { font-size: 23px; }
  .stat-icon { font-size: 20px; }
  .stat-box small { font-size: 10px; }
  .section-heading { align-items: start; flex-direction: column; gap: 8px; }
  .history-section { padding-top: 28px; }
  .donation-grid { grid-template-columns: 1fr; }
  .page-footer { font-size: 10px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .stat-box { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 0 11px; align-items: center; }
  .stat-icon { grid-row: 1 / 4; }
  .stat-box strong { font-size: 25px; }
  .profile-avatar { width: 50px; height: 50px; flex-basis: 50px; font-size: 21px; }
  .profile-copy strong { font-size: 19px; }
  .section-heading h2 { font-size: 32px; }
  .empty-card { min-height: 260px; }
  .empty-card h3 { font-size: 28px; }
  .page-footer { flex-wrap: wrap; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .action-button, .donation-card { transition: none; }
}
</style>