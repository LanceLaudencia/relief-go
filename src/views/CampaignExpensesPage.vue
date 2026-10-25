<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/organizer/campaigns"></ion-back-button>
        </ion-buttons>
        <ion-title>Campaign Expenses</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading expenses...</p>
        </div>

        <div v-else-if="errorMessage || !campaign" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage || 'Campaign not found.' }}</p>
        </div>

        <template v-else>
          <h2>{{ campaign.title }}</h2>

          <div class="totals">
            <div class="total verified">
              <strong>{{ formatPeso(verifiedTotal) }}</strong>
              <span>Verified (public)</span>
            </div>
            <div class="total pending">
              <strong>{{ formatPeso(pendingTotal) }}</strong>
              <span>Pending review</span>
            </div>
            <div class="total rejected">
              <strong>{{ rejectedCount }}</strong>
              <span>Rejected</span>
            </div>
          </div>

          <ion-button
            expand="block"
            shape="round"
            :disabled="!canAdd"
            :router-link="`/organizer/campaigns/${campaign.id}/expenses/new`"
          >
            <ion-icon slot="start" :icon="addOutline"></ion-icon>
            Add Expense
          </ion-button>
          <p v-if="!canAdd" class="hint">Expenses can be added after your campaign is approved.</p>

          <ion-button
            expand="block"
            shape="round"
            fill="outline"
            :disabled="!isPublic"
            :router-link="`/campaigns/${campaign.id}/transparency`"
          >
            View public transparency report
          </ion-button>

          <div v-if="expenses.length === 0" class="state-box">
            <ion-icon :icon="receiptOutline" class="state-icon"></ion-icon>
            <h3>No expenses yet</h3>
            <p>Record each purchase or payment, with links to the receipts or photos.</p>
          </div>

          <div v-else>
            <ion-card v-for="expense in expenses" :key="expense.id">
              <ion-card-header>
                <ion-chip :color="expenseStatusColor(expense.status)">{{ expense.status }}</ion-chip>
                <ion-card-title>{{ formatPeso(expense.amount) }}</ion-card-title>
                <ion-card-subtitle>
                  {{ expense.category }} • {{ formatDate(expense.expenseDate) }}
                </ion-card-subtitle>
              </ion-card-header>

              <ion-card-content>
                <p class="description">{{ expense.description }}</p>

                <div class="docs">
                  <a
                    v-for="(doc, index) in expense.documents"
                    :key="index"
                    class="doc-link"
                    :href="doc.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ doc.type }}<span v-if="doc.label">: {{ doc.label }}</span>
                  </a>
                </div>

                <p v-if="expense.status === 'Pending Review'" class="note">
                  Waiting for administrator review. Not yet shown to the public.
                </p>
                <p v-if="expense.status === 'Verified'" class="note good">
                  Verified and shown on the public transparency report.
                </p>
                <p v-if="expense.status === 'Rejected'" class="note bad">
                  <strong>Rejected:</strong> {{ expense.rejectionReason || 'No reason given.' }}
                  You can edit the expense and submit it again.
                </p>

                <ion-button
                  v-if="canEdit(expense)"
                  size="small"
                  :router-link="`/organizer/campaigns/${campaign.id}/expenses/${expense.id}/edit`"
                >
                  {{ expense.status === 'Rejected' ? 'Edit and resubmit' : 'Edit' }}
                </ion-button>
              </ion-card-content>
            </ion-card>
          </div>
        </template>
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
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { addOutline, alertCircleOutline, receiptOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getCampaignRecord } from '../services/campaignService';
import { getMyExpensesForCampaign } from '../services/expenseService';
import { PUBLIC_STATUSES } from '../models/Campaign';
import type { Campaign } from '../models/Campaign';
import { EXPENSE_ALLOWED_CAMPAIGN_STATUSES } from '../models/Expense';
import type { Expense } from '../models/Expense';
import { formatDate, formatPeso } from '../utils/format';
import { expenseStatusColor } from '../utils/ui';

const route = useRoute();

// Read once when the page is created
const campaignId = String(route.params.id);

const campaign = ref<Campaign | null>(null);
const expenses = ref<Expense[]>([]);
const loading = ref(true);
const errorMessage = ref('');

const canAdd = computed(
  () => campaign.value !== null && EXPENSE_ALLOWED_CAMPAIGN_STATUSES.includes(campaign.value.status)
);
const isPublic = computed(
  () => campaign.value !== null && PUBLIC_STATUSES.includes(campaign.value.status)
);

const canEdit = (expense: Expense) =>
  expense.status === 'Pending Review' || expense.status === 'Rejected';

const verifiedTotal = computed(() =>
  expenses.value.filter((e) => e.status === 'Verified').reduce((sum, e) => sum + e.amount, 0)
);
const pendingTotal = computed(() =>
  expenses.value.filter((e) => e.status === 'Pending Review').reduce((sum, e) => sum + e.amount, 0)
);
const rejectedCount = computed(() => expenses.value.filter((e) => e.status === 'Rejected').length);

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  if (!user) return;

  if (!campaign.value) loading.value = true;
  errorMessage.value = '';

  try {
    const record = await getCampaignRecord(campaignId);
    if (!record || record.organizerId !== user.uid) {
      campaign.value = null;
      errorMessage.value = 'Campaign not found.';
    } else {
      campaign.value = record;
      expenses.value = await getMyExpensesForCampaign(user.uid, campaignId);
    }
  } catch (error) {
    campaign.value = null;
    errorMessage.value = error instanceof Error ? error.message : 'Could not load expenses.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

h2 {
  margin: 0 0 12px;
  font-weight: 800;
  color: var(--ion-color-primary);
}

.totals {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  text-align: center;
}

.total {
  padding: 10px 4px;
  border-radius: 12px;
  background: var(--rg-green-soft);
}

.total.pending {
  background: #fff7e0;
}

.total.rejected {
  background: #fde8e8;
}

.total strong {
  display: block;
  font-size: 0.95rem;
}

.total span {
  font-size: 0.75rem;
  color: #52606d;
}

.hint {
  margin: 4px 0 8px;
  text-align: center;
  font-size: 0.85rem;
  color: #7b8794;
}

ion-card {
  margin: 14px 0 0;
}

.description {
  margin: 0 0 10px;
  white-space: pre-line;
}

.docs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.doc-link {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--rg-green-soft);
  color: var(--ion-color-primary);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}

.note {
  margin: 8px 0;
  padding: 8px 12px;
  border-radius: 12px;
  background: #fff7e0;
  font-size: 0.85rem;
}

.note.good {
  background: var(--rg-green-soft);
}

.note.bad {
  background: #fde8e8;
  color: #b42318;
}

.state-box {
  text-align: center;
  padding: 40px 16px;
  color: #52606d;
}

.state-icon {
  font-size: 48px;
  color: var(--ion-color-secondary);
}
</style>