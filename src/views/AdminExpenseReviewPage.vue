<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin"></ion-back-button>
        </ion-buttons>
        <ion-title>Expense Review</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="page-wrapper">
        <ion-segment v-model="segment">
          <ion-segment-button value="pending">
            <ion-label>Pending ({{ pending.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="verified">
            <ion-label>Verified ({{ verified.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="rejected">
            <ion-label>Rejected ({{ rejected.length }})</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div v-if="loading" class="state-box">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Loading expenses...</p>
        </div>

        <div v-else-if="errorMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
          <h3>Something went wrong</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="visibleExpenses.length === 0" class="state-box">
          <ion-icon :icon="checkmarkDoneOutline" class="state-icon"></ion-icon>
          <h3>Nothing here</h3>
          <p>There are no expenses in this list.</p>
        </div>

        <ion-card v-for="expense in visibleExpenses" v-else :key="expense.id">
          <ion-card-header>
            <ion-chip :color="expenseStatusColor(expense.status)">{{ expense.status }}</ion-chip>
            <ion-card-title>{{ formatPeso(expense.amount) }}</ion-card-title>
            <ion-card-subtitle>{{ expense.campaignTitle }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <p><strong>Category:</strong> {{ expense.category }}</p>
            <p><strong>Expense date:</strong> {{ formatDate(expense.expenseDate) }}</p>
            <p><strong>Submitted by:</strong> {{ expense.organizerName }}</p>
            <p><strong>Description:</strong></p>
            <p class="description">{{ expense.description }}</p>

            <p><strong>Documents (open each link to check it):</strong></p>
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

            <p v-if="expense.rejectionReason" class="reason">
              <strong>Reason:</strong> {{ expense.rejectionReason }}
            </p>

            <div class="actions">
              <template v-if="expense.status === 'Pending Review'">
                <ion-button
                  size="small"
                  :disabled="busyId === expense.id"
                  @click="handleVerify(expense)"
                >
                  Verify
                </ion-button>
                <ion-button
                  size="small"
                  color="danger"
                  fill="outline"
                  :disabled="busyId === expense.id"
                  @click="handleReject(expense)"
                >
                  Reject
                </ion-button>
              </template>

              <template v-if="expense.status === 'Verified'">
                <ion-button
                  size="small"
                  fill="outline"
                  :router-link="`/campaigns/${expense.campaignId}/transparency`"
                >
                  View public report
                </ion-button>
                <ion-button
                  size="small"
                  color="danger"
                  fill="outline"
                  :disabled="busyId === expense.id"
                  @click="handleRevoke(expense)"
                >
                  Revoke
                </ion-button>
              </template>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
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
import { alertCircleOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getAllExpenses, rejectExpense, verifyExpense } from '../services/expenseService';
import type { Expense } from '../models/Expense';
import { formatDate, formatPeso } from '../utils/format';
import { askReason, confirmAction, expenseStatusColor, showToast } from '../utils/ui';

const expenses = ref<Expense[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const segment = ref<string>('pending');
const busyId = ref('');

const pending = computed(() => expenses.value.filter((e) => e.status === 'Pending Review'));
const verified = computed(() => expenses.value.filter((e) => e.status === 'Verified'));
const rejected = computed(() => expenses.value.filter((e) => e.status === 'Rejected'));

const visibleExpenses = computed(() => {
  if (segment.value === 'verified') return verified.value;
  if (segment.value === 'rejected') return rejected.value;
  return pending.value;
});

async function loadExpenses() {
  errorMessage.value = '';
  try {
    expenses.value = await getAllExpenses();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load expenses.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(async () => {
  if (expenses.value.length === 0) loading.value = true;
  await loadExpenses();
});

/** Runs an admin action, then refreshes the list and shows a message. */
async function runAction(expense: Expense, action: () => Promise<void>, successMessage: string) {
  busyId.value = expense.id;
  try {
    await action();
    await loadExpenses();
    await showToast(successMessage);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Action failed.', 'danger');
    await loadExpenses();
  } finally {
    busyId.value = '';
  }
}

async function handleVerify(expense: Expense) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;

  const ok = await confirmAction(
    'Verify expense',
    `Verify ${formatPeso(expense.amount)}? Before you do, open every document link and check that it matches the amount and description, and that it does not show private details such as ID numbers, home addresses, or card or account numbers. Once verified, the links become public.`,
    'Verify'
  );
  if (!ok) return;

  await runAction(
    expense,
    () => verifyExpense(expense, adminUid),
    'Expense verified and added to the public report.'
  );
}

async function handleReject(expense: Expense) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;

  const reason = await askReason(
    'Reject expense',
    'Why is this expense being rejected? The organizer will see this reason.',
    'Reject'
  );
  if (!reason) return;

  await runAction(expense, () => rejectExpense(expense, adminUid, reason), 'Expense rejected.');
}

async function handleRevoke(expense: Expense) {
  const adminUid = currentUser.value?.uid;
  if (!adminUid) return;

  const reason = await askReason(
    'Revoke verified expense',
    'It will be removed from the public report and sent back to the organizer as rejected. Why is it being revoked?',
    'Revoke'
  );
  if (!reason) return;

  await runAction(
    expense,
    () => rejectExpense(expense, adminUid, reason),
    'Expense revoked and removed from the public report.'
  );
}
</script>

<style scoped>
.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

ion-segment {
  margin-bottom: 8px;
}

ion-card {
  margin: 16px 0 0;
}

ion-card-content p {
  margin: 4px 0;
}

.description {
  white-space: pre-line;
  color: #52606d;
}

.docs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 6px 0;
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

.reason {
  color: #b42318;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
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