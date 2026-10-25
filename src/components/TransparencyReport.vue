<template>
  <div class="transparency-report">
    <ion-card v-if="summary.expensesExceedDonations" class="warning-card">
      <ion-card-content>
        <div class="warning-title">
          <ion-icon :icon="warningOutline"></ion-icon>
          <strong>Documented expenses are higher than verified donations</strong>
        </div>
        <p>
          Approved expenses ({{ formatPeso(summary.approvedExpenses) }}) are more than verified
          donations ({{ formatPeso(summary.verifiedDonations) }}). Some expenses may have been paid
          from other funds, or some donations may not be verified yet. Please ask the organizer for
          details.
        </p>
      </ion-card-content>
    </ion-card>

    <ion-card>
      <ion-card-header>
        <ion-card-title>Funds summary</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div class="row">
          <span>Fundraising goal</span>
          <strong>{{ formatPeso(summary.goalAmount) }}</strong>
        </div>
        <div class="row">
          <span>Verified donations</span>
          <strong>{{ formatPeso(summary.verifiedDonations) }}</strong>
        </div>
        <div class="row">
          <span>Approved documented expenses</span>
          <strong>{{ formatPeso(summary.approvedExpenses) }}</strong>
        </div>
        <div class="row total" :class="{ negative: summary.remainingFunds < 0 }">
          <span>Remaining documented funds</span>
          <strong>{{ formatPeso(summary.remainingFunds) }}</strong>
        </div>
        <p class="formula">
          Remaining documented funds = verified donations − approved documented expenses
        </p>
      </ion-card-content>
    </ion-card>

    <ion-card>
      <ion-card-header>
        <ion-card-title>Expense breakdown</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p v-if="summary.breakdown.length === 0" class="muted">
          No verified expenses have been published yet.
        </p>
        <div v-for="item in summary.breakdown" :key="item.category" class="breakdown">
          <div class="row">
            <span>{{ item.category }}</span>
            <strong>{{ formatPeso(item.total) }} ({{ item.percent }}%)</strong>
          </div>
          <ion-progress-bar :value="item.percent / 100"></ion-progress-bar>
        </div>
      </ion-card-content>
    </ion-card>

    <h3>Verified expenses and proof</h3>
    <p class="muted notice">
      Only expenses that an administrator has reviewed and verified appear here. Pending and
      rejected expenses are not counted.
    </p>

    <div v-if="expenses.length === 0" class="empty">
      <ion-icon :icon="receiptOutline" class="empty-icon"></ion-icon>
      <p>No verified expenses yet.</p>
    </div>

    <ion-card v-for="expense in expenses" v-else :key="expense.id">
      <ion-card-header>
        <ion-chip color="success">Verified</ion-chip>
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
            <ion-icon :icon="documentTextOutline"></ion-icon>
            {{ doc.type }}<span v-if="doc.label">: {{ doc.label }}</span>
          </a>
        </div>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonIcon,
  IonProgressBar,
} from '@ionic/vue';
import { documentTextOutline, receiptOutline, warningOutline } from 'ionicons/icons';
import type { PublicExpense } from '../models/Expense';
import type { TransparencySummary } from '../services/transparencyService';
import { formatDate, formatPeso } from '../utils/format';

defineProps<{
  summary: TransparencySummary;
  expenses: PublicExpense[];
}>();
</script>

<style scoped>
ion-card {
  margin: 12px 0;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7eb;
}

.row.total {
  border-bottom: none;
  margin-top: 4px;
  font-size: 1.05rem;
  color: var(--ion-color-primary);
}

.row.total.negative {
  color: #b42318;
}

.formula {
  margin: 8px 0 0;
  font-size: 0.8rem;
  color: #7b8794;
}

.warning-card {
  background: #fff4e5;
  border: 1px solid #f5b971;
}

.warning-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b25e09;
}

.warning-card p {
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: #1f2933;
}

.breakdown {
  margin-bottom: 10px;
}

.breakdown .row {
  border-bottom: none;
  padding: 4px 0;
}

h3 {
  margin: 24px 0 4px;
  font-weight: 700;
}

.muted {
  color: #7b8794;
}

.notice {
  margin: 0 0 8px;
  font-size: 0.85rem;
}

.empty {
  text-align: center;
  padding: 24px 16px;
  color: #7b8794;
}

.empty-icon {
  font-size: 40px;
  color: var(--ion-color-secondary);
}

.description {
  margin: 0 0 10px;
  white-space: pre-line;
}

.docs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.doc-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--rg-green-soft);
  color: var(--ion-color-primary);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}
</style>