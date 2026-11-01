<template>
  <ion-page class="relief-campaigns-page">
    <ion-content :fullscreen="true" class="campaigns-content">
      <div class="campaigns-shell">
        <!-- Matching ReliefGO navigation from Welcome / Login pages -->
        <header class="campaigns-navbar">
          <router-link to="/welcome" class="brand" aria-label="ReliefGO Home">
            Relief<span>GO</span><b>♥</b>
          </router-link>
          <router-link to="/welcome" class="back-link">
            <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
            <span>BACK TO HOME</span>
          </router-link>
        </header>

        <main>
          <!-- Storybook-style green banner -->
          <section class="campaigns-hero" aria-labelledby="campaigns-heading">
            <div class="hero-text">
              <p class="eyebrow">RELIEFGO · COMMUNITY CAMPAIGNS</p>
              <h1 id="campaigns-heading">Every cause begins<br />with <em>kindness.</em></h1>
              <p class="hero-description">
                Discover fundraisers, support Filipino communities in need, and
                follow the impact of every helping hand.
              </p>
              <div class="hero-note">
                <span class="note-dot" aria-hidden="true"></span>
                STORIES OF BAYANIHAN LIVE HERE
              </div>
            </div>
            <div class="hero-art">
              <div class="hero-glow" aria-hidden="true"></div>
              <img
                :src="reliefLogo"
                alt="ReliefGO illustration of volunteers delivering donations"
                loading="eager"
              />
            </div>
          </section>

          <!-- Actual public campaigns with existing search and filtering -->
          <section class="browse-section" aria-labelledby="browse-heading">
            <div class="section-heading">
              <div>
                <p class="section-eyebrow">FIND YOUR WAY TO GIVE</p>
                <h2 id="browse-heading">Causes worth <em>caring for.</em></h2>
                <p class="section-description">
                  Browse available campaigns and choose where you'd like to make a difference.
                </p>
              </div>
              <div class="campaign-count" aria-live="polite">
                <strong>{{ loading ? '—' : filteredCampaigns.length }}</strong>
                <span>{{ filteredCampaigns.length === 1 ? 'CAMPAIGN FOUND' : 'CAMPAIGNS FOUND' }}</span>
              </div>
            </div>

            <div class="filter-panel">
              <div class="search-group">
                <label class="filter-label" for="campaign-search">SEARCH CAMPAIGNS</label>
                <div class="search-control">
                  <ion-icon :icon="searchOutline" aria-hidden="true" />
                  <ion-searchbar
                    id="campaign-search"
                    v-model="searchText"
                    placeholder="Search by cause, community, or location..."
                    aria-label="Search campaigns"
                    :debounce="200"
                    :animated="false"
                    class="campaign-searchbar"
                  ></ion-searchbar>
                </div>
              </div>
              <div class="category-group">
                <label class="filter-label" for="campaign-category">CATEGORY</label>
                <ion-select
                  id="campaign-category"
                  v-model="selectedCategory"
                  aria-label="Filter campaigns by category"
                  interface="popover"
                  fill="outline"
                  class="category-select"
                >
                  <ion-select-option value="All">All categories</ion-select-option>
                  <ion-select-option
                    v-for="category in CAMPAIGN_CATEGORIES"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </ion-select-option>
                </ion-select>
              </div>
            </div>

            <div class="results-row">
              <span><span class="results-accent">✦</span> COMMUNITY FUNDRAISERS</span>
              <button
                v-if="searchText || selectedCategory !== 'All'"
                class="clear-filters"
                type="button"
                @click="clearFilters"
              >
                CLEAR FILTERS <ion-icon :icon="closeOutline" aria-hidden="true" />
              </button>
            </div>

            <div v-if="loading" class="state-box" role="status" aria-live="polite">
              <ion-spinner name="crescent" class="state-spinner"></ion-spinner>
              <h3>Gathering stories of hope...</h3>
              <p>Loading the latest public campaigns.</p>
            </div>

            <div v-else-if="errorMessage" class="state-box" role="alert">
              <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
              <h3>Something went wrong.</h3>
              <p>{{ errorMessage }}</p>
              <button type="button" class="state-action" @click="loadCampaigns">
                TRY AGAIN <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
              </button>
            </div>

            <div v-else-if="filteredCampaigns.length === 0" class="state-box" role="status">
              <ion-icon :icon="searchOutline" class="state-icon"></ion-icon>
              <h3>No campaigns found.</h3>
              <p>Try searching for another cause or choose a different category.</p>
              <button type="button" class="state-action" @click="clearFilters">
                SHOW ALL CAMPAIGNS <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
              </button>
            </div>

            <!-- Preserve the existing CampaignCard component, routes, and real campaign photos. -->
            <div v-else class="campaign-grid">
              <div
                v-for="campaign in filteredCampaigns"
                :key="campaign.id"
                class="campaign-item"
              >
                <CampaignCard :campaign="campaign" />
              </div>
            </div>
          </section>
        </main>

        <footer class="campaigns-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Small acts. Big hearts. Real stories of bayanihan.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage,
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { searchOutline, alertCircleOutline, arrowBackOutline, arrowForwardOutline, closeOutline } from 'ionicons/icons';
import reliefLogo from '../assets/images/reliefgo-logo.png';
import CampaignCard from '../components/CampaignCard.vue';
import { getPublicCampaigns } from '../services/campaignService';
import { CAMPAIGN_CATEGORIES } from '../models/Campaign';
import type { Campaign } from '../models/Campaign';

const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const searchText = ref('');
const selectedCategory = ref('All');

const filteredCampaigns = computed(() => {
  const term = searchText.value.trim().toLowerCase();

  return campaigns.value.filter((campaign) => {
    const matchesCategory =
      selectedCategory.value === 'All' || campaign.category === selectedCategory.value;

    const matchesSearch =
      term === '' ||
      campaign.title.toLowerCase().includes(term) ||
      campaign.description.toLowerCase().includes(term) ||
      campaign.beneficiaryName.toLowerCase().includes(term) ||
      campaign.locationAddress.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });
});

function clearFilters() {
  searchText.value = '';
  selectedCategory.value = 'All';
}

async function loadCampaigns() {
  if (campaigns.value.length === 0) loading.value = true;
  errorMessage.value = '';

  try {
    campaigns.value = await getPublicCampaigns();
  } catch (error) {
    console.error('Failed to load campaigns:', error);
    errorMessage.value = error instanceof Error ? error.message : 'We could not load the campaigns.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(loadCampaigns);
</script>

<style scoped>
/* Consistent ReliefGO palette and type system. */
.relief-campaigns-page {
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
.campaigns-content {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}
.campaigns-content::part(background),
.campaigns-content::part(scroll) { background: var(--cream); }
.campaigns-shell {
  width: 100%;
  min-height: 100%;
  background: var(--cream);
  color: var(--forest);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.campaigns-shell * { box-sizing: border-box; }
.campaigns-shell a { text-decoration: none; color: inherit; }
.campaigns-shell h1, .campaigns-shell h2, .campaigns-shell h3,
.brand { font-family: Georgia, 'Times New Roman', serif; }

/* Cream header matches Welcome / Login. */
.campaigns-navbar {
  height: 76px;
  width: 100%;
  padding: 0 clamp(22px, 3vw, 52px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
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
  border-radius: 50px;
  border: 1px solid rgba(24, 60, 44, .35);
  font-size: 11px;
  letter-spacing: .8px;
  font-weight: 800;
  transition: background .18s, color .18s;
}
.back-link ion-icon { font-size: 17px; }
.back-link:hover, .back-link:focus-visible { background: var(--forest); color: #fff8e8; }

/* Inset dark-green banner, like other ReliefGO green sections. */
.campaigns-hero {
  width: calc(100% - 2 * var(--page-gutter));
  min-height: 260px;
  margin: 18px var(--page-gutter) 0;
  padding: 29px clamp(30px, 5.2vw, 90px);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
  align-items: center;
  gap: 20px;
  background: linear-gradient(120deg, #183c2c 0%, #102a20 100%);
  color: #fff8e8;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.campaigns-hero::before {
  content: 'RELIEFGO';
  position: absolute;
  right: -32px;
  top: -40px;
  z-index: -1;
  font: 700 clamp(80px, 14vw, 230px) Georgia, serif;
  line-height: 1;
  letter-spacing: -9px;
  white-space: nowrap;
  color: rgba(248,243,228,.06);
  pointer-events: none;
}
.hero-text { position: relative; z-index: 1; min-width: 0; }
.eyebrow { color: var(--gold); letter-spacing: 2.4px; font-size: 10px; font-weight: 800; margin: 0 0 13px; }
.campaigns-hero h1 {
  margin: 0 0 13px;
  font-size: clamp(37px, 3.6vw, 56px);
  line-height: 1.08;
  letter-spacing: -1.7px;
  font-weight: 400;
}
.campaigns-hero h1 em { color: var(--gold); font-weight: 400; }
.hero-description { max-width: 565px; margin: 0; font-size: clamp(12px, .94vw, 14px); line-height: 1.65; color: #d6dfd0; }
.hero-note { margin-top: 22px; display: flex; align-items: center; gap: 9px; color: var(--gold); letter-spacing: 1.5px; font-weight: 800; font-size: 9px; }
.note-dot { height: 8px; width: 8px; flex: none; border-radius: 50%; background: var(--gold); }
.hero-art { position: relative; display: grid; place-items: center; min-width: 0; height: 100%; }
.hero-glow { position: absolute; width: min(85%, 380px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, rgba(232,174,76,.17), transparent 69%); }
.hero-art img { width: min(100%, 340px); max-height: 237px; object-fit: contain; position: relative; filter: drop-shadow(0 9px 14px rgba(0,0,0,.12)); }

/* Content / search controls. */
.browse-section { width: calc(100% - 2 * var(--page-gutter)); max-width: 1520px; margin: 0 auto; padding: 46px clamp(3px, 2vw, 27px) 65px; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 25px; margin-bottom: 26px; }
.section-eyebrow { color: var(--terracotta); letter-spacing: 2.1px; font-weight: 800; font-size: 11px; margin: 0 0 12px; }
.section-heading h2 { margin: 0 0 10px; font-size: clamp(31px, 2.9vw, 46px); line-height: 1.1; font-weight: 400; letter-spacing: -1.3px; }
.section-heading h2 em { color: var(--terracotta); font-weight: 400; }
.section-description { color: var(--muted); margin: 0; font-size: 13px; line-height: 1.6; }
.campaign-count { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex: none; }
.campaign-count strong { font-size: 35px; line-height: 1; font-family: Georgia, serif; font-weight: 500; }
.campaign-count span { color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: 1.2px; }
.filter-panel { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(225px, .8fr); gap: 17px; align-items: end; margin: 0 0 27px; }
.search-group, .category-group { min-width: 0; }
.filter-label { display: block; color: var(--forest); margin: 0 0 8px 2px; font-size: 10px; font-weight: 800; letter-spacing: 1.4px; }
.search-control { display: flex; align-items: center; gap: 0; height: 57px; border: 1px solid #ddd3bf; border-radius: 13px; background: #fffdf7; overflow: hidden; }
.search-control > ion-icon { color: var(--terracotta); font-size: 21px; flex: 0 0 auto; margin-left: 17px; }
.campaign-searchbar { padding: 0 !important; width: 100%; height: 100%; flex: 1 1 auto; min-width: 0; --background: transparent; --color: #183c2c; --placeholder-color: #879083; --icon-color: transparent; --clear-button-color: #183c2c; --border-radius: 0; --box-shadow: none; font-family: inherit; font-size: 13px; }
.category-select { width: 100%; min-height: 57px; --background: #fffdf7; --border-color: #ddd3bf; --border-width: 1px; --border-radius: 13px; --padding-start: 16px; --padding-end: 15px; --highlight-color-focused: #c66b46; color: var(--forest); font-size: 13px; font-weight: 600; }
.results-row { display: flex; justify-content: space-between; align-items: center; gap: 15px; border-bottom: 1px solid #e2d8c3; padding: 0 2px 15px; margin-bottom: 22px; color: var(--forest); font-size: 10px; font-weight: 800; letter-spacing: 1.6px; }
.results-accent { color: var(--terracotta); padding-right: 8px; font-size: 13px; }
.clear-filters { padding: 6px 2px; display: flex; align-items: center; gap: 5px; background: transparent; border: 0; color: var(--terracotta); font-size: 10px; font-weight: 800; cursor: pointer; letter-spacing: .6px; }
.clear-filters ion-icon { font-size: 15px; }

/* CampaignCard.vue is kept intact. The wrapper styles its exterior only. */
.campaign-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 335px), 1fr)); gap: clamp(17px, 2vw, 25px); align-items: stretch; }
.campaign-item { min-width: 0; background: #fffdf7; border: 1px solid #e9dfc9; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 25px rgba(24,60,44,.07); transition: transform .2s, box-shadow .2s; }
.campaign-item:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(24,60,44,.12); }
.campaign-item :deep(ion-card) { margin: 0; border-radius: 0; box-shadow: none; background: #fffdf7; width: 100%; }
.campaign-item :deep(.campaign-card) { margin: 0; border-radius: 0; box-shadow: none; background: #fffdf7; }
.campaign-item :deep(img) { max-width: 100%; }
/* Typography and progress colors carry into the existing CampaignCard component. */
.campaign-item :deep(h2), .campaign-item :deep(h3),
.campaign-item :deep(ion-card-title) {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 500;
  color: #183c2c;
  line-height: 1.25;
}
.campaign-item :deep(p), .campaign-item :deep(ion-card-subtitle) {
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.campaign-item :deep(ion-progress-bar) {
  --background: #e5eadb;
  --progress-background: #3d8852;
  border-radius: 99px;
  overflow: hidden;
}

/* States use the same warm tone as the other pages. */
.state-box { min-height: 270px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 35px 18px; background: #fff9ed; border: 1px dashed #daceb5; border-radius: 17px; }
.state-box .state-icon { font-size: 46px; color: var(--terracotta); }
.state-spinner { color: #3d8852; width: 38px; height: 38px; }
.state-box h3 { font-size: 26px; font-weight: 400; margin: 1px 0 0; }
.state-box p { max-width: 460px; color: var(--muted); font-size: 13px; line-height: 1.6; margin: 0; }
.state-action { background: var(--gold); color: var(--deep); border: 0; border-radius: 30px; font-size: 11px; letter-spacing: .7px; font-weight: 800; padding: 12px 18px; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.campaigns-footer { padding: 23px var(--page-gutter) 30px; border-top: 1px solid #e5dac5; color: var(--muted); display: flex; justify-content: space-between; gap: 15px; font-size: 11px; }

@media (max-width: 850px) {
  .campaigns-hero { min-height: 240px; grid-template-columns: 1.3fr .7fr; padding: 25px 33px; }
  .campaigns-hero h1 { font-size: clamp(33px, 4.5vw, 48px); }
  .hero-art img { max-height: 205px; }
  .browse-section { padding-top: 35px; }
}
@media (max-width: 620px) {
  .relief-campaigns-page { --page-gutter: 14px; }
  .campaigns-navbar { height: 68px; padding: 0 16px; }
  .brand { font-size: 28px; }
  .back-link { font-size: 9px; padding: 10px 12px; gap: 5px; }
  .back-link ion-icon { font-size: 15px; }
  .campaigns-hero { margin-top: 11px; min-height: 0; grid-template-columns: 1fr; border-radius: 15px; padding: 26px 22px 20px; gap: 10px; }
  .campaigns-hero::before { font-size: 90px; top: 3px; right: -20px; }
  .campaigns-hero h1 { font-size: clamp(32px, 9vw, 42px); }
  .hero-description { font-size: 12px; }
  .hero-note { font-size: 8px; margin-top: 15px; }
  .hero-art { display: none; }
  .browse-section { width: calc(100% - 28px); padding: 29px 0 44px; }
  .section-heading { gap: 10px; align-items: flex-start; }
  .section-heading h2 { font-size: clamp(29px, 7.7vw, 38px); }
  .section-description { font-size: 12px; }
  .campaign-count strong { font-size: 29px; }
  .campaign-count span { font-size: 8px; max-width: 75px; text-align: right; }
  .filter-panel { grid-template-columns: 1fr; gap: 13px; }
  .results-row { letter-spacing: .8px; font-size: 9px; }
  .campaign-grid { grid-template-columns: 1fr; gap: 18px; }
  .campaigns-footer { justify-content: center; flex-wrap: wrap; text-align: center; font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .campaign-item, .back-link { transition: none; }
}
</style>