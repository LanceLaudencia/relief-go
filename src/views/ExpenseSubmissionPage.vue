<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button
            :default-href="`/organizer/campaigns/${campaignId}/expenses`"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Edit Expense' : 'Add Expense' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="state-box">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Loading...</p>
      </div>

      <div v-else-if="blockMessage" class="state-box">
        <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
        <p>{{ blockMessage }}</p>
        <ion-button shape="round" :router-link="`/organizer/campaigns/${campaignId}/expenses`">
          Back to expenses
        </ion-button>
      </div>

      <div v-else class="form-wrapper">
        <ion-card class="summary">
          <ion-card-header>
            <ion-card-subtitle>Expense for</ion-card-subtitle>
            <ion-card-title>{{ campaign?.title }}</ion-card-title>
          </ion-card-header>
        </ion-card>

        <p class="intro">
          An administrator reviews every expense. Only verified expenses appear on the public
          transparency report.
        </p>

        <ion-textarea
          v-model="description"
          label="What was bought or paid for?"
          label-placement="floating"
          fill="outline"
          :auto-grow="true"
          :rows="3"
          :maxlength="1000"
          class="field"
        ></ion-textarea>

        <ion-input
          v-model="amount"
          type="number"
          inputmode="decimal"
          label="Amount spent (₱)"
          label-placement="floating"
          fill="outline"
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
          <ion-select-option v-for="item in EXPENSE_CATEGORIES" :key="item" :value="item">
            {{ item }}
          </ion-select-option>
        </ion-select>

        <ion-input
          v-model="expenseDate"
          type="date"
          :max="today()"
          label="Date of expense"
          label-placement="stacked"
          fill="outline"
          class="field"
        ></ion-input>

        <h3>Supporting documents</h3>
        <p class="notice">
          Upload each receipt, invoice, photo of goods, or acknowledgment receipt to Google Drive
          (or a similar site), set sharing to "Anyone with the link can view", and paste the link
          below. These links become <strong>public</strong> once an administrator verifies the
          expense. Hide or cover personal details first, such as ID numbers, home addresses, and
          card or account numbers.
        </p>

        <ion-card v-for="(row, index) in docRows" :key="row.key" class="doc-card">
          <ion-card-content>
            <ion-select
              v-model="row.type"
              label="Document type"
              label-placement="floating"
              fill="outline"
              interface="popover"
              class="field"
            >
              <ion-select-option v-for="type in DOCUMENT_TYPES" :key="type" :value="type">
                {{ type }}
              </ion-select-option>
            </ion-select>

            <ion-input
              v-model="row.url"
              type="url"
              label="Link (starts with https://)"
              label-placement="floating"
              fill="outline"
              :maxlength="1000"
              class="field"
            ></ion-input>

            <ion-input
              v-model="row.label"
              label="Short note (optional)"
              label-placement="floating"
              fill="outline"
              :maxlength="100"
              class="field"
            ></ion-input>

            <ion-button
              v-if="docRows.length > 1"
              size="small"
              fill="clear"
              color="danger"
              @click="removeRow(index)"
            >
              Remove this document
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-button
          size="small"
          fill="outline"
          :disabled="docRows.length >= MAX_DOCUMENTS"
          @click="addRow"
        >
          <ion-icon slot="start" :icon="addOutline"></ion-icon>
          Add another document
        </ion-button>

        <ion-text v-if="errorMessage" color="danger">
          <p class="error">{{ errorMessage }}</p>
        </ion-text>

        <ion-button expand="block" shape="round" :disabled="saving" class="submit" @click="handleSubmit">
          <ion-spinner v-if="saving" name="crescent"></ion-spinner>
          <span v-else>{{ isEdit ? 'Save and resubmit for review' : 'Submit for review' }}</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
import { addOutline, alertCircleOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getCampaignRecord } from '../services/campaignService';
import { createExpense, getExpense, updateExpense } from '../services/expenseService';
import type { Campaign } from '../models/Campaign';
import {
  DOCUMENT_TYPES,
  EXPENSE_ALLOWED_CAMPAIGN_STATUSES,
  EXPENSE_CATEGORIES,
  MAX_DOCUMENTS,
} from '../models/Expense';
import type { DocumentType, Expense, ExpenseCategory } from '../models/Expense';
import { showToast } from '../utils/ui';

interface DocRow {
  key: number;
  type: DocumentType;
  url: string;
  label: string;
}

const route = useRoute();
const router = useRouter();

// Read once when the page is created
const campaignId = String(route.params.id);
const expenseId = typeof route.params.expenseId === 'string' ? route.params.expenseId : '';
const isEdit = expenseId !== '';

const campaign = ref<Campaign | null>(null);
const existing = ref<Expense | null>(null);

const description = ref('');
const amount = ref('');
const category = ref<ExpenseCategory | ''>('');
const expenseDate = ref('');
const docRows = ref<DocRow[]>([]);

const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const blockMessage = ref('');

let rowCounter = 0;

function newRow(type: DocumentType = 'Receipt', url = '', label = ''): DocRow {
  rowCounter += 1;
  return { key: rowCounter, type, url, label };
}

/** Today's date as YYYY-MM-DD in the person's own time zone. */
function today(): string {
  return new Date().toLocaleDateString('en-CA');
}

function addRow() {
  if (docRows.value.length < MAX_DOCUMENTS) docRows.value.push(newRow());
}

function removeRow(index: number) {
  docRows.value.splice(index, 1);
}

function resetForm() {
  description.value = '';
  amount.value = '';
  category.value = '';
  expenseDate.value = today();
  docRows.value = [newRow()];
  errorMessage.value = '';
  blockMessage.value = '';
  campaign.value = null;
  existing.value = null;
}

onIonViewWillEnter(async () => {
  resetForm();
  const user = currentUser.value;
  if (!user) return;

  loading.value = true;
  try {
    const record = await getCampaignRecord(campaignId);
    if (!record || record.organizerId !== user.uid) {
      blockMessage.value = 'Campaign not found.';
      return;
    }
    if (!EXPENSE_ALLOWED_CAMPAIGN_STATUSES.includes(record.status)) {
      blockMessage.value = 'Expenses can only be added to approved campaigns.';
      return;
    }
    campaign.value = record;

    if (isEdit) {
      const expense = await getExpense(expenseId);
      if (!expense || expense.organizerId !== user.uid || expense.campaignId !== campaignId) {
        blockMessage.value = 'Expense not found.';
        return;
      }
      if (expense.status === 'Verified') {
        blockMessage.value =
          'This expense has already been verified and can no longer be edited.';
        return;
      }

      existing.value = expense;
      description.value = expense.description;
      amount.value = String(expense.amount);
      category.value = expense.category;
      expenseDate.value = expense.expenseDate;
      docRows.value = expense.documents.map((doc) => newRow(doc.type, doc.url, doc.label));
      if (docRows.value.length === 0) docRows.value = [newRow()];
    }
  } catch (error) {
    blockMessage.value = error instanceof Error ? error.message : 'Could not load the page.';
  } finally {
    loading.value = false;
  }
});

function isHttpsLink(value: string): boolean {
  if (!value.startsWith('https://')) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function validate(): string {
  if (description.value.trim().length < 5) {
    return 'Please describe the expense (at least 5 characters).';
  }

  const value = Number(amount.value);
  if (!Number.isFinite(value) || value <= 0) return 'Enter an amount greater than ₱0.';
  if (value > 10000000) return 'The amount cannot be more than ₱10,000,000.';

  if (!category.value) return 'Please choose a category.';
  if (!expenseDate.value) return 'Please choose the date of the expense.';
  if (expenseDate.value > today()) return 'The expense date cannot be in the future.';

  if (docRows.value.length === 0) return 'Add at least one supporting document link.';
  for (const row of docRows.value) {
    if (!isHttpsLink(row.url.trim())) {
      return 'Every document needs a valid link that starts with https://';
    }
  }
  return '';
}

async function handleSubmit() {
  errorMessage.value = validate();
  if (errorMessage.value) return;

  const user = currentUser.value;
  if (!user || !campaign.value) return;

  const form = {
    description: description.value,
    amount: Number(amount.value),
    category: category.value as ExpenseCategory,
    expenseDate: expenseDate.value,
    documents: docRows.value.map((row) => ({
      type: row.type,
      url: row.url,
      label: row.label,
    })),
  };

  saving.value = true;
  try {
    if (isEdit && existing.value) {
      await updateExpense(existing.value, form);
      await showToast('Changes saved. The expense was resubmitted for review.');
    } else {
      await createExpense(campaign.value, user, form);
      await showToast('Expense submitted for review.');
    }
    router.replace(`/organizer/campaigns/${campaignId}/expenses`);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not save the expense.';
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

.summary {
  margin: 0 0 8px;
}

.intro {
  margin: 0 0 16px;
  color: #52606d;
}

.field {
  margin-bottom: 14px;
}

h3 {
  margin: 20px 0 6px;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.notice {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff7e0;
  font-size: 0.85rem;
}

.doc-card {
  margin: 0 0 12px;
}

.error {
  margin: 12px 0;
  font-size: 0.9rem;
}

.submit {
  margin-top: 16px;
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