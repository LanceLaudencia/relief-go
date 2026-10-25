<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/organizer/campaigns"></ion-back-button>
        </ion-buttons>
        <ion-title>Campaign Updates</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="state-box">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Loading...</p>
      </div>

      <div v-else-if="blockMessage || !campaign" class="state-box">
        <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
        <p>{{ blockMessage || 'Campaign not found.' }}</p>
        <ion-button shape="round" router-link="/organizer/campaigns">Back to My Campaigns</ion-button>
      </div>

      <div v-else class="page-wrapper">
        <h2>{{ campaign.title }}</h2>
        <p class="intro">
          Share progress with your donors, such as goods distributed, treatment started, or thank
          yous. Updates are public.
        </p>

        <ion-input
          v-model="title"
          label="Update title"
          label-placement="floating"
          fill="outline"
          :maxlength="120"
          class="field"
        ></ion-input>

        <ion-textarea
          v-model="message"
          label="What happened?"
          label-placement="floating"
          fill="outline"
          :auto-grow="true"
          :rows="4"
          :maxlength="3000"
          class="field"
        ></ion-textarea>

        <ion-input
          v-model="imageUrl"
          type="url"
          label="Photo link (optional, starts with https://)"
          label-placement="floating"
          fill="outline"
          :maxlength="1000"
          class="field"
        ></ion-input>
        <p class="hint">
          Do not include faces of minors or private details in photos without permission.
        </p>
        <img v-if="showPreview" :src="imageUrl.trim()" alt="Photo preview" class="preview" />

        <ion-text v-if="errorMessage" color="danger">
          <p class="error">{{ errorMessage }}</p>
        </ion-text>

        <ion-button expand="block" shape="round" :disabled="posting" @click="handlePost">
          <ion-spinner v-if="posting" name="crescent"></ion-spinner>
          <span v-else>Post update</span>
        </ion-button>

        <h3>Posted updates</h3>
        <p v-if="updates.length === 0" class="muted">You have not posted any updates yet.</p>

        <ion-card v-for="update in updates" :key="update.id">
          <img v-if="update.imageUrl" :src="update.imageUrl" :alt="update.title" class="photo" />
          <ion-card-header>
            <ion-card-subtitle>{{ formatDate(update.createdAt) }}</ion-card-subtitle>
            <ion-card-title>{{ update.title }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p class="message">{{ update.message }}</p>
            <ion-button
              size="small"
              fill="outline"
              color="danger"
              :disabled="busyId === update.id"
              @click="handleDelete(update)"
            >
              Delete
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
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
import { alertCircleOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getCampaignRecord } from '../services/campaignService';
import {
  deleteCampaignUpdate,
  getCampaignUpdates,
  postCampaignUpdate,
} from '../services/updateService';
import type { Campaign } from '../models/Campaign';
import { UPDATE_ALLOWED_CAMPAIGN_STATUSES } from '../models/CampaignUpdate';
import type { CampaignUpdate } from '../models/CampaignUpdate';
import { formatDate } from '../utils/format';
import { confirmAction, showToast } from '../utils/ui';

const route = useRoute();

// Read once when the page is created
const campaignId = String(route.params.id);

const campaign = ref<Campaign | null>(null);
const updates = ref<CampaignUpdate[]>([]);

const title = ref('');
const message = ref('');
const imageUrl = ref('');

const loading = ref(true);
const posting = ref(false);
const busyId = ref('');
const errorMessage = ref('');
const blockMessage = ref('');

const showPreview = computed(() => imageUrl.value.trim().startsWith('https://'));

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  if (!user) return;

  blockMessage.value = '';
  errorMessage.value = '';
  if (!campaign.value) loading.value = true;

  try {
    const record = await getCampaignRecord(campaignId);
    if (!record || record.organizerId !== user.uid) {
      campaign.value = null;
      blockMessage.value = 'Campaign not found.';
    } else if (!UPDATE_ALLOWED_CAMPAIGN_STATUSES.includes(record.status)) {
      campaign.value = null;
      blockMessage.value = 'You can post updates while your campaign is live.';
    } else {
      campaign.value = record;
      updates.value = await getCampaignUpdates(campaignId);
    }
  } catch (error) {
    campaign.value = null;
    blockMessage.value = error instanceof Error ? error.message : 'Could not load the page.';
  } finally {
    loading.value = false;
  }
});

function validate(): string {
  if (title.value.trim().length < 3) return 'The title must be at least 3 characters.';
  if (message.value.trim().length < 5) return 'Please write a message of at least 5 characters.';
  const image = imageUrl.value.trim();
  if (image && !image.startsWith('https://')) return 'The photo link must start with https://';
  return '';
}

async function handlePost() {
  errorMessage.value = validate();
  if (errorMessage.value) return;

  const user = currentUser.value;
  if (!user || !campaign.value) return;

  posting.value = true;
  try {
    await postCampaignUpdate(campaign.value, user, {
      title: title.value,
      message: message.value,
      imageUrl: imageUrl.value,
    });
    title.value = '';
    message.value = '';
    imageUrl.value = '';
    updates.value = await getCampaignUpdates(campaignId);
    await showToast('Update posted.');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not post the update.';
  } finally {
    posting.value = false;
  }
}

async function handleDelete(update: CampaignUpdate) {
  const ok = await confirmAction(
    'Delete update',
    `Delete "${update.title}"? It will no longer be shown on your campaign page.`,
    'Delete'
  );
  if (!ok) return;

  busyId.value = update.id;
  try {
    await deleteCampaignUpdate(campaignId, update.id);
    updates.value = await getCampaignUpdates(campaignId);
    await showToast('Update deleted.');
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Could not delete.', 'danger');
  } finally {
    busyId.value = '';
  }
}
</script>

<style scoped>
.page-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  margin: 0 0 4px;
  font-weight: 800;
  color: var(--ion-color-primary);
}

h3 {
  margin: 28px 0 8px;
  font-weight: 700;
}

.intro {
  margin: 0 0 16px;
  color: #52606d;
}

.field {
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

.photo {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}

.message {
  margin: 0 0 12px;
  white-space: pre-line;
}

.error {
  margin: 0 0 12px;
  font-size: 0.9rem;
}

.muted {
  color: #7b8794;
}

ion-card {
  margin: 12px 0;
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