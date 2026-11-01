<template>
  <ion-page class="donor-page">
    <ion-header class="site-header">
      <ion-toolbar>
        <div class="nav-content">
          <router-link to="/campaigns" class="wordmark" aria-label="ReliefGO campaigns">Relief<span>GO</span><b>♥</b></router-link>
          <ion-button class="logout" fill="clear" :disabled="loggingOut" @click="handleLogout">
            <ion-icon slot="start" :icon="logOutOutline" />
            {{ loggingOut ? 'Logging out...' : 'LOG OUT' }}
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="dashboard-content">
      <main class="dashboard-shell">
        <section class="welcome-hero">
          <div class="hero-text">
            <div class="eyebrow"><span class="sparkle">✦</span> YOUR RELIEFGO SPACE</div>
            <h1>Welcome back,<br /><em>{{ firstName }}!</em></h1>
            <p>Every act of kindness tells a story. Discover meaningful causes and keep track of the difference you make.</p>
            <div class="hero-signoff"><ion-icon :icon="heartOutline" /> SMALL ACTS. BIG HEARTS.</div>
          </div>
          <div class="profile-card">
            <div class="profile-avatar">{{ initials }}</div>
            <div class="profile-copy"><span>YOUR DONOR PROFILE</span><strong>{{ displayName }}</strong><small>ReliefGO Community Donor</small></div>
            <span class="profile-decoration">♥</span>
          </div>
        </section>

        <section class="intro-section">
          <div><div class="section-kicker">YOUR BAYANIHAN JOURNEY</div><h2>How would you like to <em>give today?</em></h2><p>Explore community campaigns or revisit the causes you've supported.</p></div>
          <span class="intro-flower" aria-hidden="true">✳</span>
        </section>

        <section class="action-grid" aria-label="Donor dashboard actions">
          <router-link to="/campaigns" class="action-card campaign-card">
            <div class="card-icon"><ion-icon :icon="compassOutline" /></div>
            <div class="card-eyebrow">DISCOVER & SUPPORT</div>
            <h3>Browse <em>Campaigns.</em></h3>
            <p>Find heartfelt stories and support campaigns that matter to you.</p>
            <span class="card-cta">EXPLORE CAMPAIGNS <ion-icon :icon="arrowForwardOutline" /></span>
            <span class="card-ornament" aria-hidden="true">✿</span>
          </router-link>
          <router-link to="/donor/donations" class="action-card donations-card">
            <div class="card-icon"><ion-icon :icon="receiptOutline" /></div>
            <div class="card-eyebrow">YOUR GIVING HISTORY</div>
            <h3>My <em>Donations.</em></h3>
            <p>Review your contributions, payment statuses, and supported causes.</p>
            <span class="card-cta">VIEW MY DONATIONS <ion-icon :icon="arrowForwardOutline" /></span>
            <span class="card-ornament" aria-hidden="true">♡</span>
          </router-link>
        </section>
        <div class="footer-note"><ion-icon :icon="heartOutline" /> Together, we make kindness go further. <ion-icon :icon="heartOutline" /></div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { logOutOutline, heartOutline, compassOutline, receiptOutline, arrowForwardOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';

const router = useRouter();
const loggingOut = ref(false);
const displayName = computed(() => currentUser.value?.displayName?.trim() || 'Donor');
const firstName = computed(() => displayName.value.split(/\s+/)[0]);
const initials = computed(() => displayName.value.split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join(''));

async function handleLogout() {
  if (loggingOut.value) return;
  loggingOut.value = true;
  try {
    await logoutUser();
    await router.replace('/welcome');
  } catch (error) {
    console.error('Unable to log out:', error);
  } finally {
    loggingOut.value = false;
  }
}
</script>

<style scoped>
.donor-page{--forest:#183c2c;--deep:#102a20;--cream:#f8f3e4;--paper:#fffaf0;--gold:#e8ae4c;--terra:#c66b46;font-family:'DM Sans','Avenir Next','Segoe UI',Arial,sans-serif;color:var(--forest)}
.site-header{box-shadow:none}.site-header ion-toolbar{--background:#fffaf0;--border-width:0;--min-height:78px;--padding-start:0;--padding-end:0;border-bottom:1px solid #e9ddc7}
.nav-content{max-width:1190px;margin:auto;padding:0 27px;display:flex;align-items:center;justify-content:space-between;min-height:78px;gap:15px}
.wordmark{text-decoration:none;color:var(--forest);font:700 30px Georgia,serif;letter-spacing:-1.7px}.wordmark span{color:var(--terra)}.wordmark b{font:20px Georgia,serif;color:var(--gold);vertical-align:super;margin-left:4px}
.logout{--color:var(--forest);--border-radius:10px;font-size:11px;letter-spacing:1.4px;font-weight:800;--padding-start:12px;--padding-end:12px}
.dashboard-content{--background:#f8f3e4}.dashboard-shell{max-width:1190px;margin:auto;padding:30px 27px 40px}
.welcome-hero{background:linear-gradient(115deg,#1c4733,#102a20);color:#fff9eb;border-radius:22px;min-height:310px;padding:50px 55px;display:flex;align-items:center;justify-content:space-between;gap:35px;position:relative;overflow:hidden}
.welcome-hero:after{content:'✳';position:absolute;right:-38px;top:-120px;font-size:350px;color:#ffffff08;pointer-events:none}
.hero-text{position:relative;z-index:1;max-width:590px}.eyebrow,.section-kicker,.card-eyebrow{font-size:11px;font-weight:800;letter-spacing:2.2px}.eyebrow{color:#e6b85c}.sparkle{font-size:18px;margin-right:7px}
h1,h2,h3{font-family:Georgia,'Times New Roman',serif;font-weight:400}h1{font-size:clamp(40px,5vw,66px);line-height:1.08;letter-spacing:-2px;margin:18px 0}h1 em{color:#f0bb61;font-style:italic}.hero-text>p{font-size:14px;line-height:1.8;color:#e4e7d8;max-width:470px;margin:0}.hero-signoff{display:flex;align-items:center;gap:9px;color:#f0bb61;letter-spacing:1.6px;font-size:10px;font-weight:800;margin-top:28px}.hero-signoff ion-icon{font-size:17px}
.profile-card{background:#fff9eb0f;border:1px solid #fff9eb35;border-radius:18px;padding:24px;display:flex;align-items:center;gap:16px;position:relative;z-index:1;min-width:295px;max-width:360px}.profile-avatar{width:66px;height:66px;border-radius:50%;background:#e8ae4c;color:#1c3b2c;display:grid;place-items:center;font:700 25px Georgia,serif;flex:none}.profile-copy{display:flex;flex-direction:column;gap:6px;min-width:0}.profile-copy span{color:#eac681;font-size:9px;letter-spacing:1.5px;font-weight:800}.profile-copy strong{font-size:17px;overflow-wrap:anywhere}.profile-copy small{font-size:11px;color:#d8e0cf}.profile-decoration{position:absolute;right:12px;top:10px;color:#e8ae4c;font-size:13px}
.intro-section{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:45px 0 23px}.section-kicker{color:#bb694a}.intro-section h2{font-size:clamp(29px,3.4vw,42px);letter-spacing:-.8px;margin:10px 0}.intro-section h2 em{color:#c66b46}.intro-section p{font-size:13px;color:#738071;margin:0;line-height:1.6}.intro-flower{font-size:64px;color:#ddba74}
.action-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.action-card{position:relative;overflow:hidden;min-height:295px;padding:32px 35px;border-radius:19px;text-decoration:none;color:var(--forest);border:1px solid #e9ddc7;background:#fffaf0;box-shadow:0 8px 25px #183c2c0a;transition:transform .2s,box-shadow .2s}.action-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px #183c2c18}.card-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:14px;background:#e6eddc;color:#315e3e;font-size:26px;margin-bottom:23px}.donations-card .card-icon{background:#f9e9d9;color:#b76443}.card-eyebrow{color:#b86d4b}.action-card h3{font-size:clamp(27px,3vw,36px);margin:10px 0}.action-card h3 em{color:#c66b46}.action-card p{color:#718072;font-size:13px;line-height:1.7;max-width:360px;position:relative;z-index:1}.card-cta{display:flex;align-items:center;gap:10px;margin-top:28px;font-size:11px;letter-spacing:1.3px;font-weight:900;color:#245239;position:relative;z-index:1}.card-cta ion-icon{font-size:18px}.card-ornament{position:absolute;right:-10px;bottom:-58px;font-size:205px;line-height:1;color:#c66b4610;pointer-events:none}.footer-note{margin-top:35px;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px;color:#829080;font-size:12px}.footer-note ion-icon{color:#c66b46}
@media(max-width:850px){.welcome-hero{flex-direction:column;align-items:flex-start;padding:38px}.profile-card{width:100%;max-width:480px}.action-grid{gap:14px}.action-card{padding:25px}}
@media(max-width:600px){.site-header ion-toolbar,.nav-content{min-height:66px}.nav-content{padding:0 17px}.wordmark{font-size:26px}.dashboard-shell{padding:16px 15px 30px}.welcome-hero{padding:32px 24px;border-radius:18px;gap:25px}h1{font-size:42px}.profile-card{min-width:0;padding:16px}.profile-avatar{width:54px;height:54px;font-size:21px}.intro-section{margin:33px 0 19px}.intro-flower{display:none}.action-grid{grid-template-columns:1fr}.action-card{min-height:260px;padding:25px}.footer-note{font-size:10px}}
</style>