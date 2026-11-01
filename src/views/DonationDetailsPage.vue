<template>
  <ion-page>
    <ion-header class="rg-header">
      <ion-toolbar class="rg-toolbar">
        <div class="nav-inner">
          <router-link to="/donor/donations" class="brand">Relief<span>GO</span><sup>♥</sup></router-link>
          <router-link to="/donor/donations" class="back-link"><ion-icon :icon="arrowBackOutline" /> BACK TO MY DONATIONS</router-link>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rg-content">
      <main class="page-wrapper">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">RELIEFGO · DONOR WORKSPACE</p>
            <h1>Donation <em>Details.</em></h1>
            <p>Follow your contribution, review payment information, and see how your generosity supports bayanihan.</p>
          </div>
          <div class="identity">
            <div class="avatar"><ion-icon :icon="heartOutline" /></div>
            <div><span class="identity-label">YOUR GIVING JOURNEY</span><strong>Every gift matters.</strong><small>Thank you for making a difference</small></div>
          </div>
        </section>

        <div v-if="loading" class="state-box top-state">
          <ion-spinner name="crescent" /><p>Loading donation...</p>
        </div>
        <div v-else-if="!donation" class="state-box top-state">
          <ion-icon :icon="alertCircleOutline" class="state-icon" />
          <h3>Donation not found</h3>
          <p>{{ errorMessage || 'This donation does not exist or is not yours.' }}</p>
          <ion-button class="primary-action" router-link="/donor/donations">Back to My Donations</ion-button>
        </div>

        <template v-else>
          <section class="detail-layout">
            <div class="main-column">
              <article class="donation-card">
                <div class="card-top">
                  <div>
                    <span class="mini-label">YOUR CONTRIBUTION</span>
                    <h2 class="donation-amount">{{ formatPeso(donation.amount) }}</h2>
                    <p>For {{ donation.campaignTitle }}</p>
                  </div>
                  <ion-chip :color="donationStatusColor(donation.status)">{{ donation.status }}</ion-chip>
                </div>

                <div v-if="donation.status === 'Pending Verification'" class="status-note pending-note">
                  <ion-icon :icon="timeOutline" />
                  <span>Your donation is waiting for an administrator to verify the payment. It is not yet counted toward the campaign.</span>
                </div>
                <div v-else-if="donation.status === 'Verified'" class="status-note good-note">
                  <ion-icon :icon="checkmarkCircleOutline" />
                  <span>Thank you! Your payment was verified on {{ formatDate(donation.verificationDate) }} and now counts toward the campaign.</span>
                </div>
                <div v-else-if="donation.status === 'Rejected'" class="status-note bad-note">
                  <ion-icon :icon="alertCircleOutline" />
                  <span><strong>Rejected:</strong> {{ donation.rejectionReason || 'No reason given.' }} If you believe this is a mistake, please contact the administrator.</span>
                </div>

                <div class="section-title"><ion-icon :icon="receiptOutline" /><h3>Payment information</h3></div>
                <dl class="info-list">
                  <div><dt>Payment method</dt><dd>{{ donation.paymentMethod }}</dd></div>
                  <div><dt>Reference number</dt><dd>{{ donation.referenceNumber }}</dd></div>
                  <div><dt>Name on account</dt><dd>{{ donation.senderName }}</dd></div>
                  <div><dt>Submitted</dt><dd>{{ formatDate(donation.transactionDate) }}</dd></div>
                  <div><dt>Public name</dt><dd>{{ donation.isAnonymous ? 'Hidden (shown as Anonymous)' : donation.donorName }}</dd></div>
                </dl>
              </article>
            </div>
            <aside class="side-column">
              <div class="campaign-panel">
                <div class="campaign-icon"><ion-icon :icon="heartOutline" /></div>
                <p class="eyebrow dark">THE CAUSE YOU SUPPORTED</p>
                <h3>{{ donation.campaignTitle }}</h3>
                <p>Explore the campaign and stay connected to its story.</p>
                <ion-button class="primary-action campaign-button" :router-link="`/campaigns/${donation.campaignId}`">
                  View campaign <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>
              </div>
              <div class="privacy-note"><ion-icon :icon="shieldCheckmarkOutline" /><p>Your donation details are shown here for your reference. Your public display name follows your anonymity choice.</p></div>
            </aside>
          </section>
        </template>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonChip, IonSpinner, IonIcon, onIonViewWillEnter } from '@ionic/vue';
import { alertCircleOutline, arrowBackOutline, arrowForwardOutline, heartOutline, timeOutline, checkmarkCircleOutline, receiptOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { getDonation } from '../services/donationService';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { donationStatusColor } from '../utils/ui';

const route = useRoute();
// Read once when the page is created, as in the original component.
const donationId = String(route.params.id);
const donation = ref<Donation | null>(null);
const loading = ref(true);
const errorMessage = ref('');

onIonViewWillEnter(async () => {
  if (!donation.value) loading.value = true;
  errorMessage.value = '';
  try {
    donation.value = await getDonation(donationId);
  } catch (error) {
    donation.value = null;
    errorMessage.value = error instanceof Error ? error.message : '';
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

.detail-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(275px,.85fr);gap:20px;margin-top:24px;align-items:start}
.donation-card,.campaign-panel,.privacy-note{background:#fffaf0;border:1px solid #e8dcc6;border-radius:20px;box-shadow:0 8px 25px #253d2810}
.donation-card{padding:33px}
.donation-amount{font:normal clamp(38px,4vw,56px)/1.1 Georgia,serif;color:#173e2d;margin:0 0 9px;overflow-wrap:anywhere}
.donation-card .card-top p{font-size:15px;line-height:1.5}
.status-note{display:flex;gap:11px;align-items:flex-start;padding:17px 18px;margin:28px 0;border-radius:13px;font-size:13px;line-height:1.65}
.status-note ion-icon{font-size:22px;flex:none;margin-top:1px}
.section-title{display:flex;align-items:center;gap:10px;margin:29px 0 12px;color:#bf744b}
.section-title h3{font:normal 26px Georgia,serif;color:#173e2d;margin:0}
.section-title ion-icon{font-size:22px}
.info-list{margin:0}.info-list>div{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1px solid #ece3d3;padding:17px 0;font-size:13px;line-height:1.5}.info-list>div:last-child{border-bottom:0}
.info-list dt{color:#7d867b;flex:0 0 42%}.info-list dd{margin:0;text-align:right;color:#1d4331;font-weight:800;overflow-wrap:anywhere;min-width:0}
.campaign-panel{padding:29px}.campaign-icon{width:54px;height:54px;display:grid;place-items:center;background:#f1dfb9;color:#bd7248;border-radius:15px;font-size:26px;margin-bottom:23px}.campaign-panel h3{font:normal 30px/1.18 Georgia,serif;color:#173e2d;margin:0 0 12px;overflow-wrap:anywhere}.campaign-panel>p:last-of-type{font-size:13px;color:#778075;line-height:1.7;margin:0 0 22px}
.campaign-button{--border-radius:11px;width:100%;min-height:43px;margin:0;text-transform:none;font-weight:800}
.privacy-note{display:flex;align-items:flex-start;gap:12px;margin-top:15px;padding:20px;background:#f4ecdc;box-shadow:none}.privacy-note ion-icon{font-size:23px;color:#b8764f;flex:none}.privacy-note p{margin:0;color:#6c796c;font-size:12px;line-height:1.6}
.top-state{margin-top:24px}.top-state .primary-action{--border-radius:10px;min-height:40px;margin-top:15px;text-transform:none}
@media(max-width:900px){.detail-layout{grid-template-columns:1fr}.side-column{display:grid;grid-template-columns:1fr 1fr;gap:15px}.privacy-note{margin:0}}
@media(max-width:620px){.detail-layout{margin-top:15px}.donation-card{padding:21px}.side-column{grid-template-columns:1fr}.privacy-note{margin:0}.info-list dt{flex-basis:40%}.donation-card .card-top{gap:12px}.donation-amount{font-size:37px}}
</style>