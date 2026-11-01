<template>
  <ion-page>
    <ion-header class="rg-header">
      <ion-toolbar class="rg-toolbar">
        <div class="nav-inner">
          <router-link to="/admin" class="brand">Relief<span>GO</span><sup>♥</sup></router-link>
          <router-link to="/admin" class="back-link"><ion-icon :icon="arrowBackOutline" /> BACK TO DASHBOARD</router-link>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rg-content">
      <main class="page-wrapper">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">RELIEFGO · ADMINISTRATION</p>
            <h1>Audit <em>Logs.</em></h1>
            <p>Trace administrative activity and review the actions that keep our bayanihan community accountable.</p>
          </div>
          <div class="identity">
            <div class="avatar">{{ initials }}</div>
            <div><span class="identity-label">ADMINISTRATOR ACCOUNT</span><strong>{{ adminName }}</strong><small>Activity monitoring</small></div>
          </div>
        </section>

        <section class="stat-grid" aria-label="Audit log summary">
          <div class="stat"><ion-icon :icon="receiptOutline" /><span>RECORDED ACTIONS</span><strong>{{ logs.length }}</strong><small>Latest retrieved records</small></div>
          <div class="stat"><ion-icon :icon="filterOutline" /><span>MATCHING RESULTS</span><strong>{{ visibleLogs.length }}</strong><small>Current filters and search</small></div>
          <div class="stat"><ion-icon :icon="shieldCheckmarkOutline" /><span>LOG RETENTION</span><strong>200</strong><small>Latest actions shown</small></div>
        </section>

        <section class="list-section">
          <div class="section-heading">
            <div><p class="eyebrow dark">TRANSPARENT ADMINISTRATION</p><h2>Activity <em>history.</em></h2><p>Find actions by category, administrator, or description.</p></div>
          </div>

          <div class="filter-panel">
            <div class="tab-scroll">
              <ion-segment v-model="segment" class="status-tabs">
                <ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button>
                <ion-segment-button value="campaign"><ion-label>Campaigns</ion-label></ion-segment-button>
                <ion-segment-button value="donation"><ion-label>Donations</ion-label></ion-segment-button>
                <ion-segment-button value="expense"><ion-label>Expenses</ion-label></ion-segment-button>
                <ion-segment-button value="user"><ion-label>Users</ion-label></ion-segment-button>
              </ion-segment>
            </div>
            <div class="search-wrap">
              <ion-icon :icon="searchOutline" class="search-icon" />
              <ion-searchbar v-model="searchText" placeholder="Search actions, names, details" :debounce="200" class="audit-search"></ion-searchbar>
            </div>
            <p class="audit-note"><ion-icon :icon="informationCircleOutline" /> Showing the latest 200 actions. Entries cannot be edited or deleted.</p>
          </div>

          <div v-if="loading" class="state-box"><ion-spinner name="crescent" /><p>Loading logs...</p></div>
          <div v-else-if="errorMessage" class="state-box"><ion-icon :icon="alertCircleOutline" class="state-icon" /><h3>Something went wrong</h3><p>{{ errorMessage }}</p></div>
          <div v-else-if="visibleLogs.length === 0" class="state-box"><div class="empty-icon"><ion-icon :icon="documentTextOutline" /></div><p class="eyebrow dark">NO ACTIVITY FOUND</p><h3>No log entries.</h3><p>{{ logs.length ? 'Try another search or category.' : 'Admin actions will appear here.' }}</p></div>
          <div v-else class="log-list">
            <article v-for="log in visibleLogs" :key="log.id" class="log-card">
              <div class="log-symbol"><ion-icon :icon="iconFor(log.targetType)" /></div>
              <div class="log-main">
                <div class="log-heading">
                  <h3>{{ log.action }}</h3>
                  <span class="type-pill">{{ log.targetType }}</span>
                </div>
                <p class="log-details">{{ log.details }}</p>
                <div class="log-meta">
                  <span><ion-icon :icon="personOutline" /> {{ log.adminName }}</span>
                  <span><ion-icon :icon="timeOutline" /> {{ formatTime(log.createdAt) }}</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonSegment, IonSegmentButton,
  IonLabel, IonSearchbar, IonSpinner, IonIcon, onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline, documentTextOutline, arrowBackOutline, receiptOutline,
  filterOutline, shieldCheckmarkOutline, searchOutline, informationCircleOutline,
  personOutline, timeOutline, megaphoneOutline, heartOutline, walletOutline, peopleOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getAuditLogs } from '../services/auditService';
import type { AuditLog } from '../models/AuditLog';

const logs = ref<AuditLog[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const segment = ref<string>('all');
const searchText = ref('');

const adminName = computed(() => currentUser.value?.displayName || 'Administrator');
const initials = computed(() => adminName.value.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() || '').join('') || 'A');

const visibleLogs = computed(() => {
  const term = searchText.value.trim().toLowerCase();
  return logs.value.filter((log) => {
    const matchesType = segment.value === 'all' || log.targetType === segment.value;
    const matchesSearch =
      term === '' ||
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.adminName.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });
});

function iconFor(type: string): string {
  if (type === 'campaign') return megaphoneOutline;
  if (type === 'donation') return heartOutline;
  if (type === 'expense') return walletOutline;
  if (type === 'user') return peopleOutline;
  return documentTextOutline;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

onIonViewWillEnter(async () => {
  if (logs.value.length === 0) loading.value = true;
  errorMessage.value = '';
  try { logs.value = await getAuditLogs(); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Could not load the logs.'; }
  finally { loading.value = false; }
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

.filter-panel{background:#fffaf0;border:1px solid #e8dcc6;border-radius:19px;padding:20px;margin-bottom:20px}
.tab-scroll{overflow-x:auto;max-width:100%;padding-bottom:4px}
.filter-panel .status-tabs{max-width:none;min-width:520px;width:100%;margin-bottom:13px}
.search-wrap{position:relative}
.audit-search{--background:#f7f0e2;--color:#173e2d;--placeholder-color:#81887e;--icon-color:#c66b46;--clear-button-color:#173e2d;--border-radius:12px;padding:0}
.search-icon{display:none}
.audit-note{display:flex;align-items:center;gap:8px;color:#788078;font-size:12px;line-height:1.5;margin:10px 0 0}
.audit-note ion-icon{font-size:18px;color:#c66b46;flex:none}
.log-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
.log-card{min-width:0;display:flex;gap:15px;background:#fffaf0;border:1px solid #e8dcc6;border-radius:18px;padding:22px;box-shadow:0 7px 22px #253d2810}
.log-symbol{width:46px;height:46px;border-radius:13px;background:#f4e7cf;color:#bd6d46;display:grid;place-items:center;flex:none;font-size:23px}
.log-main{min-width:0;flex:1}
.log-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.log-heading h3{font:normal 23px/1.2 Georgia,serif;color:#173e2d;margin:0;overflow-wrap:anywhere}
.type-pill{background:#e9eedf;border:1px solid #d4dec9;border-radius:999px;padding:6px 10px;color:#315a3b;font-size:10px;font-weight:900;letter-spacing:.5px;text-transform:capitalize;flex:none}
.log-details{font-size:13px;color:#647165;line-height:1.65;white-space:pre-line;overflow-wrap:anywhere;margin:13px 0 19px}
.log-meta{display:flex;flex-wrap:wrap;gap:8px 18px;border-top:1px solid #e9e0d0;padding-top:13px;color:#7b837a;font-size:11px}
.log-meta span{display:inline-flex;align-items:center;gap:5px;overflow-wrap:anywhere}
.log-meta ion-icon{font-size:15px;color:#c66b46;flex:none}
@media(max-width:900px){.log-list{grid-template-columns:1fr}}
@media(max-width:620px){.filter-panel{padding:13px}.log-card{padding:16px;gap:11px}.log-symbol{width:39px;height:39px;font-size:19px}.log-heading h3{font-size:20px}.type-pill{font-size:9px;padding:5px 8px}}
</style>