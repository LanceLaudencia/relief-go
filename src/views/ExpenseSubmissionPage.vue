<template>
  <ion-page>
    <ion-header class="rg-header">
      <ion-toolbar class="rg-toolbar">
        <div class="nav-inner">
          <router-link :to="`/organizer/campaigns/${campaignId}/expenses`" class="brand">Relief<span>GO</span><sup>♥</sup></router-link>
          <router-link :to="`/organizer/campaigns/${campaignId}/expenses`" class="back-link"><ion-icon :icon="arrowBackOutline" /> BACK TO EXPENSES</router-link>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rg-content">
      <main class="page-wrapper">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">RELIEFGO · ORGANIZER WORKSPACE</p>
            <h1>{{ isEdit ? 'Edit' : 'Add' }} <em>Expense.</em></h1>
            <p>{{ isEdit ? 'Update your expense details and resubmit them for review.' : 'Document how campaign funds are used and help your community see the impact.' }}</p>
          </div>
          <div class="identity"><div class="avatar">{{ initials }}</div><div><span class="identity-label">CAMPAIGN ORGANIZER</span><strong>{{ organizerName }}</strong><small>Financial transparency</small></div></div>
        </section>

        <div v-if="loading" class="state-box"><ion-spinner name="crescent" /><p>Loading expense form...</p></div>
        <div v-else-if="blockMessage" class="state-box">
          <ion-icon :icon="alertCircleOutline" class="state-icon" />
          <h3>Unable to continue</h3><p>{{ blockMessage }}</p>
          <ion-button class="primary-action" :router-link="`/organizer/campaigns/${campaignId}/expenses`">Back to expenses</ion-button>
        </div>

        <div v-else class="form-layout">
          <section class="form-main">
            <div class="campaign-summary"><span class="eyebrow dark">EXPENSE FOR CAMPAIGN</span><h2>{{ campaign?.title }}</h2><p><ion-icon :icon="shieldCheckmarkOutline" /> An administrator reviews every expense before it appears in the public transparency report.</p></div>

            <div class="form-card">
              <div class="form-section-title"><span class="section-number">01</span><div><h2>Expense <em>details.</em></h2><p>Tell us what was purchased, how much was spent, and when.</p></div></div>
              <div class="field-group">
                <label class="field-label">What was bought or paid for?</label>
                <ion-textarea v-model="description" fill="outline" :auto-grow="true" :rows="3" :maxlength="1000" placeholder="Describe the purchase or payment..." class="field"></ion-textarea>
              </div>
              <div class="field-grid">
                <div class="field-group"><label class="field-label">Amount spent (₱)</label><ion-input v-model="amount" type="number" inputmode="decimal" fill="outline" placeholder="0.00" class="field"></ion-input></div>
                <div class="field-group"><label class="field-label">Category</label><ion-select v-model="category" fill="outline" interface="popover" placeholder="Choose category" class="field"><ion-select-option v-for="item in EXPENSE_CATEGORIES" :key="item" :value="item">{{ item }}</ion-select-option></ion-select></div>
              </div>
              <div class="field-group"><label class="field-label">Date of expense</label><ion-input v-model="expenseDate" type="date" :max="today()" fill="outline" class="field"></ion-input></div>
            </div>

            <div class="form-card">
              <div class="form-section-title"><span class="section-number">02</span><div><h2>Supporting <em>documents.</em></h2><p>Provide links to receipts, invoices, or purchase photos.</p></div></div>
              <div class="notice"><ion-icon :icon="informationCircleOutline" /><p>Upload each receipt, invoice, photo of goods, or acknowledgment receipt to Google Drive (or a similar site), set sharing to <strong>“Anyone with the link can view”</strong>, and paste the link below. These links become <strong>public</strong> once an administrator verifies the expense. Hide or cover personal details first, such as ID numbers, home addresses, and card or account numbers.</p></div>

              <div v-for="(row, index) in docRows" :key="row.key" class="doc-card">
                <div class="doc-heading"><span><ion-icon :icon="documentTextOutline" /> Document {{ index + 1 }}</span><ion-button v-if="docRows.length > 1" fill="clear" class="remove-button" @click="removeRow(index)"><ion-icon slot="start" :icon="trashOutline" /> Remove</ion-button></div>
                <div class="field-group"><label class="field-label">Document type</label><ion-select v-model="row.type" fill="outline" interface="popover" class="field"><ion-select-option v-for="type in DOCUMENT_TYPES" :key="type" :value="type">{{ type }}</ion-select-option></ion-select></div>
                <div class="field-group"><label class="field-label">Document link (https://)</label><ion-input v-model="row.url" type="url" fill="outline" placeholder="https://drive.google.com/..." :maxlength="1000" class="field"></ion-input></div>
                <div class="field-group"><label class="field-label">Short note (optional)</label><ion-input v-model="row.label" fill="outline" placeholder="e.g. Grocery receipt" :maxlength="100" class="field"></ion-input></div>
              </div>
              <ion-button class="add-doc" fill="outline" :disabled="docRows.length >= MAX_DOCUMENTS" @click="addRow"><ion-icon slot="start" :icon="addOutline" /> Add another document</ion-button>
              <p class="doc-limit">{{ docRows.length }} of {{ MAX_DOCUMENTS }} document links</p>
            </div>

            <div v-if="errorMessage" class="error" role="alert"><ion-icon :icon="alertCircleOutline" /> {{ errorMessage }}</div>
            <div class="submit-row">
              <router-link :to="`/organizer/campaigns/${campaignId}/expenses`" class="cancel-link">Cancel</router-link>
              <ion-button class="primary-action submit" :disabled="saving" @click="handleSubmit"><ion-spinner v-if="saving" name="crescent" /><template v-else>{{ isEdit ? 'Save and resubmit for review' : 'Submit for review' }}<ion-icon slot="end" :icon="arrowForwardOutline" /></template></ion-button>
            </div>
          </section>
          <aside class="help-card"><div class="help-icon"><ion-icon :icon="receiptOutline" /></div><p class="eyebrow dark">BEFORE YOU SUBMIT</p><h3>Transparency builds trust.</h3><p>Make sure the amount and description match your supporting documents. Your links may be viewed publicly after verification.</p><div class="help-divider"></div><p><ion-icon :icon="shieldCheckmarkOutline" /> Every submission is reviewed by an administrator.</p></aside>
        </div>
      </main>
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
import { addOutline, alertCircleOutline, arrowBackOutline, documentTextOutline, shieldCheckmarkOutline, trashOutline, receiptOutline, informationCircleOutline, arrowForwardOutline } from 'ionicons/icons';
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

const organizerName = computed(() => currentUser.value?.displayName || 'Organizer');
const initials = computed(() => organizerName.value.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() || '').join('') || 'O');

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
  if (!user) {
    blockMessage.value = 'Please sign in to manage campaign expenses.';
    loading.value = false;
    return;
  }

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
:host{--rg-cream:#f8f3e4;--rg-green:#183c2c;--rg-border:#e9ddc7}
.rg-header{box-shadow:none}.rg-toolbar{--background:#fffaf0;--min-height:75px;--border-width:0;--padding-start:0;--padding-end:0}
.nav-inner{max-width:1190px;margin:auto;padding:0 25px;display:flex;align-items:center;justify-content:space-between;gap:15px;min-height:75px}
.brand{text-decoration:none;color:#173c2b;font:700 29px Georgia,serif;letter-spacing:-1.4px}.brand span{color:#c66b46}.brand sup{font:15px Arial,sans-serif;color:#c66b46;margin-left:4px;vertical-align:top}
.back-link{display:inline-flex;align-items:center;gap:9px;text-decoration:none;color:#173c2b;font:800 11px 'DM Sans',Arial,sans-serif;letter-spacing:1px}.back-link ion-icon{font-size:17px}
.rg-content{--background:#f8f3e4}.page-wrapper{max-width:1190px;margin:auto;padding:29px 25px 85px;font-family:'DM Sans','Avenir Next','Segoe UI',Arial,sans-serif;color:#173c2b}
.hero{background:linear-gradient(120deg,#102c20,#1d5039);color:#fff8e7;border-radius:22px;padding:47px 49px;display:flex;align-items:center;justify-content:space-between;gap:30px;position:relative;overflow:hidden}.hero:after{content:'✳';position:absolute;right:24%;bottom:-80px;font-size:280px;color:#ffffff08;pointer-events:none}.hero-copy{position:relative;z-index:1;max-width:590px}.eyebrow{font-size:10px;font-weight:900;letter-spacing:2px;color:#e8ae4c;margin:0 0 16px}.eyebrow.dark{color:#bd7650}.hero h1{font:normal clamp(35px,4.7vw,60px)/1.05 Georgia,serif;letter-spacing:-1.5px;margin:0 0 17px}.hero h1 em,.form-section-title h2 em{color:#e8ae4c;font-weight:normal}.hero-copy>p:last-child{font-size:14px;line-height:1.8;color:#e6e8db;margin:0}.identity{display:flex;align-items:center;gap:13px;position:relative;z-index:1;min-width:220px}.avatar{width:55px;height:55px;border-radius:50%;background:#e8ae4c;color:#173c2b;display:grid;place-items:center;font:700 20px Georgia,serif;flex:none}.identity>div:last-child{display:flex;flex-direction:column;gap:5px}.identity-label{font-size:9px;letter-spacing:1.2px;color:#e8ae4c;font-weight:800}.identity strong{font-size:13px;color:#fff8e7}.identity small{font-size:11px;color:#c6d4c9}
.form-layout{display:grid;grid-template-columns:minmax(0,1fr) 275px;align-items:start;gap:24px;margin-top:27px}.form-main{min-width:0}.campaign-summary,.form-card,.help-card{background:#fffaf0;border:1px solid #e9ddc7;border-radius:19px;box-shadow:0 8px 25px #203b2410}.campaign-summary{padding:26px 30px;margin-bottom:20px}.campaign-summary h2{font:normal 30px/1.2 Georgia,serif;margin:0 0 12px;overflow-wrap:anywhere}.campaign-summary>p{display:flex;align-items:flex-start;gap:8px;color:#687568;font-size:12px;line-height:1.65;margin:0}.campaign-summary ion-icon{font-size:18px;flex:none;color:#b76e49}.form-card{padding:29px 30px;margin-bottom:20px}.form-section-title{display:flex;align-items:center;gap:13px;margin-bottom:24px}.section-number{display:grid;place-items:center;flex:none;width:43px;height:43px;border-radius:12px;background:#183c2c;color:#e8ae4c;font:700 15px Georgia,serif}.form-section-title h2{font:normal 29px Georgia,serif;margin:0 0 6px}.form-section-title p{color:#788078;font-size:12px;line-height:1.5;margin:0}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.field-group{margin-bottom:19px;min-width:0}.field-label{display:block;color:#244432;font-weight:800;font-size:12px;margin-bottom:9px}.field{--background:#fffdf8;--color:#183c2c;--border-color:#dfd6c4;--border-radius:10px;--highlight-color-focused:#bd7650;--padding-start:14px;--padding-end:14px;min-height:52px;font-size:14px}.field-group ion-textarea{min-height:110px}.notice{display:flex;gap:11px;padding:17px 18px;border-radius:12px;background:#fff2d8;color:#775c35;font-size:12px;line-height:1.7;margin-bottom:21px}.notice ion-icon{font-size:22px;flex:none;color:#ba7c36}.notice p{margin:0}.doc-card{padding:20px;background:#f8f3e9;border:1px solid #e8dcc6;border-radius:14px;margin-bottom:15px}.doc-card .field-group:last-child{margin-bottom:0}.doc-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:17px}.doc-heading>span{display:flex;align-items:center;gap:8px;color:#214c35;font-weight:800;font-size:13px}.doc-heading ion-icon{font-size:18px}.remove-button{--color:#ad4f40;font-size:11px;text-transform:none;margin:0}.add-doc{--border-color:#1b4b35;--color:#1b4b35;--border-radius:10px;min-height:41px;text-transform:none;font-weight:800;font-size:12px;margin:2px 0}.doc-limit{font-size:11px;color:#85877a;margin:9px 0 0}.submit-row{display:flex;align-items:center;justify-content:flex-end;gap:20px;padding:4px 0 20px}.cancel-link{font-size:13px;color:#657365;text-decoration:none;font-weight:800}.primary-action{--background:#183c2c;--background-hover:#27543c;--color:#fffaf0;--border-radius:10px;min-height:46px;font-size:12px;font-weight:800;text-transform:none;letter-spacing:0;margin:0}.submit{min-width:235px}.error{display:flex;gap:9px;align-items:flex-start;padding:14px;border-radius:11px;background:#ffebe4;color:#a34032;font-size:13px;line-height:1.5;margin-bottom:17px}.error ion-icon{font-size:18px;flex:none}.help-card{padding:27px 23px;position:sticky;top:20px}.help-icon{display:grid;place-items:center;width:53px;height:53px;background:#f5e6c8;color:#a96842;border-radius:14px;font-size:26px;margin-bottom:22px}.help-card h3{font:normal 28px/1.2 Georgia,serif;margin:0 0 13px}.help-card>p{font-size:12px;color:#69766a;line-height:1.75}.help-divider{height:1px;background:#e9ddc7;margin:20px 0}.help-card>p:last-child{display:flex;align-items:flex-start;gap:9px;color:#2e5d3e}.help-card>p:last-child ion-icon{font-size:19px;flex:none}.state-box{margin-top:25px;text-align:center;padding:65px 25px;background:#fffaf0;border:1px solid #e9ddc7;border-radius:19px;color:#69766a}.state-box h3{font:normal 30px Georgia,serif;color:#173c2b;margin:12px 0}.state-box p{font-size:13px;line-height:1.6}.state-icon{font-size:47px;color:#c66b46}.state-box ion-button{margin-top:15px}
@media(max-width:940px){.form-layout{grid-template-columns:1fr}.help-card{position:static}.hero{padding:38px 32px}.identity{min-width:0}}
@media(max-width:650px){.page-wrapper{padding:17px 15px 55px}.nav-inner{padding:0 16px;min-height:65px}.rg-toolbar{--min-height:65px}.brand{font-size:25px}.back-link{font-size:9px;letter-spacing:.3px}.hero{padding:33px 24px;flex-direction:column;align-items:flex-start;gap:27px}.hero h1{font-size:42px}.identity{width:100%}.form-layout{gap:17px;margin-top:18px}.form-card,.campaign-summary{padding:22px 17px}.field-grid{grid-template-columns:1fr;gap:0}.form-section-title h2{font-size:25px}.submit-row{flex-direction:column-reverse;align-items:stretch;gap:18px}.submit{width:100%}.cancel-link{text-align:center}.help-card{padding:23px 19px}}
</style>