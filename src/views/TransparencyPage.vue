<template>
  <ion-page class="relief-transparency-page">
    <ion-content :fullscreen="true" class="transparency-content">
      <div class="transparency-shell">
        <!-- Same cream header as Campaigns and Campaign Details -->
        <header class="page-navbar">
          <router-link to="/welcome" class="brand" aria-label="ReliefGO home">
            Relief<span>GO</span><b>♥</b>
          </router-link>
          <router-link :to="`/campaigns/${campaignId}`" class="back-link">
            <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
            <span>BACK TO CAMPAIGN</span>
          </router-link>
        </header>

        <main class="page-main">
          <div v-if="loading" class="state-box" role="status" aria-live="polite">
            <ion-spinner name="crescent" class="state-spinner" />
            <h2>Gathering the report...</h2>
            <p>Loading the campaign's verified financial records.</p>
          </div>

          <div v-else-if="errorMessage || !data" class="state-box" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h2>Report not available.</h2>
            <p>{{ errorMessage || 'This campaign does not exist or is not available to the public.' }}</p>
            <router-link to="/campaigns" class="state-action">
              EXPLORE CAMPAIGNS
              <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
            </router-link>
          </div>

          <template v-else>
            <!-- Editorial green introduction. No mock fundraising amounts. -->
            <section class="report-hero" aria-labelledby="report-heading">
              <div class="hero-copy">
                <p class="eyebrow">RELIEFGO <span>✦</span> ACCOUNTABILITY MATTERS</p>
                <h1 id="report-heading">Every peso has <em>a purpose.</em></h1>
                <p class="hero-lead">
                  Explore verified donations, approved expenses, and available proof
                  of how this campaign's funds are being used.
                </p>
                <div class="hero-trust">
                  <ion-icon :icon="shieldCheckmarkOutline" aria-hidden="true" />
                  <span>Transparent giving. Meaningful impact.</span>
                </div>
              </div>
              <div class="hero-art" aria-hidden="true">
                <span class="art-halo"></span>
                <ion-icon :icon="documentTextOutline" class="art-paper" />
                <ion-icon :icon="shieldCheckmarkOutline" class="art-shield" />
                <span class="art-caption">GIVING WITH TRANSPARENCY</span>
              </div>
            </section>

            <div class="report-container">
              <!-- Campaign-specific information from the existing backend -->
              <section class="campaign-heading" aria-label="Campaign information">
                <div>
                  <p class="section-eyebrow">THE CAMPAIGN BEHIND THE REPORT</p>
                  <h2>{{ data.campaign.title }}</h2>
                  <p class="organizer">
                    <ion-icon :icon="peopleOutline" aria-hidden="true" />
                    Organized by <strong>{{ data.campaign.organizerName }}</strong>
                  </p>
                </div>
                <router-link :to="`/campaigns/${campaignId}`" class="campaign-link">
                  VIEW CAMPAIGN
                  <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                </router-link>
              </section>

              <!-- Preserve the exact verified financial calculations,
                   breakdown, attachments, and empty states in this component. -->
              <section class="report-section" aria-labelledby="financial-report-title">
                <div class="section-heading">
                  <div class="section-number">01</div>
                  <div>
                    <p class="section-eyebrow">FINANCIAL ACCOUNTABILITY</p>
                    <h2 id="financial-report-title">Where the funds <em>go.</em></h2>
                    <p>Only verified donations and approved, documented expenses are counted.</p>
                  </div>
                </div>
                <div class="report-surface">
                  <TransparencyReport :summary="data.summary" :expenses="data.expenses" />
                </div>
              </section>

              <aside class="trust-note">
                <div class="trust-icon">
                  <ion-icon :icon="shieldCheckmarkOutline" aria-hidden="true" />
                </div>
                <div>
                  <p class="section-eyebrow">BUILT AROUND ACCOUNTABILITY</p>
                  <h3>Trust grows with every verified update.</h3>
                  <p>
                    Supporting documentation is displayed when it has been reviewed
                    and approved. Pending or rejected expenses do not count toward
                    the reported approved expenses.
                  </p>
                </div>
              </aside>

              <div class="bottom-actions">
                <router-link :to="`/campaigns/${campaignId}`" class="bottom-back">
                  <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
                  BACK TO CAMPAIGN DETAILS
                </router-link>
                <router-link to="/campaigns" class="browse-link">
                  EXPLORE MORE CAMPAIGNS
                  <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                </router-link>
              </div>
            </div>
          </template>
        </main>

        <footer class="page-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  arrowBackOutline,
  arrowForwardOutline,
  alertCircleOutline,
  shieldCheckmarkOutline,
  documentTextOutline,
  peopleOutline,
} from 'ionicons/icons';
import TransparencyReport from '../components/TransparencyReport.vue';
import { getTransparencyData } from '../services/transparencyService';
import type { TransparencyData } from '../services/transparencyService';

const route = useRoute();
const campaignId = String(route.params.id);
const data = ref<TransparencyData | null>(null);
const loading = ref(true);
const errorMessage = ref('');

// Keep the original backend/data flow unchanged.
onIonViewWillEnter(async () => {
  if (!data.value) loading.value = true;
  errorMessage.value = '';

  try {
    data.value = await getTransparencyData(campaignId);
  } catch (error) {
    data.value = null;
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the report.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Original ReliefGO palette and type system */
.relief-transparency-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --terracotta: #c66b46;
  --gold: #e8ae4c;
  --muted: #667365;
  background: var(--cream);
  color: var(--forest);
}
.transparency-content {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.transparency-content::part(background),
.transparency-content::part(scroll) { background: #f8f3e4; }
.transparency-shell {
  width: 100%;
  min-height: 100dvh;
  padding: 0 clamp(14px, 3.6vw, 64px);
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.transparency-shell * { box-sizing: border-box; }
.transparency-shell a { color: inherit; text-decoration: none; }
h1, h2, h3, .brand { font-family: Georgia, 'Times New Roman', serif; }

/* Navigation consistent with the Campaign Details redesign */
.page-navbar {
  height: 76px;
  width: 100%;
  max-width: 1620px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}
.brand { color: var(--forest); font-size: clamp(27px, 2.4vw, 36px); font-weight: 700; letter-spacing: -2px; white-space: nowrap; line-height: 1; }
.brand span, .brand b { color: var(--terracotta); }
.brand b { vertical-align: top; font-size: 12px; letter-spacing: 0; margin-left: 2px; }
.back-link, .campaign-link, .bottom-back, .browse-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}
.back-link { padding: 12px 17px; border: 1px solid rgba(24,60,44,.25); border-radius: 999px; white-space: nowrap; }
.back-link ion-icon, .campaign-link ion-icon, .bottom-back ion-icon, .browse-link ion-icon { font-size: 17px; flex-shrink: 0; }
.back-link:hover, .back-link:focus-visible { background: var(--forest); color: #fff8e8; }
.page-main { width: 100%; max-width: 1620px; margin: 0 auto; }

/* Forest-green header with an abstract verification motif (no extra asset). */
.report-hero {
  border-radius: 19px;
  background: linear-gradient(115deg, var(--forest), var(--deep));
  color: #fff8e8;
  padding: clamp(35px, 5vw, 72px) clamp(28px, 5.3vw, 82px);
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(230px, .65fr);
  gap: 25px;
  align-items: center;
  overflow: hidden;
  position: relative;
}
.report-hero::before {
  content: 'RELIEFGO';
  position: absolute;
  right: 0; top: -48px;
  color: rgba(255,248,232,.055);
  font: 900 clamp(90px, 15vw, 235px) Georgia, serif;
  letter-spacing: -10px;
  pointer-events: none;
}
.hero-copy { position: relative; z-index: 1; min-width: 0; }
.eyebrow, .section-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  line-height: 1.5;
  margin: 0 0 13px;
  color: var(--terracotta);
}
.eyebrow { color: var(--gold); }
.eyebrow span { margin: 0 5px; }
.report-hero h1 {
  max-width: 760px;
  margin: 0 0 18px;
  font-weight: 400;
  font-size: clamp(36px, 4.45vw, 70px);
  line-height: 1.08;
  letter-spacing: -2px;
  overflow-wrap: anywhere;
}
.report-hero h1 em { color: var(--gold); font-weight: 400; }
.hero-lead { max-width: 580px; margin: 0; color: #d8e2d3; font-size: clamp(13px, 1.1vw, 16px); line-height: 1.8; }
.hero-trust { display: flex; align-items: center; gap: 10px; margin-top: 23px; font-size: 11px; color: #e1e9df; }
.hero-trust ion-icon { color: var(--gold); font-size: 20px; flex-shrink: 0; }
.hero-art { position: relative; min-height: 205px; display: grid; place-items: center; }
.art-halo { position: absolute; width: 230px; height: 230px; border-radius: 50%; background: radial-gradient(circle, rgba(232,174,76,.24), transparent 70%); }
.art-paper { font-size: clamp(110px, 10vw, 165px); color: #f1e2c4; transform: rotate(-12deg); filter: drop-shadow(0 10px 14px rgba(0,0,0,.16)); }
.art-shield { font-size: 66px; color: var(--gold); position: absolute; top: 47%; left: 58%; background: var(--forest); border-radius: 50%; padding: 10px; box-shadow: 0 7px 18px rgba(0,0,0,.2); }
.art-caption { position: absolute; bottom: 0; text-align: center; font-size: 9px; letter-spacing: 2px; font-weight: 800; color: var(--gold); }

/* Main report body */
.report-container { max-width: 1200px; margin: 0 auto; padding: clamp(29px, 4vw, 56px) 0 30px; }
.campaign-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 0 5px 30px; border-bottom: 1px solid #e6dbc4; }
.campaign-heading > div { min-width: 0; }
.campaign-heading h2 { font-size: clamp(29px, 2.9vw, 46px); line-height: 1.2; letter-spacing: -1px; font-weight: 400; margin: 0 0 10px; overflow-wrap: anywhere; }
.organizer { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #596b5c; margin: 0; }
.organizer strong { font-weight: 700; color: var(--forest); }
.organizer ion-icon { color: var(--terracotta); font-size: 18px; }
.campaign-link { color: var(--forest); border-bottom: 1px solid var(--terracotta); padding: 10px 0; flex-shrink: 0; }
.campaign-link:hover, .campaign-link:focus-visible { color: var(--terracotta); }
.report-section { margin-top: 39px; }
.section-heading { display: flex; align-items: center; gap: 18px; margin-bottom: 22px; }
.section-number { width: 53px; height: 53px; border: 1px solid #decfb2; border-radius: 15px; color: var(--terracotta); font: 700 25px Georgia, serif; display: grid; place-items: center; flex-shrink: 0; }
.section-heading .section-eyebrow { margin-bottom: 6px; }
.section-heading h2 { font-size: clamp(29px, 2.8vw, 42px); line-height: 1.2; letter-spacing: -1px; font-weight: 400; margin: 0 0 7px; }
.section-heading h2 em { font-weight: 400; color: var(--terracotta); }
.section-heading p:last-child { margin: 0; font-size: 13px; color: #637065; line-height: 1.6; }

/* Original TransparencyReport.vue still computes and renders every amount,
   expense entry, proof attachment, and empty state. We style its OUTER surface. */
.report-surface {
  border-radius: 19px;
  border: 1px solid #e7dec8;
  background: #fffaf0;
  box-shadow: 0 13px 35px rgba(24,60,44,.06);
  padding: clamp(16px, 2.2vw, 30px);
  min-width: 0;
}
/* Deep selectors target common child card/heading primitives without changing
   the child's data or markup. No assumptions about backend field names. */
.report-surface :deep(ion-card) {
  --background: #fffdf7;
  --color: #183c2c;
  border: 1px solid #e6dbc7;
  border-radius: 16px;
  box-shadow: none;
  margin-left: 0;
  margin-right: 0;
}
.report-surface :deep(h2),
.report-surface :deep(h3) {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  color: #183c2c;
}
.report-surface :deep(p),
.report-surface :deep(span),
.report-surface :deep(ion-item) {
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.report-surface :deep(ion-item) { --background: #fffdf7; --color: #183c2c; }
.report-surface :deep(ion-progress-bar) { --background: #e6eadf; --progress-background: #3d8852; border-radius: 10px; }
.report-surface :deep(.state-box) { color: #667365; }
.report-surface :deep(.muted) { color: #667365; }

.trust-note { margin-top: 30px; display: flex; align-items: center; gap: clamp(16px, 3vw, 30px); border-radius: 18px; padding: 24px clamp(21px, 3vw, 36px); background: #e9eee1; border: 1px solid #d8dfcf; }
.trust-icon { display: grid; place-items: center; width: 63px; height: 63px; flex-shrink: 0; border-radius: 16px; background: #d8e5d5; color: var(--forest); font-size: 32px; }
.trust-note .section-eyebrow { margin-bottom: 6px; }
.trust-note h3 { font-size: clamp(19px, 2vw, 27px); font-weight: 400; margin: 0 0 6px; }
.trust-note p:last-child { font-size: 12px; line-height: 1.75; margin: 0; color: #56675a; max-width: 750px; }
.bottom-actions { display: flex; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin: 29px 0 0; }
.bottom-back, .browse-link { color: var(--forest); border-bottom: 1px solid #dfb16b; padding: 12px 0; }
.bottom-back:hover, .browse-link:hover { color: var(--terracotta); }

.page-footer { max-width: 1620px; margin: 0 auto; padding: 20px 0 26px; display: flex; justify-content: space-between; align-items: center; gap: 15px; font-size: 11px; color: #687768; border-top: 1px solid #e6dbc4; }
.state-box { min-height: 60dvh; display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center; text-align: center; padding: 42px 16px; }
.state-box h2 { font-size: clamp(30px, 4vw, 49px); font-weight: 400; margin: 0; }
.state-box p { font-size: 14px; color: #637065; margin: 0; line-height: 1.65; }
.state-spinner, .state-icon { width: 49px; height: 49px; color: var(--terracotta); }
.state-action { display: inline-flex; gap: 10px; align-items: center; margin-top: 15px; background: var(--gold); color: var(--deep); padding: 15px 24px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: .7px; }
.state-action ion-icon { font-size: 19px; }

@media (max-width: 850px) {
  .report-hero { grid-template-columns: minmax(0, 1fr) 170px; padding: 35px 32px; }
  .hero-art { min-height: 170px; }
  .art-paper { font-size: 113px; }
  .art-shield { font-size: 52px; }
  .campaign-heading { align-items: flex-start; }
}
@media (max-width: 640px) {
  .transparency-shell { padding-inline: 12px; }
  .page-navbar { height: 68px; }
  .brand { font-size: 27px; }
  .back-link { padding: 9px 11px; gap: 6px; font-size: 9px; letter-spacing: .5px; }
  .back-link ion-icon { font-size: 14px; }
  .report-hero { grid-template-columns: 1fr; border-radius: 14px; padding: 35px 23px 29px; }
  .report-hero h1 { font-size: clamp(36px, 9vw, 52px); }
  .report-hero::before { top: 14px; font-size: 85px; letter-spacing: -4px; }
  .hero-art { display: none; }
  .campaign-heading { flex-direction: column; gap: 9px; }
  .campaign-heading h2 { font-size: 31px; }
  .campaign-link { font-size: 10px; }
  .section-heading { gap: 11px; align-items: flex-start; }
  .section-number { width: 43px; height: 43px; font-size: 19px; border-radius: 11px; }
  .report-surface { padding: 10px; }
  .trust-note { align-items: flex-start; padding: 19px; gap: 12px; }
  .trust-icon { width: 43px; height: 43px; border-radius: 12px; font-size: 24px; }
  .bottom-actions { flex-direction: column; gap: 2px; align-items: flex-start; }
  .page-footer { font-size: 10px; flex-wrap: wrap; justify-content: center; gap: 4px 14px; }
}
</style>