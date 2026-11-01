<template>
  <ion-page>
    <ion-header class="rg-header">
      <ion-toolbar class="rg-toolbar">
        <div class="nav-inner">
          <router-link to="/organizer/campaigns" class="brand">Relief<span>GO</span><sup>♥</sup></router-link>
          <router-link to="/organizer/campaigns" class="back-link"><ion-icon :icon="arrowBackOutline" /> <span>BACK TO MY CAMPAIGNS</span></router-link>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rg-content">
      <main class="page-wrapper">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">RELIEFGO · ORGANIZER WORKSPACE</p>
            <h1>Campaign <em>Updates.</em></h1>
            <p>Share the meaningful moments, progress, and stories behind your bayanihan campaign.</p>
          </div>
          <div class="identity">
            <div class="avatar">{{ initials }}</div>
            <div><span class="identity-label">CAMPAIGN ORGANIZER</span><strong>{{ organizerName }}</strong><small>Community updates</small></div>
          </div>
        </section>

        <div v-if="loading" class="state-box top-state">
          <ion-spinner name="crescent" /><p>Loading campaign updates...</p>
        </div>
        <div v-else-if="blockMessage || !campaign" class="state-box top-state">
          <ion-icon :icon="alertCircleOutline" class="state-icon" />
          <h3>Unable to open updates</h3>
          <p>{{ blockMessage || 'Campaign not found.' }}</p>
          <ion-button class="primary-button" router-link="/organizer/campaigns">Back to My Campaigns</ion-button>
        </div>

        <template v-else>
          <section class="campaign-overview">
            <div><p class="eyebrow dark">CURRENT CAMPAIGN</p><h2>{{ campaign.title }}</h2><p>Updates are visible to your donors and the public.</p></div>
            <span class="campaign-tag">{{ campaign.status }}</span>
          </section>

          <section class="stats-row">
            <div class="stat"><ion-icon :icon="newspaperOutline" /><div><span>PUBLISHED UPDATES</span><strong>{{ updates.length }}</strong><small>Shared with your community</small></div></div>
            <div class="stat"><ion-icon :icon="heartOutline" /><div><span>YOUR STORY MATTERS</span><strong>Public</strong><small>Keep supporters informed</small></div></div>
          </section>

          <div class="workspace-grid">
            <section class="composer-panel">
              <div class="panel-heading"><p class="eyebrow dark">SHARE YOUR PROGRESS</p><h2>Write an <em>update.</em></h2><p>Tell supporters what has happened and how their kindness is making a difference.</p></div>
              <div class="form-fields">
                <label class="field-label" for="update-title">Update title</label>
                <ion-input id="update-title" v-model="title" placeholder="e.g. First batch of supplies delivered" fill="outline" :maxlength="120" class="field"></ion-input>
                <label class="field-label" for="update-message">What happened?</label>
                <ion-textarea id="update-message" v-model="message" placeholder="Share the progress, milestones, or a thank-you message..." fill="outline" :auto-grow="true" :rows="5" :maxlength="3000" class="field"></ion-textarea>
                <label class="field-label" for="update-photo">Photo link <span>(optional)</span></label>
                <ion-input id="update-photo" v-model="imageUrl" type="url" placeholder="https://example.com/photo.jpg" fill="outline" :maxlength="1000" class="field"></ion-input>
                <p class="privacy-note"><ion-icon :icon="shieldCheckmarkOutline" /> Do not include faces of minors or private details in photos without permission.</p>
                <div v-if="showPreview" class="preview-frame"><img :src="imageUrl.trim()" alt="Photo preview" class="preview" /><span>PHOTO PREVIEW</span></div>
                <ion-text v-if="errorMessage" color="danger"><p class="error">{{ errorMessage }}</p></ion-text>
                <ion-button class="primary-button submit" expand="block" :disabled="posting" @click="handlePost">
                  <ion-spinner v-if="posting" name="crescent" />
                  <template v-else><ion-icon slot="start" :icon="sendOutline" /> Post update</template>
                </ion-button>
              </div>
            </section>

            <section class="updates-panel">
              <div class="panel-heading"><p class="eyebrow dark">SHARED WITH SUPPORTERS</p><h2>Posted <em>updates.</em></h2><p>{{ updates.length }} update{{ updates.length === 1 ? '' : 's' }} published.</p></div>
              <div v-if="updates.length === 0" class="empty-state">
                <div class="empty-icon"><ion-icon :icon="newspaperOutline" /></div>
                <h3>Your story starts here.</h3>
                <p>You have not posted any updates yet. Share your first milestone with your donors.</p>
              </div>
              <div v-else class="updates-list">
                <article v-for="update in updates" :key="update.id" class="update-card">
                  <img v-if="update.imageUrl" :src="update.imageUrl" :alt="update.title" class="photo" />
                  <div class="update-body">
                    <div class="update-meta"><ion-icon :icon="calendarOutline" /> {{ formatDate(update.createdAt) }} <span class="public-badge">PUBLIC UPDATE</span></div>
                    <h3>{{ update.title }}</h3>
                    <p class="message">{{ update.message }}</p>
                    <div class="update-footer">
                      <span><ion-icon :icon="globeOutline" /> Visible to supporters</span>
                      <ion-button class="delete-button" size="small" fill="outline" color="danger" :disabled="busyId === update.id" @click="handleDelete(update)">
                        <ion-spinner v-if="busyId === update.id" name="crescent" />
                        <template v-else><ion-icon slot="start" :icon="trashOutline" /> Delete</template>
                      </ion-button>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </template>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonContent, IonInput, IonTextarea, IonButton, IonSpinner, IonText, IonIcon, onIonViewWillEnter } from '@ionic/vue';
import { alertCircleOutline, arrowBackOutline, newspaperOutline, heartOutline, shieldCheckmarkOutline, sendOutline, calendarOutline, globeOutline, trashOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getCampaignRecord } from '../services/campaignService';
import { deleteCampaignUpdate, getCampaignUpdates, postCampaignUpdate } from '../services/updateService';
import type { Campaign } from '../models/Campaign';
import { UPDATE_ALLOWED_CAMPAIGN_STATUSES } from '../models/CampaignUpdate';
import type { CampaignUpdate } from '../models/CampaignUpdate';
import { formatDate } from '../utils/format';
import { confirmAction, showToast } from '../utils/ui';

const route = useRoute();
const campaignId = String(route.params.id);
const campaign = ref<Campaign | null>(null);
const updates = ref<CampaignUpdate[]>([]);
const title = ref('');
const message = ref('');
const imageUrl = ref('');
const loading = ref(true);
const posting = ref(false);
const busyId = ref('');
const errorMessage = ref('');
const blockMessage = ref('');
const organizerName = computed(() => currentUser.value?.displayName || 'Organizer');
const initials = computed(() => organizerName.value.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() || '').join('') || 'O');
const showPreview = computed(() => imageUrl.value.trim().startsWith('https://'));

onIonViewWillEnter(async () => {
  const user = currentUser.value;
  blockMessage.value = '';
  errorMessage.value = '';
  if (!user) {
    campaign.value = null;
    blockMessage.value = 'Please sign in to manage campaign updates.';
    loading.value = false;
    return;
  }
  if (!campaign.value) loading.value = true;
  try {
    const record = await getCampaignRecord(campaignId);
    if (!record || record.organizerId !== user.uid) {
      campaign.value = null;
      blockMessage.value = 'Campaign not found.';
    } else if (!UPDATE_ALLOWED_CAMPAIGN_STATUSES.includes(record.status)) {
      campaign.value = null;
      blockMessage.value = 'You can post updates while your campaign is live.';
    } else {
      campaign.value = record;
      updates.value = await getCampaignUpdates(campaignId);
    }
  } catch (error) {
    campaign.value = null;
    blockMessage.value = error instanceof Error ? error.message : 'Could not load the page.';
  } finally {
    loading.value = false;
  }
});

function validate(): string {
  if (title.value.trim().length < 3) return 'The title must be at least 3 characters.';
  if (message.value.trim().length < 5) return 'Please write a message of at least 5 characters.';
  const image = imageUrl.value.trim();
  if (image && !image.startsWith('https://')) return 'The photo link must start with https://';
  return '';
}

async function handlePost() {
  if (posting.value) return;
  errorMessage.value = validate();
  if (errorMessage.value) return;
  const user = currentUser.value;
  if (!user || !campaign.value) return;
  posting.value = true;
  try {
    await postCampaignUpdate(campaign.value, user, {
      title: title.value,
      message: message.value,
      imageUrl: imageUrl.value,
    });
    title.value = '';
    message.value = '';
    imageUrl.value = '';
    updates.value = await getCampaignUpdates(campaignId);
    await showToast('Update posted.');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not post the update.';
  } finally {
    posting.value = false;
  }
}

async function handleDelete(update: CampaignUpdate) {
  if (busyId.value) return;
  const ok = await confirmAction('Delete update', `Delete "${update.title}"? It will no longer be shown on your campaign page.`, 'Delete');
  if (!ok) return;
  busyId.value = update.id;
  try {
    await deleteCampaignUpdate(campaignId, update.id);
    updates.value = await getCampaignUpdates(campaignId);
    await showToast('Update deleted.');
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Could not delete.', 'danger');
  } finally {
    busyId.value = '';
  }
}
</script>

<style scoped>
.rg-header{box-shadow:none}
.rg-toolbar{--background:#fffaf0;--color:#173b2c;--border-width:0;--min-height:75px}
.nav-inner{max-width:1190px;margin:auto;padding:12px 27px;display:flex;align-items:center;justify-content:space-between;gap:15px}
.brand{text-decoration:none;color:#173b2c;font:700 30px Georgia,serif;letter-spacing:-1.4px;white-space:nowrap}
.brand span{color:#c66b46}.brand sup{font:700 12px Arial,sans-serif;color:#dca449;margin-left:3px;vertical-align:top}
.back-link{display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#264b39;font-size:10px;font-weight:800;letter-spacing:1.3px}.back-link ion-icon{font-size:18px}
.rg-content{--background:#f8f3e4;--color:#173b2c}
.page-wrapper{max-width:1190px;margin:0 auto;padding:28px 27px 75px}
.hero{background:linear-gradient(112deg,#153a2a,#1f4b37 70%,#2c583f);border-radius:24px;padding:43px 48px;display:flex;align-items:center;justify-content:space-between;gap:32px;color:#fff8e7;position:relative;overflow:hidden}
.hero:after{content:'✳';position:absolute;right:18%;top:-85px;font-size:260px;color:#ffffff08;pointer-events:none}
.hero-copy{position:relative;z-index:1;max-width:650px}.eyebrow{font-size:10px;font-weight:800;letter-spacing:2px;color:#e8ae4c;margin:0 0 13px}.eyebrow.dark{color:#bb704b}
.hero h1{font:normal clamp(37px,4.5vw,61px)/1.08 Georgia,serif;letter-spacing:-1.4px;margin:0 0 15px}.hero h1 em,.panel-heading h2 em{color:#e8ae4c;font-weight:normal}
.hero-copy>p:last-child{font-size:13px;line-height:1.85;color:#e5e9da;margin:0;max-width:550px}
.identity{display:flex;align-items:center;gap:13px;min-width:210px;position:relative;z-index:1}.avatar{height:58px;width:58px;flex:none;border-radius:50%;background:#e8ae4c;color:#173b2c;display:grid;place-items:center;font:700 23px Georgia,serif}.identity>div:last-child{display:flex;flex-direction:column;gap:5px}.identity-label{font-size:9px;letter-spacing:1.3px;color:#d6cfae;font-weight:800}.identity strong{font-size:13px;color:#fff}.identity small{font-size:11px;color:#c7d6c6}
.campaign-overview{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:31px 4px 21px}.campaign-overview h2{font:normal clamp(27px,3vw,40px)/1.15 Georgia,serif;margin:0 0 9px;overflow-wrap:anywhere}.campaign-overview p:last-child{margin:0;font-size:13px;color:#7c8176}.campaign-tag{background:#e8eddf;color:#32593d;border-radius:99px;padding:9px 14px;font-size:11px;font-weight:800;white-space:nowrap}
.stats-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;margin-bottom:27px}.stat{background:#fffaf0;border:1px solid #e8dcc6;border-radius:17px;padding:23px;display:flex;align-items:center;gap:17px}.stat>ion-icon{font-size:28px;color:#c66b46;background:#f5e8d3;padding:13px;border-radius:13px;flex:none}.stat>div{display:flex;flex-direction:column;gap:5px}.stat span{font-size:10px;font-weight:800;letter-spacing:1.3px;color:#758072}.stat strong{font:normal 30px Georgia,serif;color:#173b2c}.stat small{font-size:11px;color:#8c9185}
.workspace-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start;gap:24px}.composer-panel,.updates-panel{min-width:0}.composer-panel{background:#fffaf0;border:1px solid #e8dcc6;border-radius:20px;padding:30px}.panel-heading{margin-bottom:23px}.panel-heading h2{font:normal clamp(29px,3vw,39px)/1.14 Georgia,serif;margin:0 0 10px}.panel-heading h2 em{color:#c66b46}.panel-heading>p:last-child{color:#778175;font-size:13px;line-height:1.65;margin:0}.form-fields{display:flex;flex-direction:column}.field-label{font-size:12px;font-weight:800;color:#284b37;margin-bottom:8px}.field-label span{font-weight:500;color:#8a9187}.field{--background:#fffdf8;--color:#173b2c;--placeholder-color:#8d9589;--border-color:#dfd4c1;--border-radius:11px;--highlight-color-focused:#c66b46;margin:0 0 20px;font-size:13px}.privacy-note{display:flex;align-items:flex-start;gap:9px;color:#886b3f;background:#fff2d8;border:1px solid #f0dfb9;padding:14px;border-radius:12px;font-size:12px;line-height:1.65;margin:-2px 0 18px}.privacy-note ion-icon{font-size:19px;flex:none;color:#ba8040;margin-top:1px}.preview-frame{position:relative;margin-bottom:18px}.preview{width:100%;height:220px;object-fit:cover;border-radius:13px;display:block}.preview-frame span{position:absolute;left:12px;bottom:12px;background:#153a2acc;color:#fff;padding:7px 10px;border-radius:8px;font-size:9px;font-weight:800;letter-spacing:1px}.error{font-size:12px;line-height:1.6;margin:0 0 14px}.primary-button{--background:#193f2e;--background-hover:#2a5c41;--color:#fffaf0;--border-radius:11px;--box-shadow:none;text-transform:none;font-size:12px;font-weight:800;min-height:45px}.submit{margin:2px 0 0}.submit ion-spinner{width:19px;height:19px}
.updates-panel>.panel-heading{padding:5px 4px 0}.updates-list{display:flex;flex-direction:column;gap:17px}.update-card{overflow:hidden;background:#fffaf0;border:1px solid #e8dcc6;border-radius:18px;box-shadow:0 7px 20px #263c2910}.photo{display:block;width:100%;max-height:265px;object-fit:cover}.update-body{padding:24px}.update-meta{display:flex;flex-wrap:wrap;align-items:center;gap:7px;color:#879084;font-size:11px}.update-meta ion-icon{font-size:15px;color:#bc7752}.public-badge{margin-left:auto;background:#e8eee0;color:#3b6445;border-radius:99px;padding:6px 9px;font-size:9px;font-weight:800;letter-spacing:.6px}.update-body h3{font:normal 25px/1.2 Georgia,serif;margin:15px 0 12px;color:#183c2c;overflow-wrap:anywhere}.message{font-size:13px;line-height:1.8;color:#5f6e62;white-space:pre-line;overflow-wrap:anywhere;margin:0 0 19px}.update-footer{border-top:1px solid #eee2ce;padding-top:15px;display:flex;align-items:center;justify-content:space-between;gap:10px}.update-footer>span{display:inline-flex;align-items:center;gap:6px;color:#899186;font-size:10px}.update-footer>span ion-icon{font-size:16px}.delete-button{--border-radius:9px;--border-color:#e5b5aa;--color:#ad4b3b;font-size:11px;text-transform:none;font-weight:800;margin:0}.delete-button ion-spinner{width:15px;height:15px}.empty-state,.state-box{background:#fffaf0;border:1px solid #e8dcc6;border-radius:18px;padding:50px 22px;text-align:center;color:#68766a}.empty-icon{margin:0 auto 15px;width:67px;height:67px;display:grid;place-items:center;border-radius:50%;background:#f4e6cf;color:#b8744e;font-size:31px}.empty-state h3,.state-box h3{font:normal 25px Georgia,serif;color:#173b2c;margin:0 0 9px}.empty-state p,.state-box p{font-size:13px;line-height:1.7;margin:0 auto 16px;max-width:340px}.state-box .state-icon{font-size:45px;color:#bd704e;margin-bottom:12px}.top-state{margin-top:24px}.state-box ion-spinner{--color:#c66b46;margin-bottom:12px}
@media(max-width:900px){.hero{padding:34px}.identity{min-width:0}.workspace-grid{grid-template-columns:1fr}.updates-panel{margin-top:10px}}
@media(max-width:620px){.nav-inner{padding:11px 17px}.brand{font-size:25px}.back-link{font-size:9px;letter-spacing:.5px}.page-wrapper{padding:17px 15px 55px}.hero{padding:29px 23px;flex-direction:column;align-items:flex-start;gap:23px;border-radius:19px}.hero h1{font-size:40px}.identity .avatar{height:46px;width:46px;font-size:18px}.campaign-overview{align-items:flex-start;flex-direction:column;gap:10px}.stats-row{grid-template-columns:1fr;gap:11px}.stat{padding:18px}.composer-panel{padding:21px 17px}.update-body{padding:19px}.update-footer{flex-wrap:wrap}.back-link span{max-width:115px;text-align:right}}
</style>