<template>
  <ion-page class="rg-users-page">
    <!-- Consistent ReliefGO navbar: logo left, back to admin right. -->
    <ion-header class="users-header">
      <ion-toolbar class="users-toolbar">
        <div class="nav-inner">
          <router-link to="/welcome" class="brand" aria-label="ReliefGO welcome page">
            Relief<span>GO</span><sup>♥</sup>
          </router-link>
          <span class="nav-divider" aria-hidden="true"></span>
          <span class="nav-page-name">USER MANAGEMENT</span>
          <router-link to="/admin" class="back-to-dashboard">
            <ion-icon :icon="arrowBackOutline" />
            BACK TO DASHBOARD
          </router-link>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="users-content">
      <main class="page-wrapper">
        <section class="hero-banner" aria-labelledby="users-page-heading">
          <div class="hero-copy">
            <p class="eyebrow hero-eyebrow">RELIEFGO ADMINISTRATION ✦</p>
            <h1 id="users-page-heading">People behind <em>bayanihan.</em></h1>
            <p>View ReliefGO members, find accounts, and manage access responsibly.</p>
          </div>

          <div class="admin-identity" aria-label="Administrator profile">
            <span class="identity-avatar">{{ adminInitials }}</span>
            <div class="identity-details">
              <span class="eyebrow hero-eyebrow">ADMINISTRATOR ACCOUNT</span>
              <strong>{{ adminName }}</strong>
              <small>Community &amp; account oversight</small>
            </div>
          </div>
        </section>

        <!-- Live values: all are calculated from the existing getAllUsers() result. -->
        <section class="summary-section" aria-label="User account overview">
          <div class="summary-grid">
            <div class="summary-card">
              <ion-icon :icon="peopleOutline" class="summary-icon" />
              <span class="summary-label">REGISTERED USERS</span>
              <strong>{{ users.length }}</strong>
              <small>Total ReliefGO accounts</small>
            </div>
            <div class="summary-card">
              <ion-icon :icon="checkmarkCircleOutline" class="summary-icon" />
              <span class="summary-label">ACTIVE ACCOUNTS</span>
              <strong>{{ activeCount }}</strong>
              <small>Accounts with active access</small>
            </div>
            <div class="summary-card">
              <ion-icon :icon="banOutline" class="summary-icon" />
              <span class="summary-label">SUSPENDED ACCOUNTS</span>
              <strong>{{ suspendedCount }}</strong>
              <small>Access currently restricted</small>
            </div>
          </div>
        </section>

        <section class="directory-section" aria-labelledby="directory-heading">
          <div class="section-head">
            <div>
              <p class="eyebrow">YOUR COMMUNITY DIRECTORY</p>
              <h2 id="directory-heading">Manage <em>accounts.</em></h2>
              <p class="section-description">Search by name or email, then review each member's status.</p>
            </div>
            <div class="results-count" aria-live="polite">
              <ion-icon :icon="peopleOutline" />
              {{ filteredUsers.length }} {{ filteredUsers.length === 1 ? 'ACCOUNT' : 'ACCOUNTS' }} SHOWN
            </div>
          </div>

          <div class="search-panel">
            <label for="user-directory-search" class="field-label">SEARCH USERS</label>
            <ion-searchbar
              id="user-directory-search"
              v-model="searchText"
              class="user-searchbar"
              placeholder="Search by name or email"
              aria-label="Search users by name or email"
              :debounce="200"
              show-clear-button="focus"
            ></ion-searchbar>
            <p class="search-tip">Only regular member accounts may be suspended or reactivated.</p>
          </div>

          <div v-if="loading" class="state-box" role="status">
            <ion-spinner name="crescent" />
            <h3>Gathering member accounts</h3>
            <p>Loading users from ReliefGO...</p>
          </div>

          <div v-else-if="errorMessage" class="state-box error-state" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h3>Something went wrong</h3>
            <p>{{ errorMessage }}</p>
          </div>

          <div v-else-if="filteredUsers.length === 0" class="state-box empty-state">
            <span class="empty-icon"><ion-icon :icon="peopleOutline" /></span>
            <p class="eyebrow">NO MATCHING ACCOUNTS</p>
            <h3>No users found.</h3>
            <p v-if="searchText.trim()">Try searching with a different name or email.</p>
            <p v-else>Accounts will appear here once users register.</p>
          </div>

          <div v-else class="users-grid">
            <article v-for="user in filteredUsers" :key="user.uid" class="user-card" :class="{ 'user-card--suspended': user.isSuspended }">
              <div class="user-card-top">
                <span class="member-avatar" aria-hidden="true">{{ initialsFor(user.displayName) }}</span>
                <div class="member-info">
                  <h3>{{ user.displayName }}</h3>
                  <p class="member-email">{{ user.email }}</p>
                </div>
              </div>

              <div class="badge-row" aria-label="Account role and status">
                <span class="role-badge" :class="{ 'role-badge--admin': user.role === 'admin' }">
                  <ion-icon :icon="user.role === 'admin' ? shieldCheckmarkOutline : personOutline" />
                  {{ roleLabel(user.role) }}
                </span>
                <span class="status-badge" :class="{ 'status-badge--suspended': user.isSuspended }">
                  <span class="status-dot" aria-hidden="true"></span>
                  {{ user.isSuspended ? 'Suspended' : 'Active' }}
                </span>
              </div>

              <div class="member-meta">
                <div v-if="user.phone" class="meta-row">
                  <span><ion-icon :icon="callOutline" /> Mobile</span>
                  <strong>{{ user.phone }}</strong>
                </div>
                <div class="meta-row">
                  <span><ion-icon :icon="calendarOutline" /> Joined</span>
                  <strong>{{ formatDate(user.createdAt) }}</strong>
                </div>
              </div>

              <div class="card-actions">
                <ion-button
                  v-if="canManage(user)"
                  class="manage-button"
                  :class="user.isSuspended ? 'reactivate-button' : 'suspend-button'"
                  :disabled="busyId === user.uid"
                  @click="handleToggle(user)"
                >
                  <ion-icon slot="start" :icon="user.isSuspended ? refreshOutline : banOutline" />
                  {{ busyId === user.uid ? 'Updating...' : user.isSuspended ? 'Reactivate Account' : 'Suspend Account' }}
                </ion-button>
                <p v-else class="protected-note">
                  <ion-icon :icon="lockClosedOutline" />
                  {{ user.uid === currentUser?.uid ? 'This is your account.' : 'Administrator accounts cannot be suspended here.' }}
                </p>
              </div>
            </article>
          </div>
        </section>

        <footer class="page-footer">
          <span>Relief<span class="footer-accent">GO</span> · Community administration</span>
          <span>Every account matters. <b>Every action counts. ♥</b></span>
        </footer>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonSearchbar,
  IonButton,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline,
  arrowBackOutline,
  banOutline,
  calendarOutline,
  callOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
  peopleOutline,
  personOutline,
  refreshOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getAllUsers, setUserSuspended } from '../services/userService';
import type { AppUser, UserRole } from '../models/User';
import { formatDate } from '../utils/format';
import { askReason, confirmAction, showToast } from '../utils/ui';

const users = ref<AppUser[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const searchText = ref('');
const busyId = ref('');

const suspendedCount = computed(() => users.value.filter((u) => u.isSuspended).length);
const activeCount = computed(() => users.value.length - suspendedCount.value);

const adminName = computed(() => currentUser.value?.displayName?.trim() || 'Administrator');
const adminInitials = computed(() => initialsFor(adminName.value));

function initialsFor(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'RG';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

const filteredUsers = computed(() => {
  const term = searchText.value.trim().toLowerCase();
  if (!term) return users.value;
  return users.value.filter(
    (u) => u.displayName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
  );
});

function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Administrator' : 'Member';
}

/** Admins can suspend regular accounts, but not other admins or themselves. */
function canManage(user: AppUser): boolean {
  return user.role !== 'admin' && user.uid !== currentUser.value?.uid;
}

async function loadUsers() {
  errorMessage.value = '';
  try {
    users.value = await getAllUsers();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load users.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(async () => {
  if (users.value.length === 0) loading.value = true;
  await loadUsers();
});

async function handleToggle(user: AppUser) {
  if (user.isSuspended) {
    const ok = await confirmAction(
      'Reactivate account',
      `Allow ${user.displayName} to log in again?`,
      'Reactivate'
    );
    if (!ok) return;
    await runAction(user, '', false, 'Account reactivated.');
    return;
  }

  const reason = await askReason(
    'Suspend account',
    `Why is ${user.displayName}'s account being suspended? They will not be able to log in. Their campaigns stay online unless you suspend them separately.`,
    'Suspend'
  );
  if (!reason) return;
  await runAction(user, reason, true, 'Account suspended.');
}

async function runAction(user: AppUser, reason: string, suspended: boolean, message: string) {
  busyId.value = user.uid;
  try {
    await setUserSuspended(user, suspended, reason);
    await loadUsers();
    await showToast(message);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Action failed.', 'danger');
  } finally {
    busyId.value = '';
  }
}
</script>

<style scoped>
/* Consistent with the ReliefGO Admin Dashboard and Admin Reports design. */
.rg-users-page {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --paper: #fffaf0;
  --gold: #e8ae4c;
  --terracotta: #c66b46;
  --border: #e9ddc7;
  --muted: #697568;
  color: var(--forest);
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.rg-users-page * { box-sizing: border-box; }
.rg-users-page h1, .rg-users-page h2, .rg-users-page h3, .rg-users-page p { margin-top: 0; }
.rg-users-page h1, .rg-users-page h2, .rg-users-page h3, .brand, .summary-card strong { font-family: Georgia, 'Times New Roman', serif; }
.rg-users-page a { color: inherit; text-decoration: none; }

.users-header { box-shadow: none; }
.users-header::after { display: none; }
.users-toolbar {
  --background: #f8f3e4;
  --color: #183c2c;
  --padding-start: 0;
  --padding-end: 0;
  --min-height: 73px;
  border-bottom: 1px solid var(--border);
}
.nav-inner { min-height: 72px; padding: 8px clamp(17px, 3.2vw, 55px); display: flex; align-items: center; gap: 17px; }
.brand { font-size: clamp(25px, 2.1vw, 33px); line-height: 1; letter-spacing: -1.9px; font-weight: 700; white-space: nowrap; }
.brand span, .brand sup { color: var(--terracotta); }
.brand sup { font-size: 12px; margin-left: 2px; vertical-align: top; }
.nav-divider { height: 22px; width: 1px; background: #d9ccb4; }
.nav-page-name { font-size: 10px; letter-spacing: 1.25px; font-weight: 800; white-space: nowrap; }
.back-to-dashboard {
  margin-left: auto; min-height: 39px; display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; border-radius: 24px; border: 1px solid #d9ccb4; padding: 10px 15px;
  font-size: 10px; letter-spacing: .9px; font-weight: 800; white-space: nowrap; transition: background .2s;
}
.back-to-dashboard ion-icon { font-size: 16px; }
.back-to-dashboard:hover { background: #ede4d1; }

.users-content {
  --background: #f8f3e4;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}
.page-wrapper { width: 100%; max-width: 1490px; margin: auto; padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 32px; }
.hero-banner {
  min-height: 237px; border-radius: 22px; overflow: hidden;
  background: radial-gradient(circle at 72% 105%, rgba(232,174,76,.11), transparent 42%), linear-gradient(115deg,#183c2c,#102a20);
  color: #fff8e7; display: flex; align-items: center; justify-content: space-between; gap: 25px;
  padding: clamp(25px, 3.1vw, 49px) clamp(25px, 4vw, 63px);
}
.hero-copy { min-width: 0; max-width: 705px; }
.eyebrow { margin: 0 0 11px; font-size: 10px; font-weight: 800; letter-spacing: 1.8px; color: var(--terracotta); }
.hero-eyebrow { color: var(--gold); }
.hero-banner h1 { font-size: clamp(35px, 3.8vw, 58px); font-weight: 400; line-height: 1.11; letter-spacing: -2.1px; margin-bottom: 13px; }
.hero-banner h1 em { color: var(--gold); font-weight: 400; }
.hero-copy > p:last-child { color: #e1e6d7; font-size: 13px; line-height: 1.8; max-width: 550px; margin: 0; }
.admin-identity {
  display: flex; align-items: center; gap: 16px; flex: 0 0 auto; min-width: 300px; max-width: 420px;
  padding: 17px; border: 1px solid rgba(255,255,255,.21); border-radius: 17px; background: rgba(255,255,255,.07);
}
.identity-avatar { width: 66px; height: 66px; flex: 0 0 66px; display: grid; place-items: center; border-radius: 50%; background: var(--gold); color: var(--deep); font: 700 24px Georgia,serif; }
.identity-details { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.identity-details .eyebrow { font-size: 9px; margin: 0; }
.identity-details strong { font: 500 clamp(18px, 1.5vw, 23px) Georgia,serif; overflow-wrap: anywhere; }
.identity-details small { color: #e1e6d7; font-size: 11px; }

.summary-section { margin-top: 19px; }
.summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 17px; }
.summary-card { background: var(--paper); border: 1px solid var(--border); border-radius: 18px; min-height: 164px; padding: 21px 25px; display: flex; flex-direction: column; align-items: flex-start; }
.summary-icon { font-size: 23px; color: var(--terracotta); margin-bottom: 14px; }
.summary-label { color: var(--terracotta); font-size: 10px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase; }
.summary-card strong { display: block; margin: 5px 0; font-size: clamp(27px, 3vw, 42px); font-weight: 400; letter-spacing: -1px; line-height: 1.2; }
.summary-card small { font-size: 11px; color: var(--muted); }

.directory-section { margin-top: 31px; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; margin-bottom: 21px; }
.section-head h2 { font-weight: 400; font-size: clamp(27px, 2.65vw, 40px); letter-spacing: -1.3px; line-height: 1.1; margin-bottom: 9px; }
.section-head h2 em { color: var(--terracotta); font-weight: 400; }
.section-description { font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 0; }
.results-count { display: inline-flex; align-items: center; gap: 9px; background: var(--paper); border: 1px solid var(--border); border-radius: 99px; padding: 12px 15px; color: var(--forest); font-size: 10px; font-weight: 800; letter-spacing: .5px; white-space: nowrap; }
.results-count ion-icon { color: var(--terracotta); font-size: 17px; }

.search-panel { background: var(--paper); border: 1px solid var(--border); border-radius: 18px; padding: clamp(17px, 2.2vw, 27px); margin-bottom: 21px; }
.field-label { display: block; margin-bottom: 5px; font-size: 10px; font-weight: 800; letter-spacing: 1.3px; color: #536257; }
.user-searchbar {
  --background: #fffdf7;
  --color: var(--forest);
  --placeholder-color: #718074;
  --icon-color: var(--terracotta);
  --clear-button-color: var(--forest);
  --box-shadow: none;
  --border-radius: 11px;
  padding: 0;
  border: 1px solid #d9cbb4;
  border-radius: 11px;
  overflow: hidden;
  min-height: 53px;
}
.user-searchbar::part(container) { min-height: 52px; }
.search-tip { margin: 10px 0 0; color: var(--muted); font-size: 11px; line-height: 1.6; }

.users-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 17px; }
.user-card { min-width: 0; background: var(--paper); border: 1px solid var(--border); border-radius: 19px; padding: clamp(18px, 2vw, 27px); display: flex; flex-direction: column; min-height: 298px; }
.user-card--suspended { border-color: #e2b9a3; background: #fff8ee; }
.user-card-top { display: flex; align-items: center; gap: 14px; min-width: 0; }
.member-avatar { width: 57px; height: 57px; flex: 0 0 57px; display: grid; place-items: center; border-radius: 50%; background: #efe4c8; border: 1px solid #e5d4af; color: var(--forest); font: 700 20px Georgia,serif; }
.member-info { min-width: 0; }
.member-info h3 { font-size: clamp(21px, 1.8vw, 26px); font-weight: 400; letter-spacing: -.45px; margin-bottom: 4px; overflow-wrap: anywhere; }
.member-email { font-size: 12px; color: #667464; margin-bottom: 0; overflow-wrap: anywhere; }
.badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 19px 0 16px; }
.role-badge, .status-badge { min-height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 7px 11px; border: 1px solid #d7decf; border-radius: 999px; font-size: 10px; line-height: 1; font-weight: 800; background: #e9efe6; color: #28503a; }
.role-badge ion-icon { font-size: 14px; }
.role-badge--admin { color: #734b29; background: #f7e6c7; border-color: #ebd7ae; }
.status-badge { background: #eaf2e7; color: #2e6543; }
.status-dot { height: 7px; width: 7px; border-radius: 50%; background: #449862; }
.status-badge--suspended { background: #fbede5; color: #a14832; border-color: #f0d5c7; }
.status-badge--suspended .status-dot { background: #c66b46; }
.member-meta { border-top: 1px solid var(--border); padding-top: 14px; display: flex; flex-direction: column; gap: 11px; }
.meta-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; min-width: 0; font-size: 12px; }
.meta-row > span { display: inline-flex; align-items: center; gap: 7px; flex: 0 0 auto; color: var(--muted); }
.meta-row ion-icon { color: var(--terracotta); font-size: 16px; }
.meta-row strong { min-width: 0; text-align: right; color: var(--forest); font-weight: 700; overflow-wrap: anywhere; }
.card-actions { margin-top: auto; padding-top: 17px; }
.manage-button { --border-radius: 24px; --box-shadow: none; --background: var(--forest); --color: #fffaf0; --padding-start: 17px; --padding-end: 17px; min-height: 43px; font-size: 11px; font-weight: 800; letter-spacing: .2px; text-transform: none; margin: 0; }
.manage-button ion-icon { font-size: 17px; }
.suspend-button { --background: #fff7ee; --color: #9c4b34; --border-width: 1px; --border-style: solid; --border-color: #ddac98; }
.suspend-button:hover { --background: #f5e4d7; }
.reactivate-button:hover { --background: #265640; }
.protected-note { margin: 0; color: #7b766c; font-size: 11px; line-height: 1.6; display: flex; align-items: flex-start; gap: 8px; }
.protected-note ion-icon { font-size: 15px; color: var(--terracotta); flex: 0 0 auto; }

.state-box { padding: 52px 22px; text-align: center; border: 1px solid var(--border); border-radius: 18px; background: var(--paper); color: var(--forest); }
.state-box ion-spinner, .state-icon { color: var(--terracotta); font-size: 39px; }
.state-box h3 { font-size: 25px; font-weight: 400; margin: 15px 0 10px; }
.state-box p { font-size: 13px; color: var(--muted); margin-bottom: 0; line-height: 1.7; }
.error-state .state-icon { color: #af4d3d; }
.empty-icon { display: inline-grid; place-items: center; width: 70px; height: 70px; border-radius: 50%; background: #f4e6ca; color: var(--terracotta); margin-bottom: 18px; }
.empty-icon ion-icon { font-size: 33px; }
.empty-state .eyebrow { font-size: 9px; color: var(--terracotta); }
.empty-state h3 { margin-top: 5px; }
.page-footer { display: flex; justify-content: space-between; gap: 12px; padding: 30px 3px 5px; font-size: 11px; color: var(--muted); }
.page-footer b, .footer-accent { color: var(--terracotta); }

@media (max-width: 950px) {
  .hero-banner { align-items: flex-start; flex-direction: column; gap: 23px; }
  .admin-identity { min-width: 0; width: min(100%,420px); }
  .users-grid { grid-template-columns: 1fr; }
}
@media (max-width: 610px) {
  .nav-inner { min-height: 65px; gap: 9px; padding-inline: 15px; }
  .brand { font-size: 26px; }
  .nav-divider, .nav-page-name { display: none; }
  .back-to-dashboard { font-size: 9px; letter-spacing: .15px; padding: 10px 9px; }
  .back-to-dashboard ion-icon { font-size: 14px; }
  .page-wrapper { padding: 16px 13px 24px; }
  .hero-banner { padding: 25px 21px; min-height: 0; border-radius: 18px; }
  .hero-banner h1 { font-size: clamp(31px, 8vw, 42px); }
  .hero-copy > p:last-child { font-size: 12px; }
  .admin-identity { gap: 11px; padding: 13px; }
  .identity-avatar { width: 52px; height: 52px; flex-basis: 52px; font-size: 18px; }
  .identity-details strong { font-size: 18px; }
  .summary-grid { gap: 9px; }
  .summary-card { min-height: 141px; padding: 15px 13px; }
  .summary-card .summary-icon { font-size: 20px; margin-bottom: 8px; }
  .summary-label { font-size: 9px; letter-spacing: .6px; }
  .summary-card strong { font-size: clamp(22px, 5.8vw, 29px); }
  .summary-card small { font-size: 10px; }
  .directory-section { margin-top: 26px; }
  .section-head { flex-direction: column; align-items: flex-start; }
  .results-count { padding: 9px 12px; }
  .search-panel { padding: 17px 14px; }
  .user-card { min-height: 0; padding: 18px 15px; }
  .member-info h3 { font-size: 22px; }
  .member-avatar { width: 51px; height: 51px; flex-basis: 51px; font-size: 17px; }
  .meta-row { font-size: 11px; }
  .manage-button { width: 100%; }
  .page-footer { flex-direction: column; text-align: center; }
}
@media (max-width: 390px) {
  .summary-grid { grid-template-columns: 1fr; }
  .summary-card { min-height: 119px; }
}
</style>