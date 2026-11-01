<template>
  <ion-page class="rg-page">
    <ion-header class="rg-header">
      <nav class="rg-navbar" aria-label="My Campaigns navigation">
        <router-link to="/welcome" class="rg-brand" aria-label="ReliefGO home">Relief<span>GO</span><b>♥</b></router-link>
        <router-link to="/dashboard" class="nav-back"><ion-icon :icon="arrowBackOutline" aria-hidden="true" /> <span>BACK TO DASHBOARD</span></router-link>
      </nav>
    </ion-header>
    <ion-content class="rg-content">
      <div class="page-shell">
        <main class="main-content">
          <section class="hero" aria-labelledby="my-campaigns-title">
            <div class="hero-copy"><p class="eyebrow">YOUR BAYANIHAN JOURNEY ✦</p>
              <h1 id="my-campaigns-title">My <em>Campaigns.</em></h1>
              <p>Your fundraising stories, progress, and updates—all in one place. Together, we make hope grow.</p>
            </div>
            <div class="profile"><span class="avatar">{{ initials }}</span><div><small>ORGANIZER ACCOUNT</small><strong>{{ displayName }}</strong><span>Your fundraising journey</span></div></div>
          </section>

          <div v-if="loading" class="feedback"><ion-spinner name="crescent" /><h2>Loading your campaigns...</h2></div>
          <div v-else-if="errorMessage" class="feedback"><ion-icon :icon="alertCircleOutline" class="feedback-icon" /><h2>Could not load campaigns</h2><p>{{ errorMessage }}</p></div>
          <template v-else>
            <section class="stats" aria-label="Campaign overview">
              <article class="stat"><ion-icon :icon="documentTextOutline" /><span>ALL CAMPAIGNS</span><strong>{{ campaigns.length }}</strong><small>Campaign records</small></article>
              <article class="stat"><ion-icon :icon="heartOutline" /><span>VERIFIED FUNDS RAISED</span><strong>{{ formatPeso(totalRaised) }}</strong><small>Across your campaigns</small></article>
              <article class="stat"><ion-icon :icon="timeOutline" /><span>ACTIVE CAMPAIGNS</span><strong>{{ activeCount }}</strong><small>Currently active</small></article>
            </section>
            <section class="campaigns-section" aria-labelledby="list-heading">
              <div class="section-heading"><div><p class="section-eyebrow">SMALL ACTS. BIG HEARTS.</p><h2 id="list-heading">Your fundraising <em>stories.</em></h2><p>{{ campaigns.length === 0 ? 'Every story starts with a single act of kindness.' : `${campaigns.length} campaign ${campaigns.length === 1 ? 'record' : 'records'} found.` }}</p></div>
                <router-link v-if="campaigns.length > 0" to="/organizer/campaigns/new" class="new-campaign top-cta"><ion-icon :icon="addOutline" /> START A CAMPAIGN</router-link>
              </div>
              <div v-if="campaigns.length === 0" class="empty-card">
                <div class="empty-icon"><ion-icon :icon="documentTextOutline" /><span>✦</span></div>
                <p class="empty-kicker">YOUR STORY STARTS HERE</p><h3>No campaigns yet.</h3>
                <p>Start your first fundraising campaign and invite your community to join a cause that matters.</p>
                <router-link to="/organizer/campaigns/new" class="new-campaign"><ion-icon :icon="addOutline" /> CREATE YOUR FIRST CAMPAIGN <ion-icon :icon="arrowForwardOutline" /></router-link>
              </div>
              <div v-else class="campaign-grid">
                <article v-for="campaign in campaigns" :key="campaign.id" class="campaign-card">
                  <div class="campaign-photo">
                    <img
                      v-if="campaign.imageUrl"
                      :src="campaign.imageUrl"
                      :alt="campaign.title"
                      loading="lazy"
                    />
                    <div v-else class="photo-placeholder" aria-hidden="true">
                      <ion-icon :icon="heartOutline" />
                    </div>
                    <ion-chip :color="campaignStatusColor(campaign.status)" class="status-chip">
                      {{ campaign.status }}
                    </ion-chip>
                  </div>

                  <div class="card-content">
                    <p class="card-eyebrow">{{ campaign.category }}</p>
                    <h3>{{ campaign.title }}</h3>
                    <p class="excerpt">{{ campaign.description }}</p>

                    <div class="funding-head">
                      <span>Verified funds raised</span>
                      <strong>{{ formatPeso(campaign.verifiedTotal) }}</strong>
                    </div>
                    <CampaignProgress
                      :raised="campaign.verifiedTotal"
                      :goal="campaign.goalAmount"
                    />
                    <p class="goal-line">Goal: {{ formatPeso(campaign.goalAmount) }}</p>

                    <div class="card-meta">
                      <span>
                        <ion-icon :icon="peopleOutline" aria-hidden="true" />
                        {{ campaign.verifiedDonorCount }} verified donors
                      </span>
                      <span>
                        <ion-icon :icon="calendarOutline" aria-hidden="true" />
                        Deadline: {{ formatDate(campaign.deadline) }}
                      </span>
                    </div>

                    <div v-if="campaign.status === 'Suspended'" class="suspension-note" role="note">
                      <strong>Suspended by an administrator</strong>
                      <span>{{ campaign.rejectionReason || 'No reason given.' }}</span>
                    </div>

                    <!-- Keep all permissions and destinations from the original code. -->
                    <div class="card-actions" aria-label="Campaign management actions">
                      <router-link
                        v-if="canEdit(campaign)"
                        :to="`/organizer/campaigns/${campaign.id}/edit`"
                        class="card-action primary-action"
                      >
                        <ion-icon :icon="createOutline" aria-hidden="true" />
                        EDIT
                      </router-link>

                      <template v-if="isPublic(campaign)">
                        <router-link
                          :to="`/organizer/campaigns/${campaign.id}/expenses`"
                          class="card-action"
                        >
                          <ion-icon :icon="receiptOutline" aria-hidden="true" />
                          EXPENSES
                        </router-link>
                        <router-link
                          :to="`/organizer/campaigns/${campaign.id}/updates`"
                          class="card-action"
                        >
                          <ion-icon :icon="newspaperOutline" aria-hidden="true" />
                          UPDATES
                        </router-link>
                        <router-link
                          :to="`/campaigns/${campaign.id}/transparency`"
                          class="card-action"
                        >
                          <ion-icon :icon="shieldCheckmarkOutline" aria-hidden="true" />
                          TRANSPARENCY REPORT
                        </router-link>
                        <router-link
                          :to="`/campaigns/${campaign.id}`"
                          class="card-action"
                        >
                          <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                          VIEW PUBLIC PAGE
                        </router-link>
                      </template>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </template>
        </main>
        <footer class="rg-footer"><span>© {{ new Date().getFullYear() }} ReliefGO</span><span>Stories of bayanihan live here.</span></footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonPage, IonHeader, IonContent, IonIcon, IonSpinner, IonChip, onIonViewWillEnter } from '@ionic/vue';
import {
  addOutline, alertCircleOutline, arrowBackOutline, arrowForwardOutline,
  calendarOutline, documentTextOutline, heartOutline, peopleOutline,
  timeOutline, createOutline, receiptOutline, newspaperOutline, shieldCheckmarkOutline,
} from 'ionicons/icons';
import CampaignProgress from '../components/CampaignProgress.vue';
import { currentUser } from '../services/authState';
import { getMyCampaigns } from '../services/campaignService';
import { formatDate, formatPeso } from '../utils/format';
import { EDITABLE_STATUSES, PUBLIC_STATUSES } from '../models/Campaign';
import type { Campaign } from '../models/Campaign';
import { campaignStatusColor } from '../utils/ui';

const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const displayName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Organizer');
const initials = computed(() => {
  const parts = displayName.value.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || 'R') + (parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '')).toUpperCase();
});
const totalRaised = computed(() => campaigns.value.reduce((sum, c) => sum + c.verifiedTotal, 0));
const activeCount = computed(() => campaigns.value.filter(c => c.status === 'Active').length);

// Same permission rules as the user's original My Campaigns page.
const canEdit = (campaign: Campaign) => EDITABLE_STATUSES.includes(campaign.status);
const isPublic = (campaign: Campaign) => PUBLIC_STATUSES.includes(campaign.status);

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  if (!user) { errorMessage.value = 'Please log in to view your campaigns.'; loading.value = false; return; }
  loading.value = true;
  errorMessage.value = '';
  try { campaigns.value = await getMyCampaigns(user.uid); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Could not load campaigns.'; }
  finally { loading.value = false; }
});
</script>

<style scoped>
.rg-page{--forest:#183c2c;--deep:#102a20;--cream:#f8f3e4;--gold:#e8ae4c;--terracotta:#c66b46;color:var(--forest);background:var(--cream)}.rg-page *{box-sizing:border-box}.rg-page a{text-decoration:none}.rg-header,.rg-navbar{background:var(--cream)}.rg-header{box-shadow:none}.rg-header::after{display:none}
.rg-navbar{height:75px;padding:0 clamp(18px,4vw,66px);border-bottom:1px solid #e8dec9;display:flex;align-items:center;justify-content:space-between;gap:16px;font-family:'DM Sans','Segoe UI',sans-serif}.rg-brand{font:700 clamp(29px,2.6vw,37px)/1 Georgia,serif;letter-spacing:-2px;white-space:nowrap;color:var(--forest)}.rg-brand span,.rg-brand b{color:var(--terracotta)}.rg-brand b{font-size:12px;letter-spacing:0;vertical-align:top}.nav-back{display:inline-flex;gap:8px;align-items:center;color:var(--forest);font-weight:800;font-size:11px;letter-spacing:1px}.nav-back ion-icon{font-size:19px}.nav-back:hover{color:var(--terracotta)}
.rg-content{--background:#f8f3e4;--color:#183c2c;--padding-start:0;--padding-end:0;--padding-top:0;--padding-bottom:0}.page-shell{min-height:calc(100dvh - 75px);display:flex;flex-direction:column;padding:23px clamp(16px,4vw,66px) 0;font-family:'DM Sans','Avenir Next','Segoe UI',sans-serif}.main-content{width:min(100%,1380px);margin:0 auto}
.hero{min-height:215px;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(240px,.7fr);gap:30px;align-items:center;padding:clamp(26px,4vw,55px);border-radius:21px;color:#fff8e8;background:linear-gradient(120deg,var(--forest),var(--deep));overflow:hidden;position:relative}.hero:after{content:'';position:absolute;right:10%;bottom:-160px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(232,174,76,.13),transparent 70%);pointer-events:none}.hero-copy,.profile{position:relative;z-index:1}.eyebrow,.section-eyebrow,.empty-kicker,.card-eyebrow{font-weight:800;font-size:10px;letter-spacing:1.7px;margin:0 0 14px;color:var(--gold)}.hero h1{font:400 clamp(37px,4.5vw,61px)/1.08 Georgia,serif;letter-spacing:-1.6px;margin:0 0 12px}.hero h1 em{color:var(--gold)}.hero-copy>p:last-child{color:#d9e4d8;font-size:13px;line-height:1.75;margin:0;max-width:550px}.profile{display:flex;align-items:center;gap:16px;background:rgba(255,248,232,.07);border:1px solid rgba(255,248,232,.19);border-radius:16px;padding:18px;min-width:0}.avatar{width:62px;height:62px;flex:0 0 62px;display:grid;place-items:center;background:var(--gold);border-radius:50%;color:var(--deep);font:700 25px Georgia,serif}.profile>div{display:flex;flex-direction:column;gap:5px;min-width:0}.profile small{color:var(--gold);font-weight:800;font-size:10px;letter-spacing:1.1px}.profile strong{font:400 clamp(19px,2vw,26px)/1.2 Georgia,serif;overflow-wrap:anywhere}.profile>div>span{font-size:11px;color:#dce2d8}
.stats{margin-top:19px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.stat{min-width:0;border:1px solid #e8ddc8;border-radius:17px;background:#fff9ed;padding:20px 23px;display:flex;flex-direction:column;gap:6px}.stat ion-icon{color:var(--terracotta);font-size:24px;margin-bottom:4px}.stat>span{font-size:10px;font-weight:800;letter-spacing:1.4px;color:var(--terracotta)}.stat strong{font:400 clamp(24px,2.6vw,38px)/1.15 Georgia,serif;overflow-wrap:anywhere}.stat small{font-size:11px;color:#667568}.campaigns-section{margin-top:36px;margin-bottom:45px}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:23px}.section-eyebrow{color:var(--terracotta);margin-bottom:8px}.section-heading h2{font:400 clamp(31px,3.5vw,45px)/1.12 Georgia,serif;margin:0 0 9px}.section-heading h2 em{color:var(--terracotta)}.section-heading p:last-child{color:#68766a;font-size:13px;margin:0}.new-campaign{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--gold);color:var(--deep);font-size:11px;font-weight:800;letter-spacing:.9px;padding:14px 21px;border-radius:999px;white-space:nowrap}.new-campaign ion-icon{font-size:16px}.new-campaign:hover{background:#f1bf68}.top-cta{margin-bottom:3px}
.empty-card{background:#fff9ed;border:1px solid #e7ddca;border-radius:20px;min-height:285px;padding:34px 22px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.empty-icon{width:72px;height:72px;border-radius:50%;background:#f6e8ca;color:var(--terracotta);display:grid;place-items:center;position:relative;margin-bottom:18px}.empty-icon ion-icon{font-size:36px}.empty-icon span{position:absolute;right:5px;top:6px;color:#b7914b}.empty-kicker{color:var(--terracotta);margin-bottom:8px}.empty-card h3,.feedback h2{font:400 33px Georgia,serif;color:var(--forest);margin:0 0 10px}.empty-card>p:not(.empty-kicker){font-size:13px;line-height:1.7;color:#657568;max-width:440px;margin:0 0 21px}.feedback{min-height:350px;text-align:center;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--forest)}.feedback ion-spinner{color:var(--forest);width:34px;height:34px}.feedback-icon{font-size:43px;color:var(--terracotta)}.feedback p{color:#647368}
.campaign-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.campaign-card{background:#fff9ed;border:1px solid #e7dcc8;border-radius:18px;overflow:hidden;min-width:0}.campaign-photo{height:190px;position:relative;overflow:hidden;background:linear-gradient(140deg,#527b66,var(--forest));display:grid;place-items:center}.campaign-photo img{width:100%;height:100%;object-fit:cover}.photo-placeholder ion-icon{font-size:62px;color:#e2d7af}.status-chip { position: absolute; top: 12px; right: 12px; margin: 0; min-height: 28px; background: #fff9ed; border-radius: 100px; font-size: 11px; font-weight: 800; max-width: calc(100% - 24px); }.card-content{padding:21px 23px 24px}.card-eyebrow{color:var(--terracotta);margin:0 0 8px}.card-content h3{font:400 27px/1.2 Georgia,serif;margin:0 0 9px;color:var(--forest);overflow-wrap:anywhere}.excerpt{font-size:12px;line-height:1.6;color:#6b776b;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.card-meta{display:flex;flex-wrap:wrap;gap:12px 18px;color:#687668;font-size:11px;margin-top:16px}.card-meta span{display:inline-flex;align-items:center;gap:6px}.card-meta ion-icon{color:var(--terracotta);font-size:14px}
.rg-footer{width:min(100%,1380px);margin:auto auto 0;padding:18px 0;border-top:1px solid #e8dec9;display:flex;justify-content:space-between;gap:16px;color:#697a68;font:11px 'DM Sans','Segoe UI',sans-serif}
@media(max-width:950px){.hero{grid-template-columns:1fr;gap:17px}.profile{max-width:440px}}@media(max-width:700px){.rg-navbar{height:67px;padding-inline:16px}.rg-brand{font-size:28px}.nav-back{font-size:9px;letter-spacing:0}.nav-back ion-icon{font-size:16px}.page-shell{min-height:calc(100dvh - 67px);padding:15px 14px 0}.hero{padding:27px 22px;min-height:0;border-radius:16px}.hero h1{font-size:40px}.stats{gap:10px}.stat{padding:13px}.stat strong{font-size:24px}.stat>span{font-size:9px;letter-spacing:.5px}.stat ion-icon{font-size:20px}.stat small{font-size:10px}.section-heading{flex-direction:column;align-items:stretch;gap:16px}.top-cta{align-self:flex-start}.campaign-grid{grid-template-columns:1fr}.rg-footer{font-size:10px}}@media(max-width:480px){.stats{grid-template-columns:1fr}.stat{display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:2px 10px}.stat ion-icon{grid-row:1/4}.profile .avatar{width:51px;height:51px;flex-basis:51px;font-size:21px}.rg-footer{flex-wrap:wrap;justify-content:center}}

/* Additional campaign-management details, keeping the old actions available. */
.funding-head {
  margin: 17px 0 9px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 12px;
  align-items: baseline;
}
.funding-head span, .goal-line { color: #667568; font-size: 12px; }
.funding-head strong { color: var(--forest); font-size: 16px; }
.goal-line { margin: 8px 0 0; }
.suspension-note {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #fff1e9;
  border: 1px solid #efc6b6;
  border-radius: 12px;
  padding: 13px 14px;
  color: #8d3129;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 17px;
  overflow-wrap: anywhere;
}
.card-actions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e7dcc8;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
}
.card-action {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px 13px;
  background: #f8f3e4;
  border: 1px solid #e3d7c0;
  border-radius: 100px;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 10px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: .45px;
  color: var(--forest);
  transition: border-color .2s, background .2s;
  text-align: center;
}
.card-action ion-icon { font-size: 15px; flex-shrink: 0; }
.card-action:hover, .card-action:focus-visible { border-color: var(--gold); background: #f3e8d1; }
.primary-action { background: var(--gold); border-color: var(--gold); }
.primary-action:hover, .primary-action:focus-visible { background: #f1bf68; }
@media (max-width: 420px) {
  .card-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .card-action { padding: 11px 7px; font-size: 9px; }
  .card-content { padding: 19px 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .card-action { transition: none; }
}

</style>