<template>
  <ion-page class="relief-details-page">
    <ion-content :fullscreen="true" class="details-content">
      <div class="details-shell">
        <!-- Same cream navigation and wordmark as the ReliefGO Campaigns page. -->
        <header class="details-navbar">
          <router-link to="/welcome" class="brand" aria-label="ReliefGO home">
            Relief<span>GO</span><b>♥</b>
          </router-link>
          <router-link to="/campaigns" class="back-link">
            <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
            <span>BACK TO CAMPAIGNS</span>
          </router-link>
        </header>

        <main class="details-main">
          <div v-if="loading" class="state-box" role="status" aria-live="polite">
            <ion-spinner name="crescent" class="state-spinner" />
            <h2>Gathering this story...</h2>
            <p>Loading the campaign details and community updates.</p>
          </div>

          <div v-else-if="!campaign" class="state-box" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h2>Campaign not found.</h2>
            <p>This campaign does not exist or is not available to the public.</p>
            <router-link to="/campaigns" class="state-action">
              EXPLORE CAMPAIGNS
              <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
            </router-link>
          </div>

          <template v-else>
            <!-- Inset dark-green campaign banner: actual user-uploaded image, if present. -->
            <section class="detail-hero" aria-labelledby="campaign-title">
              <div class="hero-copy">
                <p class="eyebrow">RELIEFGO <span class="eyebrow-dot">✦</span> STORIES OF BAYANIHAN</p>
                <span class="category-badge">{{ campaign.category }}</span>
                <h1 id="campaign-title">{{ campaign.title }}</h1>
                <p class="hero-description">Every helping hand can make a difference.</p>
                <div class="organizer-line">
                  <ion-icon :icon="peopleOutline" aria-hidden="true" />
                  <span>Organized by <strong>{{ campaign.organizerName }}</strong></span>
                </div>
              </div>

              <div class="hero-visual">
                <img
                  v-if="campaign.imageUrl"
                  :src="campaign.imageUrl"
                  :alt="`Photo for ${campaign.title}`"
                  loading="eager"
                />
                <div v-else class="hero-image-placeholder" role="img" aria-label="ReliefGO fundraising campaign illustration placeholder">
                  <span class="placeholder-rays" aria-hidden="true"></span>
                  <ion-icon :icon="heartOutline" aria-hidden="true" />
                  <span>SMALL ACTS. BIG HEARTS.</span>
                </div>
              </div>
            </section>

            <!-- Main content + fundraising summary, instead of a very narrow single column. -->
            <div class="detail-layout">
              <div class="detail-story">
                <section class="story-intro" aria-labelledby="story-section-heading">
                  <p class="section-eyebrow">THE STORY BEHIND THE CAUSE</p>
                  <h2 id="story-section-heading">A little help can bring <em>hope.</em></h2>
                  <p class="story-lead">Learn more about this campaign, the people it supports, and where help is needed.</p>
                </section>

                <section class="info-panel" aria-labelledby="about-heading">
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">01</span>
                    <div>
                      <p class="section-eyebrow">EVERY STORY MATTERS</p>
                      <h3 id="about-heading">About this campaign</h3>
                    </div>
                  </div>
                  <p class="body-copy">{{ campaign.description }}</p>
                </section>

                <section class="info-panel" aria-labelledby="beneficiary-heading">
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">02</span>
                    <div>
                      <p class="section-eyebrow">WHO WE'RE HELPING</p>
                      <h3 id="beneficiary-heading">The beneficiary</h3>
                    </div>
                  </div>
                  <p class="beneficiary-name">{{ campaign.beneficiaryName }}</p>
                  <p class="body-copy">{{ campaign.beneficiaryInfo }}</p>
                </section>

                <section class="info-panel location-panel" aria-labelledby="location-heading">
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">03</span>
                    <div>
                      <p class="section-eyebrow">WHERE HELP IS NEEDED</p>
                      <h3 id="location-heading">Campaign location</h3>
                    </div>
                  </div>
                  <p class="location-address">
                    <ion-icon :icon="locationOutline" aria-hidden="true" />
                    <span>{{ campaign.locationAddress }}</span>
                  </p>
                  <div class="map-frame">
                    <LocationMap
                      :latitude="campaign.latitude"
                      :longitude="campaign.longitude"
                      :address="campaign.locationAddress"
                    />
                  </div>
                </section>

                <section class="info-panel" aria-labelledby="updates-heading">
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">04</span>
                    <div>
                      <p class="section-eyebrow">FOLLOW THEIR JOURNEY</p>
                      <h3 id="updates-heading">Campaign updates</h3>
                    </div>
                  </div>
                  <div class="updates-content">
                    <CampaignUpdatesList :updates="updates" />
                  </div>
                </section>

                <section class="info-panel" aria-labelledby="donors-heading">
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">05</span>
                    <div>
                      <p class="section-eyebrow">KINDNESS IN ACTION</p>
                      <h3 id="donors-heading">Recent donors</h3>
                    </div>
                  </div>
                  <p v-if="donors.length === 0" class="empty-donors">
                    No verified donations yet. Be the first to help.
                  </p>
                  <ion-list v-else class="donor-list" lines="full">
                    <ion-item v-for="donor in donors" :key="donor.id" class="donor-item">
                      <ion-label>
                        <h4>{{ donor.donorName }}</h4>
                        <p>{{ formatDate(donor.verifiedAt) }}</p>
                      </ion-label>
                      <ion-note slot="end" class="donor-amount">{{ formatPeso(donor.amount) }}</ion-note>
                    </ion-item>
                  </ion-list>
                </section>
              </div>

              <aside class="donation-aside" aria-label="Fundraising and donation information">
                <div class="summary-card">
                  <p class="section-eyebrow">GIVE WITH HEART <span aria-hidden="true">♥</span></p>
                  <h2>Help make this <em>possible.</em></h2>

                  <div class="progress-section">
                    <!-- Keep the existing verified-donations component and real totals. -->
                    <CampaignProgress
                      :raised="campaign.verifiedTotal"
                      :goal="campaign.goalAmount"
                    />
                  </div>

                  <div class="stats">
                    <div class="stat">
                      <strong>{{ campaign.verifiedDonorCount }}</strong>
                      <span>Verified donors</span>
                    </div>
                    <div class="stat">
                      <strong>{{ remainingDays }}</strong>
                      <span>Days left</span>
                    </div>
                    <div class="stat">
                      <strong>{{ formatDate(campaign.deadline) }}</strong>
                      <span>Deadline</span>
                    </div>
                  </div>

                  <ion-button
                    expand="block"
                    class="donate-button"
                    :disabled="donateDisabled"
                    :router-link="`/campaigns/${campaign.id}/donate`"
                  >
                    DONATE NOW
                    <ion-icon slot="end" :icon="arrowForwardOutline" aria-hidden="true" />
                  </ion-button>
                  <p v-if="donateHint" class="donate-hint">{{ donateHint }}</p>

                  <div class="summary-divider"></div>
                  <div class="transparency-note">
                    <ion-icon :icon="shieldCheckmarkOutline" aria-hidden="true" />
                    <span>Fundraising progress reflects verified donations.</span>
                  </div>
                </div>

                <router-link
                  :to="`/campaigns/${campaign.id}/transparency`"
                  class="transparency-link"
                >
                  <span>
                    <small>ACCOUNTABILITY MATTERS</small>
                    <strong>View Transparency Report</strong>
                  </span>
                  <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                </router-link>
              </aside>
            </div>
          </template>
        </main>

        <footer class="details-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  arrowBackOutline,
  arrowForwardOutline,
  heartOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  locationOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import CampaignProgress from '../components/CampaignProgress.vue';
import CampaignUpdatesList from '../components/CampaignUpdatesList.vue';
import LocationMap from '../components/LocationMap.vue';
import { currentUser } from '../services/authState';
import { getCampaignById } from '../services/campaignService';
import { getPublicDonors } from '../services/donationService';
import { getCampaignUpdates } from '../services/updateService';
import { formatDate, formatPeso, daysLeft } from '../utils/format';
import type { Campaign } from '../models/Campaign';
import type { CampaignUpdate } from '../models/CampaignUpdate';
import type { PublicDonor } from '../models/Donation';

const route = useRoute();
const campaignId = String(route.params.id);

const campaign = ref<Campaign | null>(null);
const donors = ref<PublicDonor[]>([]);
const updates = ref<CampaignUpdate[]>([]);
const loading = ref(true);

const remainingDays = computed(() =>
  campaign.value ? daysLeft(campaign.value.deadline) : 0
);

const isOwnCampaign = computed(
  () => campaign.value !== null && currentUser.value?.uid === campaign.value.organizerId
);

// Preserve the original donation restrictions and login redirect behavior.
const donateDisabled = computed(
  () => currentUser.value?.role === 'admin' || isOwnCampaign.value || remainingDays.value === 0
);

const donateHint = computed(() => {
  const user = currentUser.value;
  if (remainingDays.value === 0) return 'This campaign has reached its deadline.';
  if (!user) return 'You will be asked to log in first.';
  if (user.role === 'admin') return 'Administrator accounts cannot donate.';
  if (isOwnCampaign.value) return 'You cannot donate to your own campaign.';
  return '';
});

onIonViewWillEnter(async () => {
  if (!campaign.value) loading.value = true;

  try {
    campaign.value = await getCampaignById(campaignId);
    donors.value = campaign.value ? await getPublicDonors(campaignId) : [];
  } catch (error) {
    console.error('Failed to load campaign:', error);
    campaign.value = null;
  } finally {
    loading.value = false;
  }

  // Load updates separately, just like the original page.
  if (campaign.value) {
    try {
      updates.value = (await getCampaignUpdates(campaignId)).slice(0, 5);
    } catch (error) {
      console.error('Failed to load updates:', error);
      updates.value = [];
    }
  }
});
</script>

<style scoped>
.relief-details-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --terracotta: #c66b46;
  --gold: #e8ae4c;
  --muted: #667365;
  --page-gutter: clamp(18px, 4.5vw, 72px);
  background: var(--cream);
  color: var(--forest);
}

.details-content {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}
.details-content::part(background),
.details-content::part(scroll) { background: var(--cream); }

.details-shell {
  width: 100%;
  min-height: 100%;
  background: var(--cream);
  color: var(--forest);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.details-shell * { box-sizing: border-box; }
.details-shell a { text-decoration: none; color: inherit; }
.details-shell h1,
.details-shell h2,
.details-shell h3,
.brand { font-family: Georgia, 'Times New Roman', serif; }

/* Navbar is identical in spirit to the ReliefGO Campaigns page. */
.details-navbar {
  min-height: 76px;
  padding: 0 clamp(22px, 3vw, 52px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: var(--cream);
  border-bottom: 1px solid #e9dfc9;
}
.brand {
  white-space: nowrap;
  font-size: clamp(29px, 2.25vw, 35px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
}
.brand span, .brand b { color: var(--terracotta); }
.brand b { font-size: 12px; vertical-align: top; margin-left: 2px; }
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 17px;
  border-radius: 999px;
  border: 1px solid rgba(24, 60, 44, .35);
  font-size: 11px;
  letter-spacing: .8px;
  font-weight: 800;
  transition: background .18s, color .18s;
}
.back-link ion-icon { font-size: 17px; }
.back-link:hover, .back-link:focus-visible { background: var(--forest); color: #fff8e8; }

.details-main { padding-bottom: 50px; }

/* An inset cinematic banner: green still has cream gutters on both sides. */
.detail-hero {
  width: calc(100% - 2 * var(--page-gutter));
  margin: 18px var(--page-gutter) 0;
  min-height: 332px;
  padding: clamp(24px, 3.7vw, 56px);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
  align-items: center;
  gap: clamp(21px, 3vw, 48px);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(125deg, var(--forest), var(--deep));
  color: #fff8e8;
  border-radius: 18px;
}
.detail-hero::before {
  content: 'BAYANIHAN';
  position: absolute;
  top: -40px;
  left: -20px;
  z-index: -1;
  pointer-events: none;
  font: 700 clamp(80px, 12vw, 175px) Georgia, serif;
  letter-spacing: -9px;
  color: rgba(248,243,228,.045);
  white-space: nowrap;
}
.hero-copy { min-width: 0; }
.eyebrow, .section-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.9px;
  line-height: 1.5;
}
.eyebrow { margin: 0 0 22px; color: var(--gold); }
.eyebrow-dot { padding-inline: 7px; color: #fff8e8; }
.category-badge {
  display: inline-flex;
  padding: 8px 13px;
  border: 1px solid rgba(255,248,232,.35);
  border-radius: 999px;
  background: rgba(255,248,232,.12);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .7px;
  color: #fff8e8;
}
.hero-copy h1 {
  margin: 16px 0 13px;
  font-size: clamp(36px, 3.75vw, 62px);
  line-height: 1.08;
  font-weight: 400;
  letter-spacing: -1.4px;
  overflow-wrap: anywhere;
}
.hero-description {
  margin: 0 0 24px;
  color: #d6dfd0;
  font-size: clamp(13px, 1vw, 15px);
  line-height: 1.65;
}
.organizer-line { display: flex; align-items: center; gap: 9px; color: #e3e9de; font-size: 13px; line-height: 1.5; min-width: 0; }
.organizer-line ion-icon { font-size: 18px; color: var(--gold); flex-shrink: 0; }
.organizer-line strong { font-weight: 800; color: #fff8e8; overflow-wrap: anywhere; }

.hero-visual { width: 100%; min-width: 0; height: 295px; overflow: hidden; border-radius: 15px; background: #234c3a; border: 1px solid rgba(255,255,255,.2); }
.hero-visual > img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-image-placeholder { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 21px; overflow: hidden; background: radial-gradient(circle at 70% 25%, rgba(232,174,76,.17), transparent 47%), linear-gradient(145deg, #275b43, #102a20); }
.hero-image-placeholder::before { content: ''; position: absolute; inset: 15px; border: 1px solid rgba(255,248,232,.17); border-radius: 8px; pointer-events: none; }
.hero-image-placeholder ion-icon { font-size: clamp(60px, 6vw, 100px); color: var(--gold); opacity: .95; z-index: 1; }
.hero-image-placeholder > span:last-child { color: #fff8e8; font-size: 10px; letter-spacing: 3px; font-weight: 800; z-index: 1; }
.placeholder-rays { position: absolute; width: 210px; height: 210px; border-radius: 50%; background: radial-gradient(circle, rgba(232,174,76,.14), transparent 70%); }

/* Full-width, balanced campaign story + donation card. */
.detail-layout {
  width: calc(100% - 2 * var(--page-gutter));
  max-width: 1500px;
  margin: 0 auto;
  padding: clamp(32px, 4vw, 60px) clamp(0px, 1.2vw, 18px) 0;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(305px, .75fr);
  gap: clamp(26px, 4vw, 64px);
  align-items: start;
}
.detail-story, .donation-aside { min-width: 0; }
.story-intro { margin: 0 0 27px; }
.section-eyebrow { color: var(--terracotta); margin: 0 0 9px; }
.story-intro h2 { margin: 0 0 12px; font-size: clamp(32px, 3.3vw, 49px); line-height: 1.12; letter-spacing: -1.2px; font-weight: 400; }
.story-intro h2 em, .summary-card h2 em { color: var(--terracotta); font-weight: 400; }
.story-lead { color: var(--muted); font-size: 13px; line-height: 1.7; margin: 0; max-width: 600px; }
.info-panel { background: #fff9ed; border: 1px solid #e8dfcb; border-radius: 17px; padding: clamp(20px, 2.1vw, 31px); margin: 0 0 21px; box-shadow: 0 9px 24px rgba(24,60,44,.035); }
.panel-heading { display: flex; align-items: flex-start; gap: 17px; margin-bottom: 17px; }
.heading-accent { font: 400 26px Georgia, serif; color: var(--terracotta); opacity: .72; min-width: 33px; }
.panel-heading h3 { margin: 0; font-size: clamp(24px, 2vw, 30px); font-weight: 400; line-height: 1.2; letter-spacing: -.5px; }
.panel-heading .section-eyebrow { font-size: 9px; letter-spacing: 1.5px; margin-bottom: 5px; }
.body-copy { font-size: 14px; color: #485a4e; line-height: 1.85; margin: 0; overflow-wrap: anywhere; white-space: pre-line; }
.beneficiary-name { margin: 0 0 8px; font: 400 22px Georgia, serif; color: var(--forest); overflow-wrap: anywhere; }
.location-address { display: flex; align-items: flex-start; gap: 11px; margin: 0 0 17px; color: #485a4e; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.location-address ion-icon { color: var(--terracotta); font-size: 20px; flex: none; }
.map-frame { overflow: hidden; border-radius: 13px; border: 1px solid #e0d5c1; min-width: 0; }
.updates-content { font-size: 13px; color: #485a4e; }
.empty-donors { padding: 16px; border-radius: 11px; background: #f0f1e5; color: #526657; font-size: 13px; line-height: 1.5; margin: 0; }
.donor-list { background: transparent; padding: 0; }
.donor-item { --background: #fff9ed; --border-color: #e8dfcb; --padding-start: 0; --padding-end: 0; }
.donor-item ion-label h4 { color: var(--forest); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 800; }
.donor-item ion-label p { font-size: 11px; color: var(--muted); }
.donor-amount { color: var(--forest); font-size: 13px; font-weight: 800; }

.donation-aside { position: sticky; top: 16px; }
.summary-card { background: #fff9ed; border: 1px solid #e2d5bf; border-radius: 18px; padding: clamp(20px, 2.1vw, 35px); box-shadow: 0 16px 38px rgba(24,60,44,.09); }
.summary-card > .section-eyebrow { margin-bottom: 13px; }
.summary-card > .section-eyebrow span { color: var(--terracotta); }
.summary-card h2 { margin: 0 0 25px; font-size: clamp(28px, 2.2vw, 39px); line-height: 1.15; font-weight: 400; letter-spacing: -.7px; }
.progress-section { padding: 0 0 17px; border-bottom: 1px solid #e8dfcb; }
.progress-section :deep(ion-progress-bar) { --background: #e5eadb; --progress-background: #3d8852; height: 11px; border-radius: 999px; overflow: hidden; }
.progress-section :deep(strong),
.progress-section :deep(.amount) { color: var(--forest); }
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 21px 0 22px; }
.stat { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 86px; gap: 7px; padding: 11px 4px; background: #edf0e6; border-radius: 12px; min-width: 0; }
.stat strong { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(14px, 1.2vw, 20px); font-weight: 700; color: var(--forest); line-height: 1.13; overflow-wrap: anywhere; }
.stat span { font-size: 10px; line-height: 1.4; color: #5e6e5f; }
.donate-button { width: 100%; margin: 0; min-height: 51px; --background: var(--gold); --background-hover: #f0bc62; --background-activated: #d99e34; --color: var(--deep); --border-radius: 999px; --box-shadow: none; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 1.2px; }
.donate-button ion-icon { font-size: 20px; }
.donate-hint { margin: 10px 0 0; font-size: 11px; line-height: 1.5; text-align: center; color: var(--muted); }
.summary-divider { height: 1px; background: #e8dfcb; margin: 22px 0 17px; }
.transparency-note { display: flex; align-items: center; gap: 10px; color: #526657; font-size: 11px; line-height: 1.5; }
.transparency-note ion-icon { flex: none; color: #3d8852; font-size: 24px; }
.transparency-link { display: flex; align-items: center; justify-content: space-between; gap: 13px; margin-top: 15px; padding: 21px 23px; background: var(--forest); color: #fff8e8 !important; border-radius: 16px; transition: background .2s; }
.transparency-link:hover { background: var(--deep); }
.transparency-link > span { display: flex; flex-direction: column; gap: 8px; }
.transparency-link small { color: var(--gold); font-size: 9px; letter-spacing: 1.3px; font-weight: 800; }
.transparency-link strong { font: 400 20px Georgia, serif; }
.transparency-link > ion-icon { font-size: 24px; color: var(--gold); flex: none; }

.state-box { width: calc(100% - 2 * var(--page-gutter)); max-width: 950px; min-height: 360px; margin: 22px auto 0; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 13px; border: 1px dashed #d6cbb4; background: #fff9ed; border-radius: 18px; text-align: center; }
.state-box h2 { font-size: clamp(27px, 3vw, 40px); font-weight: 400; margin: 0; }
.state-box p { font-size: 13px; color: var(--muted); margin: 0; line-height: 1.7; }
.state-spinner { color: #3d8852; width: 41px; height: 41px; }
.state-icon { color: var(--terracotta); font-size: 51px; }
.state-action { display: flex; align-items: center; gap: 10px; margin-top: 13px; padding: 14px 24px; color: var(--deep) !important; background: var(--gold); border-radius: 999px; font-weight: 800; letter-spacing: .8px; font-size: 11px; }

.details-footer { min-height: 80px; padding: 22px var(--page-gutter) 30px; display: flex; align-items: center; justify-content: space-between; gap: 15px; border-top: 1px solid #e5dac5; color: var(--muted); font-size: 11px; }

@media (max-width: 1000px) {
  .detail-hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 19px; }
  .hero-copy h1 { font-size: clamp(32px, 4.2vw, 49px); }
  .hero-visual { height: 275px; }
  .detail-layout { grid-template-columns: minmax(0, 1fr) minmax(275px, .8fr); gap: 23px; }
  .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .relief-details-page { --page-gutter: clamp(12px, 3vw, 23px); }
  .details-navbar { min-height: 69px; padding-inline: 17px; }
  .brand { font-size: 28px; }
  .back-link { padding: 10px 12px; gap: 6px; font-size: 9px; }
  .back-link ion-icon { font-size: 15px; }
  .detail-hero { margin-top: 12px; grid-template-columns: 1fr; gap: 21px; padding: 25px 22px 22px; }
  .detail-hero::before { font-size: 100px; top: -15px; }
  .eyebrow { margin-bottom: 13px; font-size: 9px; }
  .hero-copy h1 { font-size: clamp(31px, 7.8vw, 45px); margin-top: 12px; }
  .hero-description { margin-bottom: 13px; }
  .hero-visual { height: clamp(205px, 50vw, 330px); }
  .detail-layout { grid-template-columns: 1fr; padding-top: 30px; gap: 22px; }
  .donation-aside { position: static; grid-row: 1; }
  .story-intro { margin-bottom: 20px; }
  .story-intro h2 { font-size: clamp(30px, 7vw, 40px); }
  .info-panel { margin-bottom: 15px; }
  .details-main { padding-bottom: 24px; }
  .details-footer { flex-wrap: wrap; justify-content: center; text-align: center; padding: 21px; min-height: 75px; }
}

@media (max-width: 410px) {
  .details-navbar { padding-inline: 12px; }
  .brand { font-size: 26px; }
  .back-link { font-size: 8px; padding: 9px 10px; }
  .detail-hero { padding: 22px 16px; }
  .hero-copy h1 { font-size: 31px; }
  .hero-visual { height: 205px; }
  .summary-card { padding: 19px 14px; }
  .stat { padding-inline: 3px; }
  .stat strong { font-size: 14px; }
  .stat span { font-size: 9px; }
  .panel-heading { gap: 11px; }
  .heading-accent { min-width: 28px; font-size: 24px; }
}

@media (prefers-reduced-motion: reduce) {
  .back-link, .transparency-link { transition: none; }
}
</style>