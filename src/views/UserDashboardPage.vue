<template>
  <ion-page class="relief-dashboard-page">
    <ion-content :fullscreen="true" class="dashboard-content">
      <div class="dashboard-shell">
        <!-- Same cream navigation and editorial branding as ReliefGO's public pages. -->
        <header class="dashboard-navbar">
          <router-link to="/welcome" class="dashboard-brand" aria-label="ReliefGO home">
            Relief<span>GO</span><b>♥</b>
          </router-link>

          <nav class="dashboard-nav-links" aria-label="Dashboard navigation">
            <router-link to="/campaigns">CAMPAIGNS</router-link>
            <router-link to="/donor/donations">MY DONATIONS</router-link>
            <router-link to="/organizer/campaigns">MY CAMPAIGNS</router-link>
          </nav>

          <div class="dashboard-navbar-actions">
            <div class="notification-holder" aria-label="Notifications">
              <NotificationBell />
            </div>
            <button class="logout-button" type="button" @click="handleLogout">
              <ion-icon :icon="logOutOutline" aria-hidden="true" />
              <span>LOG OUT</span>
            </button>
          </div>
        </header>

        <main class="dashboard-main">
          <!-- A USER IDENTITY / WELCOME CARD, including an automatic initials avatar. -->
          <section class="welcome-hero" aria-labelledby="dashboard-heading">
            <div class="welcome-copy">
              <p class="eyebrow hero-eyebrow">YOUR RELIEFGO SPACE <span aria-hidden="true">✦</span></p>
              <h1 id="dashboard-heading">Hello, <em>{{ firstName }}!</em></h1>
              <p>
                Every act of kindness makes a difference. Follow your giving and
                fundraising journey, all in one place.
              </p>
              <div class="hero-mini-note">
                <ion-icon :icon="heartOutline" aria-hidden="true" />
                <span>SMALL ACTS. BIG HEARTS.</span>
              </div>
            </div>

            <div class="profile-card" aria-label="Account profile">
              <div class="profile-avatar" aria-hidden="true">{{ userInitials }}</div>
              <div class="profile-details">
                <p class="profile-kicker">RELIEFGO MEMBER</p>
                <strong>{{ fullName }}</strong>
                <span class="profile-role">{{ userRoleLabel }}</span>
              </div>
              <span class="profile-heart" aria-hidden="true">♥</span>
            </div>
          </section>

          <section v-if="loading" class="feedback-state" aria-live="polite">
            <ion-spinner name="crescent" color="primary" />
            <h2>Gathering your story...</h2>
            <p>Loading your donations and campaigns.</p>
          </section>

          <section v-else-if="errorMessage" class="feedback-state" role="alert">
            <ion-icon :icon="alertCircleOutline" class="feedback-icon" aria-hidden="true" />
            <h2>We couldn't load your dashboard.</h2>
            <p>{{ errorMessage }}</p>
            <ion-button class="gold-button" @click="loadDashboard">
              TRY AGAIN <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
          </section>

          <div v-else class="dashboard-grid">
            <!-- Donor summary and the user's actual, existing donation records. -->
            <section class="dashboard-section donor-section" aria-labelledby="donor-heading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">GIVE WITH HEART</p>
                  <h2 id="donor-heading">Your giving <em>impact.</em></h2>
                  <p class="section-subtitle">Your donations, progress, and the causes you've supported.</p>
                </div>
                <div class="section-emblem" aria-hidden="true">
                  <ion-icon :icon="heartOutline" />
                </div>
              </div>

              <div class="stat-grid donor-stats">
                <div class="stat-card">
                  <ion-icon :icon="walletOutline" class="stat-icon" aria-hidden="true" />
                  <strong>{{ formatPeso(donatedTotal) }}</strong>
                  <span>Verified donations</span>
                </div>
                <div class="stat-card">
                  <ion-icon :icon="checkmarkCircleOutline" class="stat-icon" aria-hidden="true" />
                  <strong>{{ verifiedCount }}</strong>
                  <span>Donations verified</span>
                </div>
                <div class="stat-card stat-warning">
                  <ion-icon :icon="timeOutline" class="stat-icon" aria-hidden="true" />
                  <strong>{{ pendingCount }}</strong>
                  <span>Awaiting verification</span>
                </div>
              </div>

              <div class="activity-card">
                <div class="activity-heading">
                  <h3>Recent donations</h3>
                  <span>YOUR LATEST ACTS</span>
                </div>

                <div v-if="recentDonations.length === 0" class="empty-state">
                  <div class="empty-icon" aria-hidden="true"><ion-icon :icon="heartOutline" /></div>
                  <div>
                    <h4>Your story starts here.</h4>
                    <p>You haven't donated yet. Explore a cause close to your heart.</p>
                  </div>
                </div>

                <ion-list v-else class="donation-list" lines="none">
                  <ion-item
                    v-for="donation in recentDonations"
                    :key="donation.id"
                    button
                    detail
                    class="donation-item"
                    :router-link="`/donor/donations/${donation.id}`"
                  >
                    <ion-label>
                      <h4>{{ donation.campaignTitle }}</h4>
                      <p>{{ formatDate(donation.transactionDate) }}</p>
                    </ion-label>
                    <ion-chip slot="end" :color="donationStatusColor(donation.status)">
                      {{ formatPeso(donation.amount) }}
                    </ion-chip>
                  </ion-item>
                </ion-list>
              </div>

              <div class="section-actions">
                <ion-button class="gold-button" router-link="/campaigns">
                  BROWSE CAMPAIGNS <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>
                <ion-button class="outline-button" fill="outline" router-link="/donor/donations">
                  ALL MY DONATIONS
                </ion-button>
              </div>
            </section>

            <!-- Fundraiser summary and original CampaignProgress integration. -->
            <section class="dashboard-section fundraiser-section" aria-labelledby="fundraiser-heading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">SHARE BAYANIHAN</p>
                  <h2 id="fundraiser-heading">Your fundraising <em>journey.</em></h2>
                  <p class="section-subtitle">Create campaigns and watch your community's support grow.</p>
                </div>
                <div class="section-emblem" aria-hidden="true">
                  <ion-icon :icon="peopleOutline" />
                </div>
              </div>

              <div class="stat-grid fundraiser-stats">
                <div class="stat-card">
                  <ion-icon :icon="megaphoneOutline" class="stat-icon" aria-hidden="true" />
                  <strong>{{ campaigns.length }}</strong>
                  <span>My campaigns</span>
                </div>
                <div class="stat-card">
                  <ion-icon :icon="trendingUpOutline" class="stat-icon" aria-hidden="true" />
                  <strong>{{ formatPeso(raisedTotal) }}</strong>
                  <span>Raised across my campaigns</span>
                </div>
              </div>

              <div class="activity-card fundraising-activity">
                <div class="activity-heading">
                  <h3>My active campaigns</h3>
                  <span>FUNDRAISING PROGRESS</span>
                </div>

                <div v-if="campaigns.length === 0" class="empty-state">
                  <div class="empty-icon" aria-hidden="true"><ion-icon :icon="peopleOutline" /></div>
                  <div>
                    <h4>Ready to make an impact?</h4>
                    <p>You haven't started a campaign yet. Bring a cause to life.</p>
                  </div>
                </div>
                <p v-else-if="liveCampaigns.length === 0" class="quiet-note">
                  You don't have any active campaigns right now.
                </p>

                <div v-else class="active-campaign-list">
                  <div v-for="campaign in liveCampaigns" :key="campaign.id" class="my-campaign-card">
                    <h4>{{ campaign.title }}</h4>
                    <p>
                      {{ campaign.verifiedDonorCount }} verified
                      {{ campaign.verifiedDonorCount === 1 ? 'donor' : 'donors' }}
                      <span aria-hidden="true"> · </span>
                      Deadline {{ formatDate(campaign.deadline) }}
                    </p>
                    <CampaignProgress :raised="campaign.verifiedTotal" :goal="campaign.goalAmount" />
                  </div>
                </div>
              </div>

              <div class="section-actions">
                <ion-button class="gold-button" router-link="/organizer/campaigns/new">
                  START A CAMPAIGN <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>
                <ion-button class="outline-button" fill="outline" router-link="/organizer/campaigns">
                  MY CAMPAIGNS
                </ion-button>
              </div>
            </section>
          </div>

          <div class="bottom-message">
            <ion-icon :icon="heartOutline" aria-hidden="true" />
            <span>Stories of bayanihan live here.</span>
          </div>
        </main>

        <footer class="dashboard-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Every helping hand makes hope grow.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline,
  logOutOutline,
  heartOutline,
  walletOutline,
  checkmarkCircleOutline,
  timeOutline,
  peopleOutline,
  megaphoneOutline,
  trendingUpOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import CampaignProgress from '../components/CampaignProgress.vue';
import NotificationBell from '../components/NotificationBell.vue';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import { getMyCampaigns } from '../services/campaignService';
import { getMyDonations } from '../services/donationService';
import type { Campaign } from '../models/Campaign';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { donationStatusColor } from '../utils/ui';

const router = useRouter();

const donations = ref<Donation[]>([]);
const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');

// Dynamically display the logged-in user's name and profile initials.
// No photo upload or new PNG asset is required.
const fullName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Member');
const firstName = computed(() => fullName.value.split(/\s+/)[0] || 'friend');
const userInitials = computed(() => {
  const nameParts = fullName.value.split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) return 'RG';
  const initials = nameParts.length > 1
    ? `${Array.from(nameParts[0]!)[0] ?? ''}${Array.from(nameParts[nameParts.length - 1]!)[0] ?? ''}`
    : Array.from(nameParts[0]!).slice(0, 2).join('');
  return initials.toLocaleUpperCase();
});
const userRoleLabel = computed(() => {
  const role = currentUser.value?.role;
  if (role === 'donor') return 'Donor account';
  if (role === 'organizer') return 'Organizer account';
  if (role === 'admin') return 'Administrator account';
  return 'Community member';
});

const verifiedDonations = computed(() => donations.value.filter((d) => d.status === 'Verified'));
const donatedTotal = computed(() =>
  verifiedDonations.value.reduce((sum, donation) => sum + donation.amount, 0)
);
const verifiedCount = computed(() => verifiedDonations.value.length);
const pendingCount = computed(
  () => donations.value.filter((d) => d.status === 'Pending Verification').length
);
const recentDonations = computed(() => donations.value.slice(0, 3));

const raisedTotal = computed(() =>
  campaigns.value.reduce((sum, campaign) => sum + campaign.verifiedTotal, 0)
);
const liveCampaigns = computed(() => campaigns.value.filter((c) => c.status === 'Active'));

async function loadDashboard() {
  const user = currentUser.value;
  if (!user) {
    loading.value = false;
    errorMessage.value = 'Please log in to view your dashboard.';
    return;
  }

  if (donations.value.length === 0 && campaigns.value.length === 0) loading.value = true;
  errorMessage.value = '';

  try {
    const [myDonations, myCampaigns] = await Promise.all([
      getMyDonations(user.uid),
      getMyCampaigns(user.uid),
    ]);
    donations.value = myDonations;
    campaigns.value = myCampaigns;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the dashboard.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(loadDashboard);

async function handleLogout() {
  await logoutUser();
  router.replace('/welcome');
}
</script>

<style scoped>
/* RELIEFGO ORIGINAL PALETTE */
.relief-dashboard-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --terracotta: #c66b46;
  --gold: #e8ae4c;
  --muted: #667365;
  color: var(--forest);
  background: var(--cream);
}

.dashboard-content {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.dashboard-content::part(background),
.dashboard-content::part(scroll) { background: #f8f3e4; }

.dashboard-shell {
  min-height: 100dvh;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  color: var(--forest);
  background: var(--cream);
  -webkit-font-smoothing: antialiased;
}
.dashboard-shell *, .dashboard-shell *::before, .dashboard-shell *::after { box-sizing: border-box; }
.dashboard-shell a { color: inherit; text-decoration: none; }
.dashboard-shell button { font: inherit; }
.dashboard-shell h1, .dashboard-shell h2,
.dashboard-shell h3, .dashboard-shell h4,
.dashboard-brand { font-family: Georgia, 'Times New Roman', serif; }
.dashboard-shell h1, .dashboard-shell h2, .dashboard-shell h3,
.dashboard-shell h4, .dashboard-shell p { margin-top: 0; }

/* Header: cream like welcome/campaigns pages. */
.dashboard-navbar {
  min-height: 76px;
  padding: 14px clamp(18px, 4vw, 65px);
  border-bottom: 1px solid #e5dcc8;
  display: flex;
  align-items: center;
  gap: clamp(18px, 3vw, 48px);
  background: var(--cream);
}
.dashboard-brand {
  white-space: nowrap;
  font-size: clamp(29px, 2.5vw, 36px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
}
.dashboard-brand span, .dashboard-brand b { color: var(--terracotta); }
.dashboard-brand b { font-size: 13px; vertical-align: top; letter-spacing: 0; margin-left: 1px; }
.dashboard-nav-links { display: flex; align-items: center; gap: clamp(12px, 2vw, 32px); margin-left: auto; }
.dashboard-nav-links a { font-size: 11px; letter-spacing: .5px; font-weight: 800; white-space: nowrap; }
.dashboard-nav-links a:hover, .dashboard-nav-links a:focus-visible { color: var(--terracotta); }
.dashboard-navbar-actions { display: flex; align-items: center; gap: 13px; }
.notification-holder { display: grid; place-items: center; min-width: 36px; color: var(--forest); }
.logout-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 11px 15px; border: 1px solid var(--forest); border-radius: 999px;
  background: var(--forest); color: #fff8e8; cursor: pointer;
  font-size: 10px; font-weight: 800; letter-spacing: .6px; white-space: nowrap;
  transition: background .2s;
}
.logout-button ion-icon { font-size: 17px; }
.logout-button:hover, .logout-button:focus-visible { background: var(--deep); }

.dashboard-main {
  width: min(100% - 2 * clamp(16px, 4vw, 68px), 1450px);
  margin: 0 auto;
  padding: clamp(20px, 3vw, 38px) 0 26px;
}

/* Welcome hero / user identity card */
.welcome-hero {
  position: relative; overflow: hidden; isolation: isolate;
  min-height: 236px;
  padding: clamp(27px, 3.5vw, 55px) clamp(25px, 4vw, 65px);
  display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr);
  align-items: center; gap: clamp(20px, 3vw, 48px);
  background: linear-gradient(116deg, var(--forest), var(--deep));
  border-radius: 18px; color: #fff8e8;
}
.welcome-hero::before {
  content: ''; position: absolute; width: 470px; height: 470px; border: 1px solid rgba(232,174,76,.13);
  right: 8%; top: -250px; border-radius: 50%; pointer-events: none;
}
.welcome-hero::after {
  content: ''; position: absolute; width: 310px; height: 310px;
  right: -100px; bottom: -210px; border-radius: 50%; background: rgba(232,174,76,.055); pointer-events: none;
}
.welcome-copy { position: relative; z-index: 1; min-width: 0; }
.eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 2.1px; margin: 0 0 13px; color: var(--terracotta); }
.hero-eyebrow { color: var(--gold); }
.hero-eyebrow span { margin-left: 6px; }
.welcome-copy h1 { margin: 0 0 13px; font-size: clamp(38px, 4vw, 64px); line-height: 1.08; font-weight: 400; letter-spacing: -1.3px; overflow-wrap: anywhere; }
.welcome-copy h1 em { color: var(--gold); font-weight: 400; }
.welcome-copy > p:not(.eyebrow) { max-width: 565px; font-size: clamp(13px, 1vw, 15px); line-height: 1.65; color: #dce4d8; margin-bottom: 22px; }
.hero-mini-note { display: flex; gap: 8px; align-items: center; color: var(--gold); font-size: 10px; font-weight: 800; letter-spacing: 1.4px; }
.hero-mini-note ion-icon { font-size: 18px; }
.profile-card {
  position: relative; z-index: 1; min-width: 0;
  display: flex; align-items: center; gap: 16px;
  border: 1px solid rgba(255,248,232,.22); border-radius: 16px;
  background: rgba(255,248,232,.09); padding: clamp(18px, 2vw, 27px);
  backdrop-filter: blur(5px);
}
.profile-avatar {
  display: grid; place-items: center; flex: 0 0 83px; width: 83px; height: 83px;
  border-radius: 50%; border: 3px solid #f8e6bf; background: var(--gold);
  font-family: Georgia, serif; font-size: 29px; font-weight: 700;
  color: var(--deep); box-shadow: 0 7px 22px rgba(0,0,0,.13);
  user-select: none;
}
.profile-details { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.profile-kicker { margin: 0; font-size: 10px; letter-spacing: 1.6px; color: #dfd9c5; font-weight: 800; }
.profile-details strong { font-family: Georgia, serif; font-weight: 500; font-size: clamp(20px, 1.7vw, 26px); line-height: 1.12; overflow-wrap: anywhere; }
.profile-role { display: inline-block; border-radius: 999px; padding: 6px 11px; color: #fff8e8; background: rgba(255,248,232,.16); font-size: 11px; }
.profile-heart { color: var(--gold); font-size: 15px; align-self: flex-start; margin-left: auto; }

/* Main dashboard panels: balanced donor/fundraiser columns on laptop. */
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 22px; margin-top: 27px; align-items: stretch; }
.dashboard-section { min-width: 0; display: flex; flex-direction: column; padding: clamp(19px, 2.2vw, 31px); background: #fffaf0; border: 1px solid #e9dfcb; border-radius: 17px; }
.section-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
.section-heading h2 { font-size: clamp(27px, 2.4vw, 39px); font-weight: 400; letter-spacing: -.8px; line-height: 1.13; margin: 0 0 12px; }
.section-heading h2 em { color: var(--terracotta); font-weight: 400; }
.section-subtitle { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
.section-emblem { width: 51px; height: 51px; flex: 0 0 51px; display: grid; place-items: center; background: #f2e8cf; color: var(--terracotta); border-radius: 15px; }
.section-emblem ion-icon { font-size: 27px; }
.stat-grid { display: grid; gap: 10px; margin-bottom: 20px; }
.donor-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.fundraiser-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.stat-card { display: flex; min-width: 0; min-height: 133px; flex-direction: column; align-items: flex-start; justify-content: center; gap: 9px; padding: 17px clamp(11px, 1.5vw, 20px); border-radius: 14px; background: #e9efe4; }
.stat-card .stat-icon { font-size: 22px; color: #3d8852; }
.stat-card strong { font-size: clamp(19px, 1.55vw, 25px); font-family: Georgia, serif; font-weight: 700; line-height: 1.1; overflow-wrap: anywhere; }
.stat-card span { font-size: 11px; line-height: 1.45; color: #526657; }
.stat-warning { background: #fff1d3; }
.stat-warning .stat-icon { color: #ae722a; }

.activity-card { min-width: 0; border: 1px solid #eee3d0; border-radius: 14px; padding: clamp(16px, 2vw, 23px); background: #fffdf7; flex: 1 1 auto; }
.activity-heading { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.activity-heading h3 { margin: 0; font-size: 24px; font-weight: 400; }
.activity-heading > span { color: var(--terracotta); font-size: 9px; letter-spacing: 1px; font-weight: 800; }
.empty-state { min-height: 136px; display: flex; align-items: center; gap: 16px; }
.empty-icon { display: grid; place-items: center; flex: 0 0 65px; height: 65px; border-radius: 50%; background: #f7e8c8; color: var(--terracotta); }
.empty-icon ion-icon { font-size: 31px; }
.empty-state h4 { font-size: 21px; font-weight: 400; margin: 0 0 7px; }
.empty-state p, .quiet-note { color: var(--muted); font-size: 12px; line-height: 1.65; margin: 0; }
.quiet-note { padding: 20px 0; }
.donation-list { background: transparent; padding: 0; }
.donation-item { --background: transparent; --background-hover: #f7efdf; --padding-start: 0; --inner-padding-end: 0; --min-height: 63px; }
.donation-item ion-label h4 { font: 600 15px 'DM Sans', sans-serif; color: var(--forest); white-space: normal; }
.donation-item ion-label p { color: var(--muted); font-size: 11px; }
.donation-item ion-chip { font-size: 11px; }
.my-campaign-card { border-top: 1px solid #e9dfcb; padding: 17px 0; }
.my-campaign-card:first-child { border-top: 0; padding-top: 2px; }
.my-campaign-card h4 { margin: 0 0 7px; font-size: 20px; line-height: 1.25; font-weight: 400; overflow-wrap: anywhere; }
.my-campaign-card p { color: var(--muted); font-size: 11px; line-height: 1.5; margin: 0 0 13px; }

.section-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 17px; }
.gold-button, .outline-button { margin: 0; min-height: 47px; --box-shadow: none; --border-radius: 999px; font-family: 'DM Sans', Arial, sans-serif; font-size: 10px; letter-spacing: .4px; font-weight: 800; }
.gold-button { --background: var(--gold); --background-hover: #f0bc62; --color: var(--deep); }
.outline-button { --color: var(--forest); --border-color: var(--forest); --border-width: 1px; }
.section-actions ion-icon { font-size: 16px; }

.feedback-state { margin-top: 25px; min-height: 290px; background: #fffaf0; border: 1px solid #e9dfcb; border-radius: 16px; padding: 50px 20px; display: flex; flex-direction: column; gap: 9px; align-items: center; text-align: center; }
.feedback-state h2 { font-weight: 400; font-size: 29px; margin: 9px 0 0; }
.feedback-state p { color: var(--muted); font-size: 13px; max-width: 460px; }
.feedback-state .feedback-icon { font-size: 42px; color: var(--terracotta); }
.feedback-state .gold-button { margin-top: 9px; }
.bottom-message { display: flex; justify-content: center; align-items: center; gap: 8px; margin: 30px auto 0; color: var(--muted); font: italic 15px Georgia, serif; }
.bottom-message ion-icon { color: var(--terracotta); font-size: 18px; }
.dashboard-footer { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding: 18px clamp(18px, 4vw, 65px) 26px; font-size: 11px; color: #657464; border-top: 1px solid #e5dcc8; }

@media (max-width: 1250px) {
  .dashboard-nav-links { gap: 13px; }
  .dashboard-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .stat-card { padding-inline: 12px; }
  .section-actions { grid-template-columns: 1fr; }
}
@media (max-width: 1020px) {
  .dashboard-nav-links { display: none; }
  .dashboard-navbar-actions { margin-left: auto; }
  .dashboard-grid { grid-template-columns: 1fr; }
  .section-actions { grid-template-columns: 1fr 1fr; }
  .stat-card { padding-inline: 20px; }
}
@media (max-width: 700px) {
  .dashboard-navbar { min-height: 66px; padding: 11px 16px; gap: 10px; }
  .dashboard-brand { font-size: 28px; }
  .logout-button { padding: 10px; gap: 5px; }
  .logout-button span { display: none; }
  .dashboard-main { width: calc(100% - 28px); padding-top: 15px; }
  .welcome-hero { grid-template-columns: 1fr; padding: 26px 22px; gap: 20px; }
  .welcome-copy h1 { font-size: clamp(35px, 7vw, 49px); }
  .profile-card { max-width: 430px; padding: 14px; }
  .profile-avatar { flex-basis: 62px; width: 62px; height: 62px; font-size: 23px; }
  .profile-details strong { font-size: 20px; }
  .dashboard-grid { gap: 15px; margin-top: 15px; }
  .dashboard-section { padding: 18px; }
  .donor-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .stat-card { min-height: 122px; padding: 12px; }
  .stat-card strong { font-size: 19px; }
  .stat-card span { font-size: 10px; }
  .section-heading h2 { font-size: 30px; }
  .section-actions { grid-template-columns: 1fr; }
  .activity-heading h3 { font-size: 22px; }
  .dashboard-footer { padding: 16px; }
}
@media (max-width: 420px) {
  .donor-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .donor-stats .stat-warning { grid-column: 1 / -1; }
  .stat-card { min-height: 106px; }
  .profile-card { gap: 10px; }
  .profile-heart { display: none; }
  .section-emblem { width: 43px; height: 43px; flex-basis: 43px; }
  .empty-state { align-items: flex-start; gap: 12px; }
  .empty-icon { flex-basis: 50px; height: 50px; }
  .empty-icon ion-icon { font-size: 25px; }
  .dashboard-footer { flex-direction: column; gap: 5px; }
}
@media (prefers-reduced-motion: reduce) { .logout-button { transition: none; } }
</style>