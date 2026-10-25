<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/organizer/campaigns"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Edit Campaign' : 'Start a Campaign' }}</ion-title>
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
        <ion-button shape="round" router-link="/organizer/campaigns">Back to My Campaigns</ion-button>
      </div>

      <div v-else class="form-wrapper">
        <p class="intro">
          Your campaign is public as soon as you publish it. Be honest and accurate. An
          administrator can suspend campaigns that break the rules.
        </p>

        <ion-input
          v-model="title"
          label="Campaign title"
          label-placement="floating"
          fill="outline"
          :maxlength="120"
          class="field"
        ></ion-input>

        <ion-select
          v-model="category"
          label="Category"
          label-placement="floating"
          fill="outline"
          interface="popover"
          class="field"
        >
          <ion-select-option v-for="item in CAMPAIGN_CATEGORIES" :key="item" :value="item">
            {{ item }}
          </ion-select-option>
        </ion-select>

        <ion-textarea
          v-model="description"
          label="Description (what is this campaign for?)"
          label-placement="floating"
          fill="outline"
          :auto-grow="true"
          :rows="4"
          :maxlength="5000"
          class="field"
        ></ion-textarea>

        <ion-input
          v-model="beneficiaryName"
          label="Beneficiary name or organization"
          label-placement="floating"
          fill="outline"
          :maxlength="150"
          class="field"
        ></ion-input>

        <ion-textarea
          v-model="beneficiaryInfo"
          label="Beneficiary information (who will be helped, how)"
          label-placement="floating"
          fill="outline"
          :auto-grow="true"
          :rows="3"
          :maxlength="2000"
          class="field"
        ></ion-textarea>

        <ion-input
          v-model="goalAmount"
          type="number"
          inputmode="decimal"
          label="Fundraising goal (₱)"
          label-placement="floating"
          fill="outline"
          class="field"
        ></ion-input>

        <div class="date-row">
          <ion-input
            v-model="startDate"
            type="date"
            label="Start date"
            label-placement="stacked"
            fill="outline"
          ></ion-input>
          <ion-input
            v-model="deadline"
            type="date"
            label="Deadline"
            label-placement="stacked"
            fill="outline"
          ></ion-input>
        </div>

        <ion-input
          v-model="locationAddress"
          label="Location address"
          label-placement="floating"
          fill="outline"
          :maxlength="300"
          class="field"
        ></ion-input>

        <LocationPicker v-model="pin" />

        <ion-input
          v-model="imageUrl"
          type="url"
          label="Image link (optional, starts with https://)"
          label-placement="floating"
          fill="outline"
          :maxlength="1000"
          class="field"
        ></ion-input>
        <p class="hint">Image uploads will be added later. For now, paste a link to an image.</p>
        <img v-if="showPreview" :src="imageUrl.trim()" alt="Campaign preview" class="preview" />

        <ion-text v-if="errorMessage" color="danger">
          <p class="error">{{ errorMessage }}</p>
        </ion-text>

        <ion-button expand="block" shape="round" :disabled="saving" @click="handleSubmit">
          <ion-spinner v-if="saving" name="crescent"></ion-spinner>
          <span v-else>{{ isEdit ? 'Save changes' : 'Publish campaign' }}</span>
        </ion-button>
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
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';
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

const showPreview = computed(() => imageUrl.value.trim().startsWith('https://'));

/** Today's date as YYYY-MM-DD in the person's own time zone. */
function today(): string {
  return new Date().toLocaleDateString('en-CA');
}

function resetForm() {
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
.form-wrapper {
  max-width: 560px;
  margin: 0 auto;
}

.intro {
  margin: 0 0 16px;
  color: #52606d;
}

.field {
  margin-bottom: 14px;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.hint {
  margin: -8px 0 14px;
  font-size: 0.8rem;
  color: #7b8794;
}

.preview {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 14px;
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