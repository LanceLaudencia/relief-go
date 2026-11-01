<template>
  <ion-page class="relief-register-page">
    <ion-content :fullscreen="true" class="register-content">
      <div class="register-shell">
        <!-- Same branding and fonts as the Login and Forgot Password pages -->
        <header class="register-navbar">
          <router-link to="/welcome" class="register-brand" aria-label="ReliefGO home">
            Relief<span>GO</span><b>♥</b>
          </router-link>
          <router-link to="/login" class="home-link">
            <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
            <span>BACK TO LOG IN</span>
          </router-link>
        </header>

        <main class="register-layout">
          <!-- Registration-specific image: community members joining ReliefGO -->
          <section class="story-panel" aria-labelledby="register-story-title">
            <div class="story-heading">
              <p class="eyebrow">WELCOME TO THE RELIEFGO COMMUNITY</p>
              <h1 id="register-story-title">Your story of <em>bayanihan</em> starts here.</h1>
              <p class="story-description">
                Join as a donor or campaign organizer and help bring hope to Filipino families.
              </p>
            </div>

            <div class="story-artwork">
              <img
                :src="registrationIllustration"
                alt="Filipino volunteers welcoming a new ReliefGO member, using a laptop together and preparing relief donations"
                loading="eager"
              />
            </div>

            <div class="story-bottom">
              <span class="story-dot" aria-hidden="true"></span>
              <span>GIVE WITH HEART</span>
              <span class="story-separator">✦</span>
              <span>GROW WITH BAYANIHAN</span>
              <span class="story-rule" aria-hidden="true"></span>
            </div>
          </section>

          <section class="form-panel" aria-labelledby="register-form-title">
            <div class="form-inner">
              <p class="form-eyebrow">CREATE YOUR RELIEFGO ACCOUNT <span>✦</span></p>
              <h2 id="register-form-title">Join <em>ReliefGO.</em></h2>
              <p class="form-subtitle">Create an account to donate or raise funds for relief.</p>

              <form class="register-form" @submit.prevent="handleRegister" novalidate>
                <div class="field-grid">
                  <div class="field-group">
                    <label class="field-label" for="register-name">FULL NAME</label>
                    <ion-input
                      id="register-name"
                      v-model="displayName"
                      aria-label="Full name"
                      placeholder="Enter your full name"
                      autocomplete="name"
                      fill="outline"
                      class="register-field"
                    ></ion-input>
                  </div>

                  <div class="field-group">
                    <label class="field-label" for="register-email">EMAIL ADDRESS</label>
                    <ion-input
                      id="register-email"
                      v-model="email"
                      type="email"
                      inputmode="email"
                      aria-label="Email address"
                      placeholder="Enter your email"
                      autocomplete="email"
                      fill="outline"
                      class="register-field"
                    ></ion-input>
                  </div>

                  <div class="field-group">
                    <label class="field-label" for="register-phone">MOBILE NUMBER <span>(OPTIONAL)</span></label>
                    <ion-input
                      id="register-phone"
                      v-model="phone"
                      type="tel"
                      aria-label="Mobile number optional"
                      placeholder="09XX XXX XXXX"
                      autocomplete="tel"
                      fill="outline"
                      class="register-field"
                    ></ion-input>
                  </div>

                  <div class="field-group">
                    <label class="field-label" for="register-role">I WANT TO JOIN AS</label>
                    <ion-select
                      id="register-role"
                      v-model="role"
                      aria-label="I want to join as"
                      interface="popover"
                      fill="outline"
                      class="register-select"
                    >
                      <ion-select-option value="donor">Donor — I want to donate</ion-select-option>
                      <ion-select-option value="organizer">Organizer — I want to raise funds</ion-select-option>
                    </ion-select>
                  </div>

                  <div class="field-group">
                    <label class="field-label" for="register-password">PASSWORD</label>
                    <ion-input
                      id="register-password"
                      v-model="password"
                      type="password"
                      aria-label="Password"
                      placeholder="At least 8 characters"
                      autocomplete="new-password"
                      fill="outline"
                      class="register-field"
                    >
                      <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                    </ion-input>
                  </div>

                  <div class="field-group">
                    <label class="field-label" for="register-confirm">CONFIRM PASSWORD</label>
                    <ion-input
                      id="register-confirm"
                      v-model="confirmPassword"
                      type="password"
                      aria-label="Confirm password"
                      placeholder="Re-enter password"
                      autocomplete="new-password"
                      fill="outline"
                      class="register-field"
                    >
                      <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                    </ion-input>
                  </div>
                </div>

                <ion-text v-if="errorMessage" color="danger" role="alert" aria-live="assertive">
                  <p class="register-error">{{ errorMessage }}</p>
                </ion-text>

                <ion-button
                  type="submit"
                  expand="block"
                  class="submit-button"
                  :disabled="loading"
                >
                  <ion-spinner v-if="loading" name="crescent" aria-label="Creating account" />
                  <template v-else>
                    CREATE ACCOUNT
                    <ion-icon slot="end" :icon="arrowForwardOutline" aria-hidden="true" />
                  </template>
                </ion-button>
              </form>

              <div class="form-divider" aria-hidden="true"><span>♥</span></div>
              <p class="form-footnote">Every helping hand makes a difference.</p>
            </div>
          </section>
        </main>

        <footer class="register-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/vue';
import { arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import registrationIllustration from '../assets/images/auth/create-account-bayanihan.png';
import { registerUser } from '../services/authService';
import { dashboardPathForRole } from '../utils/roles';

const router = useRouter();
const displayName = ref('');
const email = ref('');
const phone = ref('');
const role = ref<'donor' | 'organizer'>('donor');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');

function validate(): string {
  if (!displayName.value.trim()) return 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    return 'Please enter a valid email address.';
  }
  if (password.value.length < 8) return 'Password must be at least 8 characters.';
  if (password.value !== confirmPassword.value) return 'Passwords do not match.';
  return '';
}

async function handleRegister() {
  if (loading.value) return;
  errorMessage.value = validate();
  if (errorMessage.value) return;

  loading.value = true;
  try {
    const user = await registerUser({
      displayName: displayName.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
      role: role.value,
    });
    router.replace(dashboardPathForRole(user.role));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Registration failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Original ReliefGO palette and fonts, matching Login/Forgot Password. */
.relief-register-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --terracotta: #c66b46;
  --gold: #e8ae4c;
  --muted: #667365;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  background: var(--cream);
  color: var(--forest);
}
.register-content {
  --background: #f8f3e4;
  --color: #183c2c;
  --overflow: hidden;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
  height: 100%;
}
.register-content::part(background),
.register-content::part(scroll) { background: var(--cream); }
.register-content::part(scroll) {
  height: 100%;
  overflow: hidden !important;
  overscroll-behavior: none;
}
.register-shell, .register-shell * { box-sizing: border-box; }
.register-shell {
  height: 100vh;
  height: 100dvh;
  width: 100%;
  min-height: 0;
  max-height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-rows: clamp(56px, 8dvh, 72px) minmax(0, 1fr) clamp(28px, 4dvh, 40px);
  padding-inline: clamp(12px, 3.5vw, 64px);
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.register-shell a { text-decoration: none; color: inherit; }
.register-shell h1, .register-shell h2, .register-brand {
  font-family: Georgia, 'Times New Roman', serif;
}
.register-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 0;
  width: 100%;
  max-width: 1620px;
  margin: 0 auto;
  gap: 15px;
}
.register-brand {
  display: inline-flex;
  align-items: flex-start;
  color: var(--forest);
  font-size: clamp(28px, 2.5vw, 36px);
  line-height: 1;
  letter-spacing: -2px;
  font-weight: 700;
  white-space: nowrap;
}
.register-brand span, .register-brand b { color: var(--terracotta); }
.register-brand b { font-size: 12px; letter-spacing: 0; margin-left: 2px; }
.home-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 1px solid rgba(24,60,44,.28);
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: .85px;
  font-weight: 800;
  white-space: nowrap;
  transition: color .2s, background .2s;
}
.home-link ion-icon { font-size: 16px; }
.home-link:hover, .home-link:focus-visible { color: #fff8e8; background: var(--forest); }

/* Two-column card stays within the viewport instead of making the page longer. */
.register-layout {
  display: grid;
  grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr);
  height: 100%;
  width: 100%;
  max-width: 1620px;
  min-height: 0;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 16px 55px rgba(29,57,36,.08);
}
.story-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: clamp(19px, 3.2dvh, 38px) clamp(20px, 3vw, 52px) clamp(16px, 2.5dvh, 25px);
  color: #fff8e8;
  background: linear-gradient(145deg, var(--forest), var(--deep) 96%);
  overflow: hidden;
}
.story-panel::before {
  content: '';
  position: absolute;
  right: -18%; bottom: -30%;
  width: 75%; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,174,76,.17), transparent 71%);
  pointer-events: none;
}
.story-heading { position: relative; z-index: 1; }
.eyebrow, .form-eyebrow {
  font-size: 10px; letter-spacing: 2px; font-weight: 800;
  margin: 0 0 11px;
}
.eyebrow { color: var(--gold); }
.story-heading h1 {
  max-width: 570px;
  margin: 0 0 10px;
  font-size: clamp(29px, 3vw, 47px);
  line-height: 1.09;
  letter-spacing: -1.2px;
  font-weight: 400;
}
.story-heading h1 em { color: var(--gold); font-weight: 400; }
.story-description {
  max-width: 465px;
  margin: 0;
  color: #d6dfd0;
  font-size: clamp(12px, .92vw, 14px);
  line-height: 1.55;
}
.story-artwork {
  display: grid;
  flex: 1 1 auto;
  min-height: 0;
  place-items: center;
  padding: 12px 0;
}
.story-artwork img {
  display: block;
  width: 100%;
  max-width: 585px;
  max-height: min(43dvh, 400px);
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  object-position: center;
  border-radius: 16px;
  border: 1px solid rgba(255,248,232,.22);
  box-shadow: 0 14px 32px rgba(0,0,0,.18);
}
.story-bottom {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: #fff8e8;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}
.story-dot { flex: 0 0 8px; width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }
.story-separator { color: var(--gold); }
.story-rule { height: 1px; flex: 1; background: rgba(255,248,232,.25); }

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  min-width: 0;
  padding: clamp(15px, 2.6dvh, 32px) clamp(20px, 3.2vw, 58px);
  background: #fff9ed;
  border: 1px solid #e8dfcb;
  border-left: 0;
  overflow-x: hidden;
  overflow-y: auto; /* Only form can scroll on tiny viewports/keyboard */
  overscroll-behavior: contain;
}
.form-inner { width: 100%; max-width: 565px; min-width: 0; margin: auto; }
.form-eyebrow { color: var(--terracotta); margin-bottom: 8px; }
.form-eyebrow span { color: var(--gold); }
.form-inner h2 {
  margin: 0 0 10px;
  font-size: clamp(36px, 3.2vw, 52px);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -1.7px;
}
.form-inner h2 em { color: var(--terracotta); font-weight: 400; }
.form-subtitle {
  max-width: 480px;
  margin: 0 0 clamp(13px, 2dvh, 21px);
  color: #596b5c;
  font-size: 13px;
  line-height: 1.5;
}
.register-form { display: flex; flex-direction: column; gap: clamp(12px, 1.8dvh, 18px); }
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(11px, 1.7dvh, 16px) 13px;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.field-label {
  display: block;
  padding-left: 2px;
  color: var(--forest);
  font: 800 10px/1.45 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  letter-spacing: 1.12px;
}
.field-label span { font-size: 9px; letter-spacing: .25px; color: #71816f; }
.register-field, .register-select {
  display: block;
  width: 100%;
  min-width: 0;
  height: 49px;
  min-height: 49px;
  margin: 0;
  color: var(--forest);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 13px;
  font-weight: 500;
  --background: #fffdf7;
  --color: #183c2c;
  --placeholder-color: #859282;
  --placeholder-opacity: 1;
  --border-color: #d6cfbd;
  --border-width: 1px;
  --highlight-color-focused: #c66b46;
  --border-radius: 12px;
  --padding-start: 12px;
  --padding-end: 7px;
  --padding-top: 9px;
  --padding-bottom: 9px;
}
.register-select { --placeholder-opacity: 1; }
.register-field.ion-focused, .register-select.ion-focused { --border-color: #c66b46; }
.register-field ion-input-password-toggle { --color: #183c2c; }
.register-error { margin: 0; font-size: 12px; line-height: 1.45; }
.submit-button {
  margin: 0;
  min-height: 48px;
  --background: var(--gold);
  --background-hover: #f0bc62;
  --background-activated: #d99e34;
  --color: #102a20;
  --border-radius: 999px;
  --box-shadow: none;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.1px;
}
.submit-button::part(native) { padding-inline: 20px; }
.submit-button ion-icon { font-size: 17px; }
.form-divider { display: flex; gap: 12px; align-items: center; margin: 18px 0 8px; color: var(--terracotta); }
.form-divider::before, .form-divider::after { content: ''; height: 1px; background: #e7dbc5; flex: 1; }
.form-divider span { font-size: 14px; }
.form-footnote { margin: 0; text-align: center; color: #6d7a69; font: italic 14px Georgia, serif; }
.register-footer {
  width: 100%; max-width: 1620px; min-height: 0;
  margin: 0 auto; display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
  color: #677768; font-size: 10px;
}

/* Compact laptops: preserve 2-column form while reducing decoration. */
@media (max-width: 1100px) and (min-width: 761px) {
  .register-layout { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); }
  .story-panel { padding-inline: 24px; }
  .story-heading h1 { font-size: clamp(29px, 3.3vw, 40px); }
  .form-panel { padding-inline: clamp(16px, 2.6vw, 30px); }
  .form-inner h2 { font-size: clamp(35px, 4vw, 44px); }
  .field-grid { column-gap: 9px; }
  .register-field, .register-select { --padding-start: 9px; font-size: 12px; }
}
@media (min-width: 761px) and (max-height: 700px) {
  .story-panel { padding-block: 15px; }
  .story-heading h1 { font-size: clamp(27px, 2.6vw, 37px); }
  .story-artwork img { max-height: 29dvh; }
  .form-panel { padding-block: 10px; }
  .form-inner h2 { font-size: clamp(31px, 3vw, 42px); margin-bottom: 6px; }
  .form-subtitle { margin-bottom: 11px; }
  .register-form { gap: 10px; }
  .field-grid { row-gap: 9px; }
  .register-field, .register-select { height: 43px; min-height: 43px; }
  .submit-button { min-height: 42px; }
  .form-divider { margin-top: 10px; }
}

/* Mobile: fixed page shell, mini story banner, scroll only within form if needed. */
@media (max-width: 760px) {
  .register-shell {
    padding-inline: clamp(9px, 3vw, 16px);
    grid-template-rows: 56px minmax(0, 1fr) 30px;
  }
  .register-layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 94px minmax(0, 1fr);
    border-radius: 14px;
  }
  .story-panel { padding: 12px 18px; justify-content: center; }
  .story-heading .eyebrow { font-size: 9px; margin-bottom: 5px; }
  .story-heading h1 { font-size: clamp(21px, 5vw, 28px); letter-spacing: -.5px; margin: 0; }
  .story-description, .story-artwork, .story-bottom { display: none; }
  .form-panel { border-left: 1px solid #e8dfcb; padding: 18px clamp(14px, 5vw, 29px); align-items: flex-start; }
  .form-inner h2 { font-size: clamp(31px, 7.5vw, 43px); }
  .form-eyebrow { font-size: 9px; }
  .form-subtitle { font-size: 12px; }
  .register-field, .register-select { min-height: 45px; height: 45px; }
  .register-footer { font-size: 9px; }
}
@media (max-width: 540px) {
  .field-grid { grid-template-columns: minmax(0, 1fr); gap: 11px; }
  .register-form { gap: 13px; }
  .register-field, .register-select { min-height: 46px; height: 46px; font-size: 13px; }
  .submit-button { min-height: 46px; }
  .form-divider { margin: 14px 0 8px; }
}
@media (max-width: 420px) {
  .register-brand { font-size: 27px; }
  .home-link { padding: 8px 10px; font-size: 9px; gap: 5px; }
  .home-link ion-icon { font-size: 14px; }
  .register-footer { justify-content: space-between; font-size: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .home-link { transition: none; }
}
</style>