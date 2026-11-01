<template>
  <ion-page class="relief-login-page">
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-shell">
        <!-- Cream navigation, matching the ReliefGO welcome page -->
        <header class="login-navbar">
          <router-link to="/welcome" class="login-brand" aria-label="ReliefGO home">
            Relief<span>GO</span><b>♥</b>
          </router-link>

          <router-link to="/welcome" class="home-link">
            <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
            <span>BACK TO HOME</span>
          </router-link>
        </header>

        <main class="login-layout">
          <!-- Story panel: reuse your EXISTING ReliefGO illustration -->
          <section class="story-panel" aria-labelledby="story-heading">
            <div class="story-heading">
              <p class="eyebrow">STORIES OF BAYANIHAN</p>
              <h1 id="story-heading">Every act of <em>kindness</em> brings hope closer.</h1>
              <p class="story-description">
                Together, we make relief and compassion reach more Filipino communities.
              </p>
            </div>

            <div class="story-artwork">
              <img
                :src="reliefLogo"
                alt="ReliefGO illustration of Filipino volunteers carrying donations for families"
              />
            </div>

            <div class="story-bottom">
              <span class="story-dot" aria-hidden="true"></span>
              <p>SMALL ACTS. BIG HEARTS.</p>
              <span class="story-rule" aria-hidden="true"></span>
            </div>
          </section>

          <!-- Only the presentation changes: existing login logic is preserved -->
          <section class="form-panel" aria-labelledby="login-heading">
            <div class="form-inner">
              <p class="form-eyebrow">WELCOME TO RELIEFGO <span>✦</span></p>
              <h2 id="login-heading">Welcome <em>back.</em></h2>
              <p class="form-subtitle">
                Log in to donate, manage campaigns, or review submissions.
              </p>

              <form class="login-form" @submit.prevent="handleLogin" novalidate>
                <!-- External labels prevent Ionic's floating/stacked label overlap -->
                <div class="field-group">
                  <label class="field-label" for="login-email">EMAIL ADDRESS</label>
                  <ion-input
                    id="login-email"
                    v-model="email"
                    type="email"
                    aria-label="Email address"
                    fill="outline"
                    placeholder="Enter your email address"
                    autocomplete="email"
                    inputmode="email"
                    class="login-field"
                  ></ion-input>
                </div>

                <div class="field-group">
                  <label class="field-label" for="login-password">PASSWORD</label>
                  <ion-input
                    id="login-password"
                    v-model="password"
                    type="password"
                    aria-label="Password"
                    fill="outline"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    class="login-field"
                    @keyup.enter="handleLogin"
                  >
                    <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                  </ion-input>
                </div>

                <ion-text v-if="errorMessage" color="danger" role="alert" aria-live="polite">
                  <p class="login-error">{{ errorMessage }}</p>
                </ion-text>

                <ion-button
                  type="submit"
                  expand="block"
                  class="submit-button"
                  :disabled="loading"
                >
                  <ion-spinner v-if="loading" name="crescent" aria-label="Logging in" />
                  <template v-else>
                    LOG IN
                    <ion-icon slot="end" :icon="arrowForwardOutline" aria-hidden="true" />
                  </template>
                </ion-button>

                <div class="form-links">
                  <router-link to="/forgot-password">Forgot password?</router-link>
                  <router-link to="/register">Create an account <span aria-hidden="true">↗</span></router-link>
                </div>
              </form>

              <div class="form-divider" aria-hidden="true"><span>♥</span></div>
              <p class="form-footnote">Your next act of kindness starts here.</p>
            </div>
          </section>
        </main>

        <footer class="login-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/vue';
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import reliefLogo from '../assets/images/reliefgo-logo.png';
import { loginUser } from '../services/authService';
import { dashboardPathForRole } from '../utils/roles';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  if (loading.value) return;
  errorMessage.value = '';

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Please enter your email and password.';
    return;
  }

  loading.value = true;
  try {
    const user = await loginUser(email.value, password.value);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '';
    const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '';
    router.replace(safeRedirect || dashboardPathForRole(user.role));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Shared ReliefGO colors from the welcome page */
.relief-login-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --terracotta: #c66b46;
  --gold: #e8ae4c;
  --muted: #667365;
  background: var(--cream);
  color: var(--forest);
}

.login-content {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

.login-content::part(background),
.login-content::part(scroll) {
  background: #f8f3e4;
}

.login-shell {
  width: 100%;
  box-sizing: border-box;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 0 clamp(16px, 3.5vw, 64px);
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.login-shell * { box-sizing: border-box; }
.login-shell a { color: inherit; text-decoration: none; }
.login-shell h1, .login-shell h2, .login-brand { font-family: Georgia, 'Times New Roman', serif; }

/* Compact brand navigation, with the same wordmark as the landing page */
.login-navbar {
  flex: 0 0 78px;
  max-width: 1620px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.login-brand {
  display: inline-flex;
  align-items: flex-start;
  color: var(--forest);
  font-size: clamp(29px, 2.5vw, 36px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
  white-space: nowrap;
}
.login-brand span, .login-brand b { color: var(--terracotta); }
.login-brand b { font-family: Georgia, serif; font-size: 12px; letter-spacing: 0; margin: 0 0 0 2px; }

.home-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid rgba(24, 60, 44, .28);
  border-radius: 999px;
  padding: 12px 16px;
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 800;
  transition: background .2s, color .2s;
}
.home-link ion-icon { font-size: 16px; }
.home-link:hover, .home-link:focus-visible { background: var(--forest); color: #fff8e8; }

/* The two columns are equal-height so there is no big empty white page */
.login-layout {
  flex: 1 0 auto;
  width: 100%;
  max-width: 1620px;
  margin: 0 auto;
  min-height: 590px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
  align-items: stretch;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 55px rgba(29, 57, 36, .08);
}

/* Left: green Bayanihan visual, matching the green editorial sections */
.story-panel {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  padding: clamp(32px, 3vw, 54px) clamp(30px, 4vw, 66px) 27px;
  background: linear-gradient(142deg, var(--forest), var(--deep) 94%);
  color: #fff8e8;
}
.story-panel::before {
  content: '';
  position: absolute;
  z-index: -1;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  left: 15%;
  bottom: -13%;
  background: radial-gradient(circle, rgba(232, 174, 76, .18) 0%, transparent 70%);
  pointer-events: none;
}

.story-heading { position: relative; z-index: 1; }
.eyebrow, .form-eyebrow {
  margin: 0 0 18px;
  font-size: 11px;
  letter-spacing: 2.2px;
  font-weight: 800;
}
.eyebrow { color: var(--gold); }
.story-heading h1 {
  max-width: 620px;
  margin: 0 0 13px;
  font-size: clamp(32px, 3.25vw, 55px);
  line-height: 1.08;
  font-weight: 400;
  letter-spacing: -1.9px;
}
.story-heading h1 em { color: var(--gold); font-weight: 400; }
.story-description {
  max-width: 490px;
  color: #d6dfd0;
  font-size: clamp(12px, .95vw, 15px);
  line-height: 1.65;
  margin: 0;
}
.story-artwork {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: 13px 0 0;
}
.story-artwork img {
  display: block;
  width: min(100%, 535px);
  max-height: min(39dvh, 385px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 12px 18px rgba(0,0,0,.13));
}
.story-bottom {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;
}
.story-bottom p {
  margin: 0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  white-space: nowrap;
}
.story-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
.story-rule { height: 1px; flex: 1; background: rgba(255,248,232,.25); }

/* Right: cream-colored login form, not plain white */
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(30px, 4vw, 68px);
  min-width: 0;
  background: #fff9ed;
  border: 1px solid #e8dfcb;
  border-left: 0;
}
.form-inner { width: 100%; max-width: 445px; min-width: 0; }
.form-eyebrow { color: var(--terracotta); margin-bottom: 20px; }
.form-eyebrow span { color: var(--gold); }
.form-inner h2 {
  font-size: clamp(40px, 3.45vw, 59px);
  line-height: 1.12;
  font-weight: 400;
  letter-spacing: -2px;
  margin: 0 0 17px;
}
.form-inner h2 em { color: var(--terracotta); font-weight: 400; }
.form-subtitle {
  font-size: 14px;
  line-height: 1.65;
  font-weight: 400;
  color: #596b5c;
  margin: 0 0 27px;
  max-width: 390px;
}
/* Separate labels, above the input: no floating text and no border overlap. */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  gap: 9px;
}
.field-label {
  display: block;
  margin: 0;
  padding-left: 2px;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.5;
  letter-spacing: 1.3px;
  color: var(--forest);
}
.login-field {
  display: block;
  width: 100%;
  min-height: 57px;
  margin: 0;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--forest);
  --background: #fffdf7;
  --color: #183c2c;
  --placeholder-color: #899284;
  --placeholder-opacity: 1;
  --border-color: #d6cfbd;
  --border-width: 1px;
  --highlight-color-focused: #c66b46;
  --border-radius: 13px;
  --padding-start: 17px;
  --padding-end: 14px;
  --padding-top: 15px;
  --padding-bottom: 15px;
}
.login-field.ion-focused {
  --border-color: #c66b46;
}
/* Keep the eye-toggle centered, without disturbing password text. */
.login-field ion-input-password-toggle {
  --color: #183c2c;
}
.login-error { font-size: 12px; line-height: 1.5; margin: 0 0 3px; }
.submit-button {
  margin: 5px 0 3px;
  min-height: 52px;
  --background: var(--gold);
  --background-hover: #f0bc62;
  --background-activated: #d99e34;
  --color: #102a20;
  --border-radius: 999px;
  --box-shadow: none;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.2px;
}
.submit-button::part(native) { padding-inline: 23px; }
.submit-button ion-icon { font-size: 18px; }
.form-links {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 10px 0 0;
}
.form-links a { font-size: 12px; color: var(--forest); font-weight: 800; }
.form-links a:hover, .form-links a:focus-visible { color: var(--terracotta); text-decoration: underline; }
.form-divider { display: flex; align-items: center; gap: 13px; margin: 37px 0 13px; color: var(--terracotta); }
.form-divider::before, .form-divider::after { content: ''; height: 1px; flex: 1; background: #e7dbc5; }
.form-divider span { font-size: 14px; }
.form-footnote { font: italic 15px Georgia, serif; text-align: center; color: #6d7a69; margin: 0; }

.login-footer {
  flex: 0 0 52px;
  width: 100%;
  max-width: 1620px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  color: #677768;
  font-size: 11px;
}

@media (max-width: 1000px) {
  .login-layout { grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); }
  .story-panel { padding-inline: 30px; }
  .story-heading h1 { font-size: clamp(32px, 3.4vw, 42px); letter-spacing: -1px; }
  .form-panel { padding-inline: 35px; }
}

@media (max-width: 760px) {
  .login-shell { padding-inline: 15px; }
  .login-navbar { flex-basis: 71px; }
  .login-layout { min-height: 0; grid-template-columns: 1fr; border-radius: 16px; }
  .story-panel { padding: 28px 28px 24px; }
  .story-heading h1 { font-size: clamp(29px, 5vw, 38px); max-width: 520px; }
  .story-heading .eyebrow { margin-bottom: 13px; }
  .story-description { font-size: 12px; }
  .story-artwork, .story-bottom { display: none; }
  .form-panel { border-left: 1px solid #e8dfcb; padding: 40px clamp(20px, 6vw, 46px) 48px; }
  .form-inner h2 { font-size: clamp(36px, 8vw, 48px); }
  .form-subtitle { margin-bottom: 24px; }
}

@media (max-width: 420px) {
  .login-brand { font-size: 28px; }
  .home-link { padding: 10px 11px; font-size: 9px; gap: 5px; }
  .home-link ion-icon { font-size: 14px; }
  .story-panel { padding: 26px 21px 24px; }
  .story-heading h1 { font-size: 30px; }
  .form-panel { padding: 32px 18px 40px; }
  .form-subtitle { font-size: 13px; }
  .login-field { min-height: 54px; font-size: 14px; }
  .field-label { font-size: 10px; }
  .login-footer { font-size: 10px; flex-wrap: wrap; justify-content: center; padding: 15px 0; }
}

@media (prefers-reduced-motion: reduce) {
  .home-link { transition: none; }
}


/* ==============================================================
   FIXED 100dvh AUTH LAYOUT — NO DOCUMENT SCROLL
   Preserves routes, inputs, colors, labels and authentication logic.
   ============================================================== */
.relief-login-page {
  height: 100%;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}
.login-content {
  height: 100%;
  --overflow: hidden;
  --padding-top: 0;
  --padding-bottom: 0;
}
.login-content::part(scroll) {
  height: 100%;
  overflow: hidden !important;
  overscroll-behavior: none;
}
.login-shell {
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  max-height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-rows: clamp(58px, 8dvh, 72px) minmax(0, 1fr) clamp(29px, 4.2dvh, 42px);
  padding-inline: clamp(12px, 3.5vw, 64px);
}
.login-navbar {
  height: 100%;
  min-height: 0;
  flex: none;
}
.login-layout {
  height: 100%;
  min-height: 0;
  max-height: 100%;
  flex: none;
  align-self: stretch;
}
.login-footer {
  height: 100%;
  min-height: 0;
  flex: none;
  line-height: 1.25;
}
.story-panel {
  min-height: 0;
  padding: clamp(17px, 3dvh, 38px) clamp(20px, 3vw, 55px) clamp(14px, 2dvh, 24px);
}
.story-heading h1 {
  font-size: clamp(27px, 3vw, 46px);
  line-height: 1.08;
  margin-bottom: 8px;
}
.story-heading .eyebrow { margin-bottom: 11px; }
.story-description { font-size: clamp(12px, .9vw, 14px); line-height: 1.5; }
.story-artwork {
  min-height: 0;
  overflow: hidden;
  padding-block: 10px;
}
.story-artwork img {
  max-height: min(32dvh, 305px);
  max-width: 100%;
  object-fit: contain;
}
.form-panel {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: clamp(14px, 2.5dvh, 30px) clamp(18px, 3vw, 47px);
}
.form-inner { max-height: 100%; }
.form-eyebrow { margin-bottom: 10px; }
.form-inner h2 {
  font-size: clamp(34px, 3.25vw, 52px);
  line-height: 1.08;
  margin-bottom: 11px;
}
.form-subtitle {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}
.login-form { gap: clamp(10px, 1.6dvh, 16px); }
.field-group { gap: 6px; }
.login-field {
  min-height: 48px;
  --padding-top: 11px;
  --padding-bottom: 11px;
}
.submit-button { min-height: 47px; margin: 2px 0; }
.form-links { margin-top: 5px; }
.form-divider { margin: clamp(14px, 2dvh, 22px) 0 9px; }
.form-footnote { font-size: 13px; }

/* Short laptops: reduce ornament spacing before any content is cut. */
@media (min-width: 761px) and (max-height: 720px) {
  .story-heading h1 { font-size: clamp(26px, 2.7vw, 37px); }
  .story-artwork img { max-height: min(28dvh, 210px); }
  .story-panel { padding-block: 17px; }
  .form-inner h2 { font-size: clamp(30px, 3vw, 42px); }
  .form-subtitle { margin-bottom: 12px; }
  .form-divider { margin-top: 10px; }
  .login-form { gap: 10px; }
  .login-field { min-height: 45px; }
}

/* On mobile keep it fixed too: the green section becomes a slim banner.
   The actual form gets most of the viewport. */
@media (max-width: 760px) {
  .login-shell {
    padding-inline: clamp(9px, 3vw, 16px);
    grid-template-rows: 56px minmax(0, 1fr) 31px;
  }
  .login-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 88px minmax(0, 1fr);
    min-height: 0;
    border-radius: 14px;
  }
  .story-panel {
    height: auto;
    padding: 12px 20px;
    display: flex;
    justify-content: center;
  }
  .story-heading .eyebrow { margin: 0 0 5px; font-size: 9px; }
  .story-heading h1 { font-size: clamp(19px, 5vw, 27px); line-height: 1.1; letter-spacing: -.5px; margin: 0; }
  .story-description, .story-artwork, .story-bottom { display: none; }
  .form-panel {
    min-height: 0;
    padding: clamp(12px, 2.6dvh, 24px) clamp(14px, 5vw, 30px);
    border-left: 1px solid #e8dfcb;
    align-items: center;
  }
  .form-inner h2 { font-size: clamp(30px, 7vw, 41px); }
  .form-subtitle { font-size: 12px; margin-bottom: 14px; }
  .form-eyebrow { font-size: 9px; margin-bottom: 8px; }
  .login-form { gap: 10px; }
  .login-field { min-height: 46px; font-size: 13px; }
  .field-label { font-size: 10px; }
  .submit-button { min-height: 45px; font-size: 12px; }
  .form-divider { margin: 11px 0 8px; }
  .form-footnote { font-size: 12px; }
  .login-footer { padding: 0; flex-wrap: nowrap; font-size: 9px; }
  .login-navbar { height: 100%; }
}
@media (max-width: 420px) {
  .login-brand { font-size: 27px; }
  .home-link { padding: 8px 10px; }
  .form-panel { padding-inline: 16px; }
  .login-footer { justify-content: space-between; }
}
/* Extremely short screens / browser keyboard: enable scrolling ONLY inside
   the form, so controls and error messages remain reachable. */
@media (max-height: 620px) {
  .form-panel { overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; }
}


</style>