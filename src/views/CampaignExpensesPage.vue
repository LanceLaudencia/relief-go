<template>
  <ion-page>
    <ion-header class="rg-header">
      <ion-toolbar class="rg-toolbar">
        <div class="nav-inner">
          <router-link to="/organizer/campaigns" class="brand">Relief<span>GO</span><sup>♥</sup></router-link>
          <router-link to="/organizer/campaigns" class="back-link"><ion-icon :icon="arrowBackOutline" /> BACK TO MY CAMPAIGNS</router-link>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rg-content">
      <main class="page-wrapper">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">RELIEFGO · ORGANIZER WORKSPACE</p>
            <h1>Campaign <em>Expenses.</em></h1>
            <p>Keep track of every expense, submit supporting receipts, and share a transparent story of how donations are used.</p>
          </div>
          <div class="identity">
            <div class="avatar">{{ initials }}</div>
            <div><span class="identity-label">CAMPAIGN ORGANIZER</span><strong>{{ organizerName }}</strong><small>Expense tracking</small></div>
          </div>
        </section>

        <div v-if="loading" class="state-box top-state"><ion-spinner name="crescent" /><p>Loading expenses...</p></div>
        <div v-else-if="errorMessage || !campaign" class="state-box top-state">
          <ion-icon :icon="alertCircleOutline" class="state-icon" />
          <h3>Something went wrong</h3>
          <p>{{ errorMessage || 'Campaign not found.' }}</p>
        </div>

        <template v-else>
          <section class="campaign-overview">
            <div><p class="eyebrow dark">CURRENT CAMPAIGN</p><h2>{{ campaign.title }}</h2><p>Manage expense records and their review status.</p></div>
            <span class="campaign-tag">{{ campaign.status }}</span>
          </section>

          <section class="stat-grid" aria-label="Expense totals">
            <div class="stat"><ion-icon :icon="checkmarkCircleOutline" /><span>VERIFIED · PUBLIC</span><strong>{{ formatPeso(verifiedTotal) }}</strong><small>Shown in transparency report</small></div>
            <div class="stat"><ion-icon :icon="timeOutline" /><span>PENDING REVIEW</span><strong>{{ formatPeso(pendingTotal) }}</strong><small>Awaiting administrator review</small></div>
            <div class="stat"><ion-icon :icon="closeCircleOutline" /><span>REJECTED RECORDS</span><strong>{{ rejectedCount }}</strong><small>Can be edited and resubmitted</small></div>
          </section>

          <section class="action-panel">
            <div><p class="eyebrow dark">MANAGE YOUR RECORDS</p><h3>Every peso, accounted for.</h3><p>Add an expense with supporting documents, or view your public transparency report.</p></div>
            <div class="action-buttons">
              <ion-button class="primary-action" :disabled="!canAdd" :router-link="`/organizer/campaigns/${campaign.id}/expenses/new`">
                <ion-icon slot="start" :icon="addOutline" /> Add Expense
              </ion-button>
              <ion-button class="outline-action" fill="outline" :disabled="!isPublic" :router-link="`/campaigns/${campaign.id}/transparency`">
                View public transparency report <ion-icon slot="end" :icon="arrowForwardOutline" />
              </ion-button>
            </div>
          </section>
          <p v-if="!canAdd" class="hint">Expenses can be added after your campaign is approved.</p>

          <section class="list-section">
            <div class="section-heading"><div><p class="eyebrow dark">YOUR FINANCIAL RECORDS</p><h2>Expense <em>history.</em></h2><p>{{ expenses.length }} expense record{{ expenses.length === 1 ? '' : 's' }} for this campaign.</p></div></div>

            <div v-if="expenses.length === 0" class="state-box">
              <div class="empty-icon"><ion-icon :icon="receiptOutline" /></div>
              <p class="eyebrow dark">START WITH YOUR FIRST RECORD</p>
              <h3>No expenses yet.</h3>
              <p>Record each purchase or payment, with links to receipts or photos.</p>
            </div>

            <div v-else class="expense-grid">
              <article v-for="expense in expenses" :key="expense.id" class="expense-card">
                <div class="card-top">
                  <div><span class="mini-label">CAMPAIGN EXPENSE</span><h3>{{ formatPeso(expense.amount) }}</h3><p>{{ expense.category }} · {{ formatDate(expense.expenseDate) }}</p></div>
                  <ion-chip :color="expenseStatusColor(expense.status)">{{ expense.status }}</ion-chip>
                </div>
                <div class="description"><b>Expense description</b><p>{{ expense.description }}</p></div>
                <div v-if="expense.documents.length" class="description">
                  <b>Supporting documents</b>
                  <div class="docs">
                    <a v-for="(doc, index) in expense.documents" :key="index" class="doc-link" :href="doc.url" target="_blank" rel="noopener noreferrer">
                      <ion-icon :icon="documentTextOutline" />
                      {{ doc.type }}<span v-if="doc.label">: {{ doc.label }}</span>
                      <ion-icon :icon="openOutline" />
                    </a>
                  </div>
                </div>
                <p v-if="expense.status === 'Pending Review'" class="review-note pending-note"><ion-icon :icon="timeOutline" /> Waiting for administrator review. Not yet shown to the public.</p>
                <p v-if="expense.status === 'Verified'" class="review-note good-note"><ion-icon :icon="checkmarkCircleOutline" /> Verified and shown on the public transparency report.</p>
                <p v-if="expense.status === 'Rejected'" class="review-note bad-note"><ion-icon :icon="closeCircleOutline" /><span><b>Rejected:</b> {{ expense.rejectionReason || 'No reason given.' }} You can edit the expense and submit it again.</span></p>
                <div v-if="canEdit(expense)" class="actions">
                  <ion-button class="primary-action" :router-link="`/organizer/campaigns/${campaign.id}/expenses/${expense.id}/edit`">
                    {{ expense.status === 'Rejected' ? 'Edit and resubmit' : 'Edit expense' }}
                    <ion-icon slot="end" :icon="arrowForwardOutline" />
                  </ion-button>
                </div>
              </article>
            </div>
          </section>
        </template>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonChip, IonSpinner,
  IonIcon, onIonViewWillEnter,
} from '@ionic/vue';
import {
  addOutline, alertCircleOutline, receiptOutline, arrowBackOutline,
  arrowForwardOutline, checkmarkCircleOutline, timeOutline, closeCircleOutline,
  documentTextOutline, openOutline,
} from 'ionicons/icons';
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
const campaignId = String(route.params.id);

const campaign = ref<Campaign | null>(null);
const expenses = ref<Expense[]>([]);
const loading = ref(true);
const errorMessage = ref('');

const organizerName = computed(() => currentUser.value?.displayName || 'Organizer');
const initials = computed(() => organizerName.value.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() || '').join('') || 'O');

const canAdd = computed(
  () => campaign.value !== null && EXPENSE_ALLOWED_CAMPAIGN_STATUSES.includes(campaign.value.status)
);
const isPublic = computed(
  () => campaign.value !== null && PUBLIC_STATUSES.includes(campaign.value.status)
);
const canEdit = (expense: Expense) =>
  expense.status === 'Pending Review' || expense.status === 'Rejected';
const verifiedTotal = computed(() =>
  expenses.value.filter(e => e.status === 'Verified').reduce((sum, e) => sum + e.amount, 0)
);
const pendingTotal = computed(() =>
  expenses.value.filter(e => e.status === 'Pending Review').reduce((sum, e) => sum + e.amount, 0)
);
const rejectedCount = computed(() => expenses.value.filter(e => e.status === 'Rejected').length);

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  if (!user) {
    loading.value = false;
    errorMessage.value = 'Please sign in to view campaign expenses.';
    return;
  }
  if (!campaign.value) loading.value = true;
  errorMessage.value = '';
  try {
    const record = await getCampaignRecord(campaignId);
    if (!record || record.organizerId !== user.uid) {
      campaign.value = null;
      expenses.value = [];
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
.rg-header{box-shadow:none}.rg-toolbar{--background:#f8f3e4;--color:#143b2b;--min-height:74px;--border-color:#e6dcc6}
.nav-inner{width:min(1480px,calc(100% - 48px));margin:auto;display:flex;align-items:center;justify-content:space-between;min-height:74px;gap:16px}
.brand{font-family:Georgia,serif;font-size:36px;font-weight:bold;color:#123b2a;text-decoration:none;letter-spacing:-1.7px}.brand span{color:#c66b46}.brand sup{font:13px Georgia,serif;color:#c66b46;vertical-align:top}
.back-link{display:flex;align-items:center;gap:8px;color:#123b2a;font-size:11px;font-weight:800;letter-spacing:1px;text-decoration:none;white-space:nowrap}
.rg-content{--background:#f8f3e4;color:#16382a;font-family:'DM Sans','Avenir Next','Segoe UI',Arial,sans-serif}
.page-wrapper{width:min(1460px,calc(100% - 48px));margin:0 auto;padding:24px 0 70px}
.hero{background:radial-gradient(circle at 75% 130%,#38533a 0,transparent 38%),linear-gradient(115deg,#193e2e,#102a20);color:#fff8e7;border-radius:23px;padding:46px 58px;display:flex;align-items:center;justify-content:space-between;gap:30px}
.hero-copy{max-width:700px}.eyebrow,.mini-label{color:#f0b44e;letter-spacing:2px;font-size:11px;font-weight:900;margin:0 0 15px}
.hero h1{font:normal clamp(37px,4.3vw,65px)/1.06 Georgia,serif;letter-spacing:-1.6px;margin:0 0 15px;color:#fff9eb}.hero h1 em{color:#e8ae4c;font-weight:normal}.hero-copy>p:last-child{font-size:14px;line-height:1.7;max-width:640px;margin:0;color:#e7ebdc}
.identity{display:flex;align-items:center;gap:16px;min-width:300px;max-width:400px;padding:19px;border:1px solid #ffffff35;background:#ffffff0e;border-radius:18px}.avatar{flex:none;width:65px;height:65px;border-radius:50%;background:#e8ae4c;color:#153729;display:grid;place-items:center;font:30px Georgia,serif}.identity-label{display:block;color:#f0b44e;font-size:10px;font-weight:900;letter-spacing:1.7px;margin-bottom:6px}.identity strong{display:block;color:#fff8e7;font:25px Georgia,serif;overflow-wrap:anywhere}.identity small{display:block;color:#e7e9da;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:20px 0 34px}.stat{min-width:0;background:#fffaf0;border:1px solid #e9dcc3;border-radius:18px;padding:22px 25px;display:flex;flex-direction:column;align-items:flex-start}.stat ion-icon{color:#c66b46;font-size:23px;margin-bottom:17px}.stat span{color:#c66b46;font-size:10px;font-weight:900;letter-spacing:1.6px}.stat strong{font:38px Georgia,serif;color:#173e2d;margin:8px 0 2px}.stat small{color:#788078;font-size:12px}
.section-heading{margin:0 0 22px}.eyebrow.dark{color:#c66b46;margin-bottom:8px}.section-heading h2{font:normal clamp(32px,3.4vw,49px) Georgia,serif;margin:0;color:#173e2d}.section-heading h2 em{color:#c66b46;font-weight:normal}.section-heading p:last-child{color:#6d796e;font-size:14px;margin:8px 0 0}
.status-tabs{--background:#efe6d2;background:#efe6d2;border-radius:14px;padding:5px;max-width:650px;margin:0 0 20px}.status-tabs ion-segment-button{--color:#315342;--color-checked:#153e2c;--indicator-color:#fffaf0;--border-radius:11px;font-weight:800;min-height:43px}
.notice{background:#fff4d9;border:1px solid #edd8a9;border-radius:14px;padding:18px 22px;margin:12px 0 20px;color:#705b2d;font-size:13px;line-height:1.7}
.expense-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.expense-card{min-width:0;border:1px solid #e8dcc6;border-radius:20px;background:#fffaf0;padding:27px;box-shadow:0 8px 25px #253d2810}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.mini-label{display:block;color:#c66b46;margin-bottom:10px}.card-top h3{font:normal 28px/1.18 Georgia,serif;color:#183d2c;margin:0 0 8px;overflow-wrap:anywhere}.card-top p{font-size:13px;color:#7a8178;margin:0}.card-top ion-chip{flex:none;margin:0;text-transform:capitalize}
.amount-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:25px 0 13px}.amount-grid>div{background:#f6eedc;padding:15px;border-radius:12px;min-width:0}.amount-grid span{display:block;color:#a46448;font-size:10px;font-weight:900;letter-spacing:.9px}.amount-grid strong{display:block;font:25px Georgia,serif;color:#153b2a;margin-top:8px;overflow-wrap:anywhere}
.progress-track{height:8px;background:#e5e8d9;border-radius:20px;overflow:hidden}.progress-fill{height:100%;background:#d6a048;border-radius:20px}
.details{margin:22px 0 0}.details p{display:flex;gap:9px;align-items:flex-start;color:#626e64;font-size:13px;line-height:1.5;margin:11px 0}.details ion-icon{color:#c66b46;flex:none;font-size:17px}.details b,.description b{color:#1b4330}
.description{border-top:1px solid #ece2d1;margin-top:16px;padding-top:15px;font-size:13px;line-height:1.6}.description p{color:#69766b;white-space:pre-line;overflow-wrap:anywhere;margin:6px 0 0}
.reason{margin-top:16px;padding:14px;background:#fff0e9;border:1px solid #efc9b7;border-radius:12px;color:#a44530;font-size:13px;line-height:1.5}
.actions{display:flex;flex-wrap:wrap;gap:10px;border-top:1px solid #ece2d1;padding-top:18px;margin-top:20px}.actions ion-button{--border-radius:10px;font-size:11px;font-weight:800;letter-spacing:.2px;min-height:38px;margin:0;text-transform:none}.outline-action{--color:#173e2d;--border-color:#173e2d}.danger-action{--color:#b34d37;--border-color:#b34d37}.primary-action{--background:#173e2d;--color:#fffaf0}
.state-box{text-align:center;padding:68px 24px;background:#fffaf0;border:1px solid #e8dcc6;border-radius:20px;color:#68766c}.state-box h3{font:normal 33px Georgia,serif;color:#173e2d;margin:12px 0}.state-box p{font-size:14px}.state-icon{font-size:46px;color:#c66b46}.empty-icon{height:75px;width:75px;display:grid;place-items:center;margin:0 auto 15px;border-radius:50%;background:#f4e6c8;color:#c66b46;font-size:36px}
@media(max-width:900px){.hero{padding:34px;align-items:stretch;flex-direction:column}.identity{max-width:none;min-width:0}.expense-grid{grid-template-columns:1fr}}
@media(max-width:620px){.nav-inner{width:calc(100% - 30px)}.brand{font-size:29px}.back-link{font-size:9px;letter-spacing:.3px}.page-wrapper{width:calc(100% - 28px);padding-top:16px}.hero{padding:28px 22px;border-radius:18px}.hero h1{font-size:39px}.identity{padding:13px}.avatar{width:53px;height:53px;font-size:23px}.identity strong{font-size:20px}.stat-grid{gap:9px;margin:12px 0 28px}.stat{padding:14px 11px;border-radius:13px}.stat ion-icon{font-size:19px;margin-bottom:12px}.stat span{font-size:8px;letter-spacing:.5px}.stat strong{font-size:29px}.stat small{font-size:10px}.status-tabs ion-segment-button{font-size:11px}.expense-card{padding:19px}.card-top{flex-wrap:wrap}.amount-grid strong{font-size:20px}}

.expense-card .details{margin-top:23px}
.expense-card .details p{margin:14px 0;overflow-wrap:anywhere}
.expense-card .card-top h3{font-size:37px}
.expense-card .card-top p{line-height:1.5}
.notice.compact{margin:16px 0 0;padding:12px 15px}

.expense-card .details{margin-top:23px}
.expense-card .details p{margin:14px 0;overflow-wrap:anywhere}
.expense-card .card-top h3{font-size:37px}
.expense-card .card-top p{line-height:1.5}
.docs{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}
.doc-link{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:10px;background:#f1e7d4;color:#17412e;text-decoration:none;font-size:12px;font-weight:800;overflow-wrap:anywhere;max-width:100%}
.doc-link:hover{background:#e8d8ba}
.doc-link ion-icon{font-size:16px;flex:none}

.campaign-overview{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:30px 4px 5px}
.campaign-overview h2{font:normal clamp(27px,3vw,40px)/1.15 Georgia,serif;color:#183d2c;margin:0 0 9px;overflow-wrap:anywhere}
.campaign-overview p:last-child{font-size:13px;color:#778075;margin:0}
.campaign-tag{padding:9px 14px;border-radius:999px;background:#e7ecdd;color:#28583c;font-size:11px;font-weight:900;white-space:nowrap}
.campaign-overview+.stat-grid{margin-top:20px}
.campaign-overview+.stat-grid .stat strong{font-size:clamp(22px,2.5vw,35px);overflow-wrap:anywhere}
.action-panel{background:#fffaf0;border:1px solid #e8dcc6;border-radius:19px;padding:25px 29px;display:flex;justify-content:space-between;align-items:center;gap:24px;margin:0 0 30px}
.action-panel h3{font:normal 28px Georgia,serif;color:#173e2d;margin:0 0 7px}
.action-panel p:last-child{font-size:13px;color:#788078;line-height:1.5;margin:0}
.action-buttons{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}
.action-buttons ion-button{--border-radius:10px;min-height:42px;font-size:11px;font-weight:800;text-transform:none;margin:0}
.hint{color:#8b6c46;font-size:12px;margin:-19px 0 28px}
.top-state{margin-top:20px}
.review-note{display:flex;align-items:flex-start;gap:9px;padding:13px 15px;border-radius:12px;margin:17px 0 0;font-size:12px;line-height:1.6}
.review-note ion-icon{font-size:18px;flex:none;margin-top:1px}
.pending-note{background:#fff3d7;color:#83672f}
.good-note{background:#e6efe1;color:#315e40}
.bad-note{background:#ffebe4;color:#a34432}
@media(max-width:900px){.action-panel{flex-direction:column;align-items:stretch}.action-buttons{justify-content:flex-start}}
@media(max-width:620px){.campaign-overview{align-items:flex-start;flex-direction:column}.action-panel{padding:20px}.action-buttons{flex-direction:column;align-items:stretch}.action-buttons ion-button{width:100%}.campaign-overview+.stat-grid .stat strong{font-size:clamp(16px,4.1vw,25px)}}
</style>