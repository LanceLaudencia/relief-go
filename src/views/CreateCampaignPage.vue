<template>
  <ion-page class="rg-page">
    <ion-header class="rg-header">
      <nav class="rg-navbar" aria-label="Campaign form navigation">
        <router-link to="/welcome" class="rg-brand" aria-label="ReliefGO home">
          Relief<span>GO</span><b>♥</b>
        </router-link>
        <router-link to="/organizer/campaigns" class="nav-back">
          <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
          <span>BACK TO MY CAMPAIGNS</span>
        </router-link>
      </nav>
    </ion-header>

    <ion-content class="rg-content">
      <div class="page-shell">
        <main class="main-content">
          <section class="hero" aria-labelledby="form-title">
            <div class="hero-text">
              <p class="kicker">YOUR BAYANIHAN JOURNEY <span>✦</span></p>
              <h1 id="form-title">{{ isEdit ? 'Edit your' : 'Start a' }} <em>campaign.</em></h1>
              <p>{{ isEdit ? 'Keep your campaign information accurate so supporters know the impact of their giving.' : 'Tell your story, share who needs help, and bring the spirit of bayanihan to life.' }}</p>
            </div>
            <div class="hero-badge" aria-hidden="true">
              <ion-icon :icon="heartOutline" />
              <span>SMALL ACTS.<br />BIG HEARTS.</span>
            </div>
          </section>

          <div v-if="loading" class="feedback-card" aria-live="polite">
            <ion-spinner name="crescent" />
            <h2>Loading campaign...</h2>
            <p>Retrieving your information.</p>
          </div>

          <div v-else-if="blockMessage" class="feedback-card" role="alert">
            <ion-icon :icon="alertCircleOutline" class="feedback-icon" />
            <h2>Campaign unavailable</h2>
            <p>{{ blockMessage }}</p>
            <router-link to="/organizer/campaigns" class="secondary-link">BACK TO MY CAMPAIGNS <ion-icon :icon="arrowForwardOutline" /></router-link>
          </div>

          <form v-else class="campaign-form" @submit.prevent="handleSubmit" novalidate>
            <div class="notice"><ion-icon :icon="informationCircleOutline" aria-hidden="true" />
              <p>Your campaign becomes public as soon as you publish it. Keep all information honest and accurate. Administrators may suspend campaigns that violate the rules.</p>
            </div>

            <section class="form-section" aria-labelledby="basics-title">
              <div class="section-title-row"><span class="step">01</span><div><p class="section-eyebrow">SHARE YOUR STORY</p><h2 id="basics-title">Campaign <em>details.</em></h2></div></div>
              <div class="form-grid">
                <div class="field-group full"><label for="campaign-title">CAMPAIGN TITLE</label>
                  <ion-input id="campaign-title" v-model="title" aria-label="Campaign title" fill="outline" placeholder="e.g. Help families rebuild after the storm" :maxlength="120" class="rg-field" />
                </div>
                <div class="field-group full"><label for="campaign-category">CATEGORY</label>
                  <ion-select id="campaign-category" v-model="category" aria-label="Category" fill="outline" interface="popover" placeholder="Choose a category" class="rg-field">
                    <ion-select-option v-for="item in CAMPAIGN_CATEGORIES" :key="item" :value="item">{{ item }}</ion-select-option>
                  </ion-select>
                </div>
                <div class="field-group full"><label for="campaign-description">CAMPAIGN DESCRIPTION</label>
                  <ion-textarea id="campaign-description" v-model="description" aria-label="Campaign description" fill="outline" :auto-grow="true" :rows="4" :maxlength="5000" placeholder="Explain your cause, why it matters, and how funds will be used..." class="rg-field rg-textarea" />
                </div>
              </div>
            </section>

            <section class="form-section" aria-labelledby="beneficiary-title">
              <div class="section-title-row"><span class="step">02</span><div><p class="section-eyebrow">PEOPLE AT THE HEART OF IT</p><h2 id="beneficiary-title">Who will <em>benefit?</em></h2></div></div>
              <div class="form-grid">
                <div class="field-group full"><label for="beneficiary-name">BENEFICIARY NAME OR ORGANIZATION</label>
                  <ion-input id="beneficiary-name" v-model="beneficiaryName" aria-label="Beneficiary name or organization" fill="outline" placeholder="Name of the family, group, or organization" :maxlength="150" class="rg-field" />
                </div>
                <div class="field-group full"><label for="beneficiary-info">BENEFICIARY INFORMATION</label>
                  <ion-textarea id="beneficiary-info" v-model="beneficiaryInfo" aria-label="Beneficiary information" fill="outline" :auto-grow="true" :rows="3" :maxlength="2000" placeholder="Who needs help, and how will this campaign support them?" class="rg-field rg-textarea" />
                </div>
              </div>
            </section>

            <section class="form-section" aria-labelledby="goal-title">
              <div class="section-title-row"><span class="step">03</span><div><p class="section-eyebrow">SET A CLEAR GOAL</p><h2 id="goal-title">Goal &amp; <em>timeline.</em></h2></div></div>
              <div class="form-grid">
                <div class="field-group full"><label for="goal-amount">FUNDRAISING GOAL (₱)</label>
                  <ion-input id="goal-amount" v-model="goalAmount" aria-label="Fundraising goal in pesos" type="number" inputmode="decimal" fill="outline" placeholder="Enter the amount needed" class="rg-field" />
                </div>
                <div class="field-group"><label for="start-date">START DATE</label>
                  <ion-input id="start-date" v-model="startDate" aria-label="Start date" type="date" fill="outline" class="rg-field" />
                </div>
                <div class="field-group"><label for="deadline">DEADLINE</label>
                  <ion-input id="deadline" v-model="deadline" aria-label="Deadline" type="date" fill="outline" class="rg-field" />
                </div>
              </div>
            </section>

            <section class="form-section" aria-labelledby="location-title">
              <div class="section-title-row"><span class="step">04</span><div><p class="section-eyebrow">WHERE HELP IS NEEDED</p><h2 id="location-title">Campaign <em>location.</em></h2></div></div>
              <div class="field-group"><label for="location-address">LOCATION ADDRESS</label>
                <ion-input id="location-address" v-model="locationAddress" aria-label="Location address" fill="outline" :maxlength="300" placeholder="Enter the beneficiary's location" class="rg-field" />
              </div>
              <p class="field-hint">Select a pin on the map below to help locate the community.</p>
              <div class="map-frame"><LocationPicker v-model="pin" /></div>
            </section>

            <section class="form-section" aria-labelledby="image-title">
              <div class="section-title-row"><span class="step">05</span><div><p class="section-eyebrow">HELP SUPPORTERS CONNECT</p><h2 id="image-title">Campaign <em>photo.</em></h2></div></div>
              <div class="field-group"><label for="campaign-image">IMAGE LINK (OPTIONAL)</label>
                <ion-input id="campaign-image" v-model="imageUrl" aria-label="Campaign image URL" type="url" fill="outline" :maxlength="1000" placeholder="https://example.com/photo.jpg" class="rg-field" />
              </div>
              <p class="field-hint">Image uploads will be added later. For now, paste a link that begins with https://.</p>
              <img v-if="showPreview" :src="imageUrl.trim()" alt="Campaign preview" class="preview" />
            </section>

            <ion-text v-if="errorMessage" color="danger" role="alert"><p class="error">{{ errorMessage }}</p></ion-text>
            <div class="submit-row">
              <div><p class="submit-kicker">READY TO MAKE A DIFFERENCE?</p><strong>{{ isEdit ? 'Keep your campaign up to date.' : 'Your bayanihan story starts here.' }}</strong></div>
              <ion-button class="submit-button" type="submit" :disabled="saving">
                <ion-spinner v-if="saving" name="crescent" />
                <template v-else>{{ isEdit ? 'SAVE CHANGES' : 'PUBLISH CAMPAIGN' }} <ion-icon slot="end" :icon="arrowForwardOutline" /></template>
              </ion-button>
            </div>
          </form>
        </main>
        <footer class="rg-footer"><span>© {{ new Date().getFullYear() }} ReliefGO</span><span>Stories of bayanihan live here.</span></footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
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
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline, arrowBackOutline, arrowForwardOutline, heartOutline, informationCircleOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker.vue';
import { currentUser } from '../services/authState';
import {
  createCampaign,
  getCampaignRecord,
  updateCampaign,
} from '../services/campaignService';
import type { MapPoint } from '../services/googleMaps';
import { CAMPAIGN_CATEGORIES, EDITABLE_STATUSES } from '../models/Campaign';
import type { Campaign, CampaignCategory } from '../models/Campaign';
import { showToast } from '../utils/ui';

const route = useRoute();
const router = useRouter();

// Read once when the page is created, so it does not change while navigating away
const campaignId = typeof route.params.id === 'string' ? route.params.id : '';
const isEdit = campaignId !== '';

const title = ref('');
const category = ref<CampaignCategory | ''>('');
const description = ref('');
const beneficiaryName = ref('');
const beneficiaryInfo = ref('');
const goalAmount = ref('');
const startDate = ref('');
const deadline = ref('');
const locationAddress = ref('');
const pin = ref<MapPoint | null>(null);
const imageUrl = ref('');

const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const blockMessage = ref('');
const existing = ref<Campaign | null>(null);

// Address auto-fill state (the address follows the map pin)
const GEOCODE_DELAY_MS = 600;
let geocodeTimer: ReturnType<typeof setTimeout> | null = null;
let geocodeRequestId = 0;
let lastAutoAddress = '';

const showPreview = computed(() => imageUrl.value.trim().startsWith('https://'));

/** Today's date as YYYY-MM-DD in the person's own time zone. */
function today(): string {
  return new Date().toLocaleDateString('en-CA');
}

function cancelGeocode() {
  if (geocodeTimer !== null) {
    clearTimeout(geocodeTimer);
    geocodeTimer = null;
  }
  geocodeRequestId++;
}

function resetForm() {
  cancelGeocode();
  title.value = '';
  category.value = '';
  description.value = '';
  beneficiaryName.value = '';
  beneficiaryInfo.value = '';
  goalAmount.value = '';
  startDate.value = today();
  deadline.value = '';
  locationAddress.value = '';
  pin.value = null;
  imageUrl.value = '';
  errorMessage.value = '';
  blockMessage.value = '';
  lastAutoAddress = '';
  existing.value = null;
}

function fillForm(campaign: Campaign) {
  title.value = campaign.title;
  category.value = campaign.category;
  description.value = campaign.description;
  beneficiaryName.value = campaign.beneficiaryName;
  beneficiaryInfo.value = campaign.beneficiaryInfo;
  goalAmount.value = String(campaign.goalAmount);
  startDate.value = campaign.startDate;
  deadline.value = campaign.deadline;
  locationAddress.value = campaign.locationAddress;
  pin.value =
    campaign.latitude !== null && campaign.longitude !== null
      ? { lat: campaign.latitude, lng: campaign.longitude }
      : null;
  imageUrl.value = campaign.imageUrl;
}

/** Turns coordinates into a readable address using the Google Geocoding API. */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return '';

  const url =
    'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
    `${lat},${lng}&key=${encodeURIComponent(key)}`;

  const response = await fetch(url);
  if (!response.ok) return '';

  const data = await response.json();
  if (data.status !== 'OK' || !data.results?.length) return '';
  return String(data.results[0].formatted_address || '');
}

/**
 * Whenever the pin changes (current-location button, map tap, or dragging the marker),
 * look up the address. Text the person typed themselves is never overwritten.
 */
watch(pin, (point) => {
  if (geocodeTimer !== null) {
    clearTimeout(geocodeTimer);
    geocodeTimer = null;
  }
  if (!point) return;

  const current = locationAddress.value.trim();
  if (current !== '' && current !== lastAutoAddress) return;

  const requestId = ++geocodeRequestId;
  geocodeTimer = setTimeout(async () => {
    geocodeTimer = null;
    try {
      const address = await reverseGeocode(point.lat, point.lng);
      if (requestId !== geocodeRequestId || !address) return;

      const latest = locationAddress.value.trim();
      if (latest === '' || latest === lastAutoAddress) {
        locationAddress.value = address;
        lastAutoAddress = address;
      }
    } catch {
      // The pin is still saved even if the address lookup fails
    }
  }, GEOCODE_DELAY_MS);
});

onIonViewWillEnter(async () => {
  resetForm();
  if (!isEdit) return;

  loading.value = true;
  try {
    const campaign = await getCampaignRecord(campaignId);
    if (!campaign || campaign.organizerId !== currentUser.value?.uid) {
      blockMessage.value = 'Campaign not found.';
    } else if (!EDITABLE_STATUSES.includes(campaign.status)) {
      blockMessage.value = 'This campaign can no longer be edited because it is suspended or closed.';
    } else {
      existing.value = campaign;
      fillForm(campaign);
    }
  } catch (error) {
    blockMessage.value = error instanceof Error ? error.message : 'Could not load the campaign.';
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  cancelGeocode();
});

function validate(): string {
  if (title.value.trim().length < 5) return 'The title must be at least 5 characters.';
  if (!category.value) return 'Please choose a category.';
  if (description.value.trim().length < 20) {
    return 'Please write a description of at least 20 characters.';
  }
  if (!beneficiaryName.value.trim()) return 'Please enter the beneficiary name or organization.';
  if (beneficiaryInfo.value.trim().length < 10) {
    return 'Please add beneficiary information (at least 10 characters).';
  }

  const goal = Number(goalAmount.value);
  if (!Number.isFinite(goal) || goal <= 0) return 'Enter a fundraising goal greater than ₱0.';
  if (goal > 10000000) return 'The goal cannot be more than ₱10,000,000.';

  if (!startDate.value || !deadline.value) return 'Please choose a start date and a deadline.';
  if (deadline.value <= startDate.value) return 'The deadline must be after the start date.';
  if (deadline.value < today()) return 'The deadline cannot be in the past.';

  if (!locationAddress.value.trim()) return 'Please enter the location address.';

  const image = imageUrl.value.trim();
  if (image && !image.startsWith('https://')) return 'The image link must start with https://';

  return '';
}

async function handleSubmit() {
  errorMessage.value = validate();
  if (errorMessage.value) return;

  const user = currentUser.value;
  if (!user) return;

  const form = {
    title: title.value,
    description: description.value,
    category: category.value as CampaignCategory,
    beneficiaryName: beneficiaryName.value,
    beneficiaryInfo: beneficiaryInfo.value,
    imageUrl: imageUrl.value,
    goalAmount: Number(goalAmount.value),
    startDate: startDate.value,
    deadline: deadline.value,
    locationAddress: locationAddress.value,
    latitude: pin.value ? pin.value.lat : null,
    longitude: pin.value ? pin.value.lng : null,
  };

  saving.value = true;
  try {
    if (isEdit && existing.value) {
      await updateCampaign(existing.value, form);
      await showToast('Changes saved.');
    } else {
      await createCampaign(form, user);
      await showToast('Campaign published.');
    }
    router.replace('/organizer/campaigns');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not save the campaign.';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.rg-page{--forest:#183c2c;--deep:#102a20;--cream:#f8f3e4;--gold:#e8ae4c;--terracotta:#c66b46;background:var(--cream);color:var(--forest)}
.rg-page *{box-sizing:border-box}.rg-page a{text-decoration:none}
.rg-header,.rg-navbar{background:var(--cream)}.rg-header{box-shadow:none}.rg-header::after{display:none}
.rg-navbar{height:74px;border-bottom:1px solid #e8dec9;padding:0 clamp(18px,4vw,66px);display:flex;align-items:center;justify-content:space-between;gap:20px;font-family:'DM Sans','Segoe UI',Arial,sans-serif}
.rg-brand{font:700 clamp(29px,2.6vw,37px)/1 Georgia,serif;letter-spacing:-2px;white-space:nowrap;color:var(--forest)}.rg-brand span,.rg-brand b{color:var(--terracotta)}.rg-brand b{font-size:12px;letter-spacing:0;vertical-align:top}
.nav-back,.secondary-link{display:inline-flex;align-items:center;gap:8px;color:var(--forest);font:800 11px 'DM Sans','Segoe UI',sans-serif;letter-spacing:1.1px}.nav-back ion-icon{font-size:20px}.nav-back:hover,.secondary-link:hover{color:var(--terracotta)}
.rg-content{--background:#f8f3e4;--color:#183c2c;--padding-start:0;--padding-end:0;--padding-top:0;--padding-bottom:0}
.page-shell{min-height:calc(100dvh - 74px);padding:24px clamp(16px,4vw,66px) 0;display:flex;flex-direction:column;font-family:'DM Sans','Avenir Next','Segoe UI',Arial,sans-serif}
.main-content{width:min(100%,1370px);margin:0 auto}.hero{background:linear-gradient(118deg,var(--forest),var(--deep));border-radius:21px;min-height:205px;color:#fff8e8;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:clamp(26px,4vw,52px);overflow:hidden;position:relative}.hero:after{content:'';position:absolute;right:6%;bottom:-135px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(232,174,76,.12),transparent 75%);pointer-events:none}.hero-text{max-width:720px;position:relative;z-index:1}.kicker,.section-eyebrow,.submit-kicker{font-weight:800;font-size:10px;letter-spacing:1.8px;color:var(--gold);margin:0 0 12px}.kicker span{color:#fff8e8}.hero h1,.section-title-row h2,.submit-row strong,.feedback-card h2{font-family:Georgia,'Times New Roman',serif;font-weight:400}.hero h1{font-size:clamp(39px,4.8vw,64px);line-height:1.05;letter-spacing:-1.7px;margin:0 0 14px}.hero h1 em{color:var(--gold);font-weight:400}.hero-text>p:last-child{font-size:14px;line-height:1.65;color:#d9e4d8;margin:0;max-width:570px}.hero-badge{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:160px;height:150px;border:1px solid rgba(255,248,232,.2);border-radius:20px;background:rgba(255,248,232,.06);flex-shrink:0}.hero-badge ion-icon{color:var(--gold);font-size:50px}.hero-badge span{font-weight:800;color:#f9e2ae;font-size:10px;line-height:1.5;letter-spacing:1.3px;text-align:center}
.campaign-form{width:min(100%,1010px);margin:26px auto 52px}.notice{display:flex;align-items:flex-start;gap:12px;padding:15px 19px;background:#f4e7ca;border:1px solid #e6d3ad;border-radius:15px;color:#4f634f}.notice ion-icon{color:var(--terracotta);font-size:23px;flex-shrink:0}.notice p{margin:0;font-size:12px;line-height:1.6}
.form-section{background:#fff9ed;border:1px solid #e8dcc5;border-radius:18px;padding:clamp(21px,3vw,33px);margin-top:18px}.section-title-row{display:flex;align-items:center;gap:16px;margin-bottom:23px}.step{font:400 34px Georgia,serif;color:#c4ab7b;min-width:45px}.section-eyebrow{color:var(--terracotta);margin:0 0 4px}.section-title-row h2{color:var(--forest);font-size:clamp(28px,3vw,37px);line-height:1.15;margin:0}.section-title-row h2 em{color:var(--terracotta)}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.field-group{display:flex;flex-direction:column;gap:8px;min-width:0;margin:0}.field-group.full{grid-column:1/-1}.field-group label{color:var(--forest);font-size:11px;font-weight:800;letter-spacing:1.2px}.rg-field{--background:#fffdf7;--color:#183c2c;--placeholder-color:#899284;--placeholder-opacity:1;--border-color:#d7cdbb;--border-width:1px;--highlight-color-focused:#c66b46;--border-radius:13px;--padding-start:17px;--padding-end:16px;--padding-top:13px;--padding-bottom:13px;min-height:51px;font-size:14px;font-family:'DM Sans','Segoe UI',sans-serif}.rg-field.ion-focused{--border-color:#c66b46}.rg-textarea{min-height:110px}.field-hint{color:#697568;font-size:12px;margin:12px 0 14px;line-height:1.6}.map-frame{border-radius:13px;overflow:hidden;border:1px solid #e5d9c3;background:#f3f0e6}.preview{display:block;width:100%;max-height:310px;object-fit:cover;border-radius:14px;margin:16px 0 0}.error{background:#fff0e9;border-radius:12px;padding:13px 16px;color:#a53125;font-size:13px;line-height:1.6}
.submit-row{padding:23px 27px;margin-top:20px;border-radius:18px;background:var(--forest);color:#fff8e8;display:flex;align-items:center;justify-content:space-between;gap:20px}.submit-kicker{margin-bottom:7px}.submit-row strong{font-size:clamp(18px,2.3vw,26px);line-height:1.2}.submit-button{margin:0;min-height:52px;--background:var(--gold);--color:#102a20;--border-radius:999px;--box-shadow:none;font-weight:800;font-size:12px;letter-spacing:1px;flex-shrink:0}.submit-button::part(native){padding-inline:25px}.submit-button ion-icon{font-size:18px}
.feedback-card{width:min(100%,920px);min-height:280px;padding:50px 24px;margin:26px auto;border-radius:18px;text-align:center;background:#fff9ed;border:1px solid #e8dcc5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}.feedback-card ion-spinner{color:var(--forest);width:34px;height:34px}.feedback-icon{color:var(--terracotta);font-size:42px}.feedback-card h2{font-size:29px;margin:0}.feedback-card p{color:#637363;margin:0 0 10px;font-size:13px}.secondary-link{font-size:11px}.rg-footer{width:min(100%,1370px);margin:auto auto 0;display:flex;align-items:center;justify-content:space-between;gap:20px;border-top:1px solid #e8ddc9;padding:18px 0;color:#738070;font:11px 'DM Sans','Segoe UI',sans-serif}
@media(max-width:700px){.rg-navbar{height:66px;padding-inline:16px}.nav-back{font-size:9px;letter-spacing:.4px}.nav-back ion-icon{font-size:17px}.page-shell{min-height:calc(100dvh - 66px);padding:15px 14px 0}.hero{padding:28px 24px;min-height:0}.hero-badge{display:none}.hero h1{font-size:38px}.hero-text>p:last-child{font-size:12px}.form-grid{grid-template-columns:1fr;gap:17px}.form-section{padding:21px 17px}.section-title-row{gap:11px}.section-title-row h2{font-size:27px}.step{min-width:35px;font-size:28px}.submit-row{padding:24px 20px;flex-direction:column;align-items:stretch}.submit-button{width:100%}.rg-footer{font-size:10px;flex-wrap:wrap;justify-content:center}}
@media(prefers-reduced-motion:reduce){.nav-back{scroll-behavior:auto}}
</style>