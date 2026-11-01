<template>
  <ion-page class="welcome-page">
    <ion-content :fullscreen="true" :scroll-y="true" class="welcome-content">
      <div class="site">
        <header class="navbar">
          <button
            class="menu-toggle"
            type="button"
            :aria-expanded="menuOpen"
            aria-label="Toggle navigation"
            @click="menuOpen = !menuOpen"
          >
            <ion-icon :icon="menuOpen ? closeOutline : menuOutline" />
          </button>

          <a class="brand" href="#home" @click.prevent="scrollToSection('home')">
            Relief<span>GO</span><b>♥</b>
          </a>

          <nav class="desktop-nav" :class="{ 'nav-open': menuOpen }" aria-label="Main navigation">
            <a href="#home" @click.prevent="scrollToSection('home')">HOME</a>
            <router-link to="/campaigns" @click="menuOpen = false">CAMPAIGNS</router-link>
            <a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')">HOW IT WORKS</a>
            <a href="#about" @click.prevent="scrollToSection('about')">ABOUT US</a>
            <a href="#transparency" @click.prevent="scrollToSection('transparency')">TRANSPARENCY</a>
          </nav>

          <div class="nav-actions">
            <ion-button v-if="currentUser" class="nav-button" size="small" :router-link="dashboardPath">
              Dashboard
            </ion-button>
            <template v-else>
              <ion-button class="login-button" fill="outline" size="small" router-link="/login">
                Log In
              </ion-button>
              <ion-button class="nav-button" size="small" router-link="/register">
                Join ReliefGO
              </ion-button>
            </template>
          </div>
        </header>

        <div class="layout-frame">
          <main class="page-main">
            <section id="home" class="hero">
                <aside class="side-rail" aria-label="ReliefGO quick links">
                  <span class="rail-label">RELIEFGO</span>
                  <router-link to="/campaigns" title="Campaigns" aria-label="Go to campaigns">
                    <ion-icon :icon="heartOutline" />
                  </router-link>
                  <a href="#how-it-works" title="How it works" aria-label="Go to how it works" @click.prevent="scrollToSection('how-it-works')">
                    <ion-icon :icon="peopleOutline" />
                  </a>
                  <a href="#transparency" title="Transparency" aria-label="Go to transparency" @click.prevent="scrollToSection('transparency')">
                    <ion-icon :icon="shieldCheckmarkOutline" />
                  </a>
                  <span class="rail-bottom">BAYANIHAN</span>
                </aside>

              <aside class="side-rail right-rail" aria-hidden="true"></aside>
              <span class="hero-watermark" aria-hidden="true">BAYANIHAN</span>

              <div class="hero-main">
                <div class="hero-visual">
                  <div class="hero-orbit" aria-hidden="true"></div>
                  <span class="hero-image-kicker">STORIES THAT MOVE US</span>
                  <img
                    class="hero-logo"
                    :src="reliefLogo"
                    alt="ReliefGO: volunteers delivering essential donations to Filipino communities"
                  />
                  <span class="hero-image-caption">SMALL ACTS. BIG HEARTS.</span>
                </div>

                <div class="hero-copy" aria-live="polite">
                  <p class="eyebrow">FEATURED CAUSE · {{ featuredCampaign.category }}</p>
                  <h1>{{ featuredCampaign.title }}</h1>
                  <p class="hero-description">{{ featuredCampaign.description }}</p>

                  <div class="hero-funding">
                    <small>FUNDRAISING PROGRESS <span>· SAMPLE DATA</span></small>
                    <strong>{{ formatPeso(featuredCampaign.raised) }}</strong>
                    <p>raised of {{ formatPeso(featuredCampaign.goal) }} goal</p>
                    <ion-progress-bar
                      class="campaign-progress"
                      :value="calculateProgress(featuredCampaign.raised, featuredCampaign.goal)"
                    />
                  </div>

                  <ion-button class="gold-button" router-link="/campaigns">
                    EXPLORE CAMPAIGNS
                    <ion-icon slot="end" :icon="arrowForwardOutline" />
                  </ion-button>
                </div>
              </div>

              <div class="hero-secondary-links">
                <a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')"><span>＋</span> HOW IT WORKS</a>
                <a href="#campaigns" @click.prevent="scrollToSection('campaigns')"><span>＋</span> CAMPAIGN GALLERY</a>
                <a href="#transparency" @click.prevent="scrollToSection('transparency')"><span>＋</span> DONATION TRANSPARENCY</a>
              </div>

              <div class="hero-slider">
                <button class="slider-side" type="button" @click="previousCampaign" aria-label="Previous campaign">
                  <ion-icon :icon="chevronBackOutline" />
                  <span>{{ previousCampaignTitle }}</span>
                </button>
                <div class="slider-dots" aria-label="Select a featured campaign">
                  <button
                    v-for="(campaign, index) in sampleCampaigns"
                    :key="campaign.id"
                    type="button"
                    :class="{ active: activeCampaignIndex === index }"
                    :aria-label="`Show ${campaign.title}`"
                    :aria-pressed="activeCampaignIndex === index"
                    @click="activeCampaignIndex = index"
                  ></button>
                </div>
                <button class="slider-side slider-next" type="button" @click="nextCampaign" aria-label="Next campaign">
                  <span>{{ nextCampaignTitle }}</span>
                  <ion-icon :icon="chevronForwardOutline" />
                </button>
              </div>
            </section>

            <!-- REPOSITIONED FOUR KEY VALUE STATEMENTS -->
            <section class="values-strip" aria-label="Why ReliefGO">
              <router-link to="/campaigns" class="value-item">
                <ion-icon :icon="heartOutline" />
                <div><h3>Give with Heart</h3><p>Support meaningful relief campaigns.</p></div>
              </router-link>
              <router-link :to="trackingRoute" class="value-item">
                <ion-icon :icon="trendingUpOutline" />
                <div><h3>Track Progress</h3><p>Follow fundraising goals and updates.</p></div>
              </router-link>
              <a href="#transparency" class="value-item" @click.prevent="scrollToSection('transparency')">
                <ion-icon :icon="shieldCheckmarkOutline" />
                <div><h3>Promote Transparency</h3><p>Review available reports and proof.</p></div>
              </a>
              <router-link :to="joinRoute" class="value-item">
                <ion-icon :icon="peopleOutline" />
                <div><h3>Share Bayanihan</h3><p>Help communities move forward together.</p></div>
              </router-link>
            </section>

            <section id="about" class="about-section">
              <div class="about-banner">
                <span>RELIEFGO</span>
                <h2>STORIES OF <em>BAYANIHAN</em></h2>
                <p>Fundraising with compassion. Giving with transparency.</p>
              </div>
              <div class="about-layout">
                <div class="about-intro">
                  <p class="eyebrow light-eyebrow">ABOUT US</p>
                  <h3>Every act of kindness tells a story.</h3>
                </div>
                <div class="about-copy">
                  <p>
                    ReliefGO brings Filipinos together to support communities in need,
                    track donations, and witness the impact of every helping hand.
                  </p>
                  <p>
                    Inspired by the Filipino spirit of bayanihan, this platform is designed
                    to make online relief fundraising more accessible, organized, and transparent.
                  </p>
                  <a href="#how-it-works" class="light-link" @click.prevent="scrollToSection('how-it-works')">DISCOVER HOW IT WORKS <ion-icon :icon="arrowForwardOutline" /></a>
                </div>
                <div class="about-image-panel">
                  <img :src="aboutBayanihanImage" alt="Bayanihan volunteers and families helping one another" />
                  <span>TOGETHER, WE CAN MAKE HOPE GROW.</span>
                </div>
              </div>
            </section>

            <section id="campaigns" class="section campaigns-section">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">MAKE A DIFFERENCE</p>
                  <h2>Causes worth <em>caring for.</em></h2>
                  <p>Explore relief efforts and the communities they aim to help.</p>
                </div>
                <ion-button fill="outline" class="outline-button" router-link="/campaigns">
                  VIEW ALL CAMPAIGNS
                  <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>
              </div>

              <div class="campaign-grid">
                <article v-for="campaign in sampleCampaigns" :key="campaign.id" class="campaign-card">
                  <div class="campaign-image" :class="campaign.theme">
                    <img
                      class="campaign-photo"
                      :src="campaign.image"
                      :alt="campaign.title"
                    />
                    <div class="campaign-image-overlay" aria-hidden="true"></div>
                    <span class="image-label">{{ campaign.category }}</span>
                  </div>
                  <div class="campaign-body">
                    <span class="demo-label">ILLUSTRATIVE EXAMPLE</span>
                    <h3>{{ campaign.title }}</h3>
                    <p>{{ campaign.description }}</p>
                    <div class="campaign-amount">
                      <strong>{{ formatPeso(campaign.raised) }}</strong>
                      <span>of {{ formatPeso(campaign.goal) }}</span>
                    </div>
                    <ion-progress-bar
                      class="campaign-progress"
                      :value="calculateProgress(campaign.raised, campaign.goal)"
                    />
                    <div class="campaign-bottom">
                      <span>{{ Math.round(calculateProgress(campaign.raised, campaign.goal) * 100) }}% funded</span>
                      <ion-button fill="clear" router-link="/campaigns">
                        EXPLORE <ion-icon slot="end" :icon="arrowForwardOutline" />
                      </ion-button>
                    </div>
                  </div>
                </article>
              </div>
              <p class="demo-notice">
                These are sample campaigns for design demonstration, not live fundraisers.
                Actual campaigns and donation records will appear once connected to your data.
              </p>
            </section>

            <section id="how-it-works" class="features-section">
              <div class="features-heading">
                <p class="eyebrow light-eyebrow">THE RELIEFGO JOURNEY</p>
                <h2>How <em>kindness</em> travels.</h2>
                <p>From a first donation to the final impact report, follow the journey of every helping hand.</p>
              </div>
              <div class="feature-gallery">
                <button
                  v-for="(step, index) in steps"
                  :key="step.number"
                  type="button"
                  class="feature-card"
                  :class="{ 'is-active': activeStepIndex === index }"
                  :aria-pressed="activeStepIndex === index"
                  @click="activeStepIndex = index"
                >
                  <span class="feature-number">{{ step.number }}</span>
                  <img class="feature-illustration" :src="step.image" :alt="step.title" loading="lazy" />
                  <strong>{{ step.title }}</strong>
                  <small>{{ activeStepIndex === index ? 'SELECTED FEATURE' : 'TAP TO VIEW' }}</small>
                </button>
              </div>
              <div class="feature-detail" aria-live="polite">
                <button type="button" @click="previousStep" aria-label="Previous feature">
                  <ion-icon :icon="chevronBackOutline" />
                </button>
                <div>
                  <span>FEATURE {{ steps[activeStepIndex].number }} / 04</span>
                  <h3>{{ steps[activeStepIndex].title }}</h3>
                  <p>{{ steps[activeStepIndex].description }}</p>
                </div>
                <button type="button" @click="nextStep" aria-label="Next feature">
                  <ion-icon :icon="chevronForwardOutline" />
                </button>
              </div>
              <ion-button class="gold-button" @click="openSelectedJourney">
                START YOUR BAYANIHAN JOURNEY
                <ion-icon slot="end" :icon="arrowForwardOutline" />
              </ion-button>
            </section>

            <section id="transparency" class="section transparency-section">
              <div class="transparency-copy">
                <p class="eyebrow">BUILT AROUND ACCOUNTABILITY</p>
                <h2>Every peso has <em>a purpose.</em></h2>
                <p>
                  ReliefGO is designed to make relief fundraising easier to understand.
                  Donors should be able to see campaign goals, track progress, and review
                  evidence of how support is used.
                </p>
                <div class="transparency-points">
                  <div><ion-icon :icon="checkmarkCircleOutline" /><span>Clear fundraising goals and progress</span></div>
                  <div><ion-icon :icon="checkmarkCircleOutline" /><span>Campaign updates and supporting documentation</span></div>
                  <div><ion-icon :icon="checkmarkCircleOutline" /><span>Donation and distribution accountability</span></div>
                </div>
                <ion-button fill="outline" router-link="/campaigns" class="outline-button">
                  EXPLORE CAMPAIGN TRANSPARENCY
                </ion-button>
              </div>
              <div class="transparency-preview">
                <div class="preview-header">
                  <div><span class="preview-kicker">TRANSPARENCY PREVIEW</span><h3>Sample Relief Campaign</h3></div>
                  <ion-icon :icon="shieldCheckmarkOutline" />
                </div>
                <p class="preview-subtitle">Demonstration data only</p>
                <div class="preview-amount"><strong>{{ formatPeso(raised) }}</strong><span>raised of {{ formatPeso(goal) }}</span></div>
                <ion-progress-bar class="campaign-progress" :value="progress" />
                <div class="preview-stats">
                  <div><strong>{{ Math.round(progress * 100) }}%</strong><span>Goal funded</span></div>
                  <div><strong>{{ formatPeso(goal - raised) }}</strong><span>Still needed</span></div>
                </div>
                <div class="preview-divider"></div>
                <div class="proof-row"><ion-icon :icon="documentTextOutline" /><div><strong>Donation Records</strong><span>Track recorded contributions</span></div></div>
                <div class="proof-row"><ion-icon :icon="imagesOutline" /><div><strong>Photos & Updates</strong><span>See available campaign documentation</span></div></div>
                <div class="proof-row"><ion-icon :icon="receiptOutline" /><div><strong>Distribution Reports</strong><span>Review available proof of delivery</span></div></div>
              </div>
            </section>

            <section class="closing-section">
              <div class="closing-art"><img :src="reliefLogo" alt="ReliefGO Stories of Bayanihan" /></div>
              <div class="closing-copy">
                <p class="eyebrow light-eyebrow">THE SPIRIT OF BAYANIHAN</p>
                <h2>Together, we can make <em>hope grow.</em></h2>
                <p>
                  Bayanihan is more than a tradition. It is the belief that no one
                  should face hardship alone. Join a community where every helping hand matters.
                </p>
                <ion-button class="gold-button" :router-link="joinRoute">
                  BE PART OF THE STORY <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>
              </div>
            </section>

            <footer class="footer">
              <div class="footer-top">
                <div class="footer-brand">
                  <h2>Relief<span>GO</span> ♥</h2>
                  <p>Stories of bayanihan live here.</p>
                  <small>Online Relief Fundraising and Donation Transparency</small>
                </div>
                <div class="footer-links">
                  <div><h4>Explore</h4><a href="#home" @click.prevent="scrollToSection('home')">Home</a><router-link to="/campaigns">Campaigns</router-link><a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')">How It Works</a></div>
                  <div><h4>ReliefGO</h4><a href="#about" @click.prevent="scrollToSection('about')">About Us</a><a href="#transparency" @click.prevent="scrollToSection('transparency')">Transparency</a><router-link to="/campaigns">Support a Cause</router-link></div>
                  <div><h4>Get Involved</h4><router-link to="/register">Create an Account</router-link><router-link to="/login">Log In</router-link><router-link to="/campaigns">Browse Campaigns</router-link></div>
                </div>
              </div>
              <div class="footer-bottom">
                <span>© {{ new Date().getFullYear() }} ReliefGO. All rights reserved.</span>
                <span>Made with ♥ for Filipino communities.</span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, IonProgressBar } from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
  heartOutline, arrowForwardOutline, shieldCheckmarkOutline,
  trendingUpOutline, peopleOutline,
  checkmarkCircleOutline, documentTextOutline, imagesOutline,
  receiptOutline, waterOutline, fastFoodOutline, homeOutline,
  menuOutline, closeOutline, chevronBackOutline, chevronForwardOutline,
} from 'ionicons/icons';

import reliefLogo from '../assets/images/reliefgo-logo.png';
import aboutBayanihanImage from '../assets/images/about/bayanihan-community-support.png';
import disasterReliefImage from '../assets/images/campaigns/hope-amid-the-flood-relief-effort.png';
import foodAssistanceImage from '../assets/images/campaigns/golden-hour-community-relief.png';
import recoveryImage from '../assets/images/campaigns/community-rebuild-under-tropical-skies.png';
import chooseCauseImage from '../assets/images/journey/choose-a-cause.png';
import makeDonationImage from '../assets/images/journey/make-a-donation.png';
import trackVerifyImage from '../assets/images/journey/track-and-verify.png';
import seeImpactImage from '../assets/images/journey/see-the-impact.png';
import { formatPeso, calculateProgress } from '../utils/format';
import { currentUser } from '../services/authState';
import { dashboardPathForRole } from '../utils/roles';

const menuOpen = ref(false);
const router = useRouter();
const dashboardPath = computed(() =>
  currentUser.value ? dashboardPathForRole(currentUser.value.role) : '/login'
);

// Relevant existing routes for each account type; visitors can review public progress.
const trackingRoute = computed(() => {
  const user = currentUser.value;
  if (!user) return '/campaigns';
  if (user.role === 'donor') return '/donor/donations';
  if (user.role === 'organizer') return '/organizer/campaigns';
  return dashboardPathForRole(user.role);
});

const joinRoute = computed(() => currentUser.value ? '/campaigns' : '/register');

// Ionic scrolls inside ion-content. Subtract the sticky navbar height so the
// target section remains visible and users can click HOME at any time.
async function scrollToSection(sectionId: string) {
  menuOpen.value = false;
  await nextTick();

  const content = document.querySelector('ion-content.welcome-content') as HTMLIonContentElement | null;
  const target = document.getElementById(sectionId);
  if (!content || !target) return;

  try {
    const scrollElement = await content.getScrollElement();
    const navbar = document.querySelector('.welcome-page .navbar') as HTMLElement | null;
    const headerHeight = navbar?.getBoundingClientRect().height ?? 72;

    // Always return to the absolute top for HOME, rather than leaving a gap.
    const destination = sectionId === 'home'
      ? 0
      : target.getBoundingClientRect().top
          - scrollElement.getBoundingClientRect().top
          + scrollElement.scrollTop
          - headerHeight - 12;
    await content.scrollToPoint(0, Math.max(0, destination), 350);
  } catch {
    // Fallback if the Ionic scrolling API is unavailable.
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const sampleCampaigns = [
  {
    id: 1,
    title: 'Typhoon Relief for Filipino Families',
    description: 'Help families affected by severe storms access food, water, and daily necessities.',
    category: 'DISASTER RELIEF',
    theme: 'theme-disaster',
    image: disasterReliefImage,
    raised: 128500,
    goal: 200000,
  },
  {
    id: 2,
    title: 'Food Packs for Communities',
    description: 'Support the preparation and distribution of essential food packs for families in need.',
    category: 'FOOD ASSISTANCE',
    theme: 'theme-food',
    image: foodAssistanceImage,
    raised: 75300,
    goal: 100000,
  },
  {
    id: 3,
    title: 'Help Rebuild Homes',
    description: 'Contribute toward rebuilding safer homes for families recovering from disasters.',
    category: 'RECOVERY',
    theme: 'theme-rebuild',
    image: recoveryImage,
    raised: 210000,
    goal: 300000,
  },
];

const activeCampaignIndex = ref(0);
const featuredCampaign = computed(() => sampleCampaigns[activeCampaignIndex.value]!);
const previousCampaignTitle = computed(() =>
  sampleCampaigns[(activeCampaignIndex.value + sampleCampaigns.length - 1) % sampleCampaigns.length]!.category
);
const nextCampaignTitle = computed(() =>
  sampleCampaigns[(activeCampaignIndex.value + 1) % sampleCampaigns.length]!.category
);
function previousCampaign() {
  activeCampaignIndex.value = (activeCampaignIndex.value + sampleCampaigns.length - 1) % sampleCampaigns.length;
}
function nextCampaign() {
  activeCampaignIndex.value = (activeCampaignIndex.value + 1) % sampleCampaigns.length;
}

const steps = [
  { number: '01', title: 'Choose a Cause', description: 'Browse available campaigns and discover where help is needed.', image: chooseCauseImage },
  { number: '02', title: 'Make a Donation', description: 'Contribute through the donation methods supported by the campaign.', image: makeDonationImage },
  { number: '03', title: 'Track & Verify', description: 'Monitor campaign progress and check available updates.', image: trackVerifyImage },
  { number: '04', title: 'See the Impact', description: 'View supporting documentation and stories of community relief.', image: seeImpactImage },
];
const activeStepIndex = ref(1);
function previousStep() {
  activeStepIndex.value = (activeStepIndex.value + steps.length - 1) % steps.length;
}
function nextStep() {
  activeStepIndex.value = (activeStepIndex.value + 1) % steps.length;
}

// The four gallery cards still select and preview a step; this existing CTA
// now opens a destination related to the currently selected step.
function openSelectedJourney() {
  const index = activeStepIndex.value;
  if (index === 2) {
    void router.push(trackingRoute.value); // Track & Verify: donation or campaign history.
  } else {
    // Choose a Cause / Make a Donation / See the Impact:
    // Choose a REAL public campaign first (the featured examples are demo data).
    void router.push('/campaigns');
  }
}

const goal = 50000;
const raised = 42000;
const progress = calculateProgress(raised, goal);
</script>

<style scoped>
.welcome-content { --background: #f8f3e4; --color: #18392b; }
.site {
  --forest: #183c2c;
  --deep: #102a20;
  --cream: #f8f3e4;
  --terracotta: #c66b46;
  --gold: #e8ae4c;
  --muted: #667365;
  --page-gutter: clamp(18px, 4.5vw, 72px);
  color: var(--forest);
  background: var(--cream);
  font-family: 'DM Sans', sans-serif;
  /* 'clip' keeps the decorative artwork inside without blocking sticky positioning. */
  overflow: clip;
  width: 100%;
  min-height: 100dvh;
}
* { box-sizing: border-box; }
a { color: inherit; text-decoration: none; }
button { font: inherit; }
h1, h2, h3, p { margin-top: 0; }
h1, h2, h3, .brand, .footer-brand h2 { font-family: Georgia, 'Times New Roman', serif; }
.eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 2.5px; color: var(--terracotta); margin: 0 0 17px; }
.light-eyebrow { color: #e6b969; }
.section { width: 100%; max-width: none; margin: 0; padding: 76px clamp(26px, 5vw, 80px); }
.section h2 { font-size: clamp(30px, 3.3vw, 48px); font-weight: 400; line-height: 1.1; letter-spacing: -2px; }
.section h2 em, .features-section h2 em, .closing-section h2 em { color: var(--terracotta); font-weight: 400; }

.navbar {
  height: 72px; width: 100%; max-width: none; margin: 0; padding: 0 clamp(18px, 2.2vw, 38px);
  display: flex; align-items: center; gap: 28px;
  border-bottom: 1px solid #e9dfc9;
  /* Keep the menu accessible while scrolling through Welcome sections. */
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--cream);
}
.menu-toggle { border: 0; background: transparent; color: var(--forest); font-size: 25px; padding: 8px; cursor: pointer; display: flex; }
.brand { font-size: 31px; font-weight: bold; letter-spacing: -2px; white-space: nowrap; }
.brand span, .brand b { color: var(--terracotta); }
.brand b { font-size: 14px; vertical-align: top; margin-left: 2px; }
.desktop-nav { display: flex; align-items: center; gap: clamp(12px, 2vw, 31px); margin-left: auto; }
.desktop-nav a { font-size: 10px; font-weight: 800; letter-spacing: .55px; white-space: nowrap; }
.desktop-nav a:hover, .desktop-nav a:focus-visible { color: var(--terracotta); }
.nav-actions { display: flex; gap: 5px; align-items: center; margin-left: 9px; }
.nav-button, .login-button, .outline-button { --border-radius: 30px; --box-shadow: none; text-transform: none; font-weight: 800; }
.nav-button { --background: var(--forest); --color: white; }
.login-button, .outline-button { --color: var(--forest); --border-color: var(--forest); --border-width: 1px; }

/* Keep section headings visible when fallback native scrolling is used. */
#home, #campaigns, #how-it-works, #about, #transparency {
  scroll-margin-top: 92px;
}

.layout-frame { width: 100%; max-width: none; margin: 0; display: block; }
.side-rail {
  position: absolute;
  top: 0;
  bottom: 58px; /* above the full-width campaign slider */
  left: 0;
  z-index: 4;
  width: clamp(54px, 4.5vw, 72px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  border-right: 1px solid #e9dfc9;
  padding: 32px 0;
  color: var(--forest);
}
.right-rail {
  left: auto;
  right: 0;
  border-right: 0;
  border-left: 1px solid #e9dfc9;
  pointer-events: none;
}
.side-rail a { font-size: 21px; display: flex; transition: transform .2s, color .2s; }
.side-rail a:hover { transform: translateY(-3px); color: var(--terracotta); }
.rail-label, .rail-bottom { font-size: 9px; font-weight: 800; letter-spacing: 3px; writing-mode: vertical-rl; }
.rail-label { margin-bottom: 20px; }
.rail-bottom { margin-top: 25px; color: var(--terracotta); }
.page-main { min-width: 0; width: 100%; }

.hero { min-height: 0; position: relative; overflow: hidden; isolation: isolate; }
.hero-watermark {
  position: absolute; top: 42px; left: 2%; z-index: -1;
  font-family: Georgia, serif; font-size: clamp(100px, 16vw, 245px);
  line-height: 1; font-weight: 900; letter-spacing: -12px;
  color: var(--forest); opacity: .065; white-space: nowrap; pointer-events: none;
}
.hero-main {
  min-height: clamp(385px, calc(100dvh - 215px), 525px);
  padding: 35px clamp(80px, 7vw, 125px) 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
  gap: clamp(20px, 3vw, 48px);
  align-items: center;
}
.hero-visual { min-width: 0; position: relative; display: flex; justify-content: center; align-items: center; min-height: 320px; }
.hero-orbit { position: absolute; width: 80%; aspect-ratio: 1; border-radius: 50%; background: #edddb9; filter: blur(50px); opacity: .5; }
.hero-logo { display: block; width: 100%; max-width: 540px; object-fit: contain; position: relative; z-index: 1; filter: drop-shadow(0 18px 15px rgba(37,57,31,.10)); }
.hero-image-kicker, .hero-image-caption { position: absolute; z-index: 2; font-size: 10px; letter-spacing: 2.1px; font-weight: 800; color: var(--forest); }
.hero-image-kicker { top: 5px; left: 5%; }
.hero-image-caption { bottom: 4px; right: 6%; color: var(--terracotta); }
.hero-copy { position: relative; z-index: 2; padding: 15px 0; }
.hero-copy h1 { font-size: clamp(30px, 3vw, 47px); line-height: 1.02; letter-spacing: -2.2px; font-weight: 500; margin-bottom: 21px; max-width: 550px; }
.hero-description { color: #526657; line-height: 1.8; font-size: 13px; max-width: 470px; margin-bottom: 20px; }
.hero-funding { margin-bottom: 24px; max-width: 380px; }
.hero-funding small { display: block; font-size: 10px; font-weight: 800; letter-spacing: 1.1px; margin-bottom: 9px; }
.hero-funding small span { color: var(--terracotta); }
.hero-funding strong { font-size: clamp(22px, 2.4vw, 34px); }
.hero-funding p { font-size: 12px; color: var(--muted); margin: 4px 0 12px; }
.gold-button { --background: var(--gold); --color: #1c291d; --border-radius: 30px; --box-shadow: none; font-size: 11px; font-weight: 800; letter-spacing: .5px; min-height: 45px; }
.gold-button:hover { --background: #f0bc62; }
.hero-secondary-links { padding: 0 clamp(80px, 7vw, 125px) 18px; display: flex; gap: clamp(10px, 3vw, 45px); flex-wrap: wrap; }
.hero-secondary-links a { font-size: 10px; font-weight: 800; letter-spacing: 1px; }
.hero-secondary-links a span { color: var(--terracotta); font-size: 16px; vertical-align: -1px; }
.hero-secondary-links a:hover { color: var(--terracotta); }
.hero-slider {
  min-height: 58px; background: var(--forest); color: #fff7e6;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 24px;
}
.slider-side { background: transparent; border: 0; color: inherit; display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 12px 6px; justify-self: start; font-size: 11px; letter-spacing: .3px; text-align: left; }
.slider-side ion-icon { font-size: 26px; color: var(--gold); flex-shrink: 0; }
.slider-next { justify-self: end; text-align: right; }
.slider-side:hover { color: var(--gold); }
.slider-dots { display: flex; gap: 10px; align-items: center; }
.slider-dots button { border: 0; background: #fff7e6; border-radius: 50%; width: 6px; height: 6px; opacity: .35; padding: 0; cursor: pointer; }
.slider-dots button.active { opacity: 1; width: 9px; height: 9px; background: var(--gold); }

.values-strip { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid #e9dfc9; }
.value-item { padding: 28px 17px; display: flex; align-items: flex-start; gap: 11px; border-right: 1px solid #e9dfc9; }
.value-item:last-child { border-right: 0; }
.value-item ion-icon { font-size: 27px; flex-shrink: 0; color: var(--terracotta); }
.value-item h3 { font-size: 16px; font-weight: 500; margin: 0 0 7px; }
.value-item p { color: var(--muted); font-size: 11px; line-height: 1.6; margin: 0; }
.value-item:hover h3 { color: var(--terracotta); }

.about-section { background: var(--deep); color: #fff8e8; }
.about-banner {
  padding: 72px 7% 50px;
  background: linear-gradient(110deg, var(--forest), var(--deep));
  border-bottom: 1px solid rgba(255,255,255,.18);
  position: relative; overflow: hidden;
}
.about-banner > span { position: absolute; right: -10px; top: -37px; font-family: Georgia, serif; font-size: clamp(85px, 16vw, 250px); font-weight: 900; letter-spacing: -8px; color: #fff8e8; opacity: .06; }
.about-banner h2 { font-size: clamp(33px, 4vw, 58px); letter-spacing: -2px; font-weight: 500; line-height: 1.1; position: relative; }
.about-banner h2 em { color: var(--gold); font-weight: 400; }
.about-banner p { color: #d6dfd0; font-size: 13px; margin: 0; position: relative; }
.about-layout { display: grid; grid-template-columns: .75fr 1.3fr 1fr; gap: 38px; padding: 45px 7% 65px; align-items: start; }
.about-intro h3 { font-size: clamp(22px, 2.25vw, 32px); line-height: 1.3; font-weight: 400; }
.about-copy p { color: #d6dfd0; line-height: 1.9; font-size: 13px; }
.light-link { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; letter-spacing: .5px; color: var(--gold); border-bottom: 1px solid var(--gold); padding: 8px 0; }
.about-image-panel img { display: block; width: 100%; max-height: 185px; object-fit: contain; }
.about-image-panel { border: 1px solid rgba(255,255,255,.15); padding: 9px 15px 15px; background: var(--forest); }
.about-image-panel span { display: block; text-align: center; font-size: 9px; letter-spacing: 1.3px; color: #d6dfd0; margin-top: 7px; }

.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 34px; }
.section-heading h2 { margin-bottom: 10px; }
.section-heading p:not(.eyebrow) { color: var(--muted); font-size: 13px; }
.campaign-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 23px; }
.campaign-card { background: #fffdf5; border: 1px solid #e9dfc9; border-radius: 13px; overflow: hidden; box-shadow: 0 8px 20px rgba(31,53,33,.05); transition: transform .2s; }
.campaign-card:hover { transform: translateY(-5px); }
.campaign-image { height: 215px; position: relative; overflow: hidden; padding: 0; margin: 0; }
.campaign-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
.campaign-image-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(16, 42, 32, .35), rgba(16, 42, 32, .08) 45%, rgba(16, 42, 32, .02)); }
.theme-disaster { background: linear-gradient(135deg,#658d8d,#2d626b); }
.theme-food { background: linear-gradient(135deg,#d8ae67,#a7733b); }
.theme-rebuild { background: linear-gradient(135deg,#93a679,#486c4e); }
.image-label { position: absolute; bottom: 15px; left: 16px; background: #fff8e8; border-radius: 18px; padding: 7px 11px; font-size: 10px; font-weight: 800; letter-spacing: .5px; z-index: 1; }
.campaign-body { padding: 22px; }
.demo-label { color: #a16d43; letter-spacing: 1.3px; font-weight: 800; font-size: 9px; }
.campaign-body h3 { font-size: 23px; font-weight: 500; margin: 10px 0; min-height: 54px; }
.campaign-body > p { font-size: 12px; line-height: 1.75; color: var(--muted); min-height: 63px; }
.campaign-amount { display: flex; align-items: baseline; flex-wrap: wrap; gap: 7px; margin: 17px 0 12px; }
.campaign-amount strong { font-size: 17px; }
.campaign-amount span { font-size: 11px; color: var(--muted); }
.campaign-progress { --background: #e5eadb; --progress-background: #3d8852; height: 9px; border-radius: 10px; }
.campaign-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 11px; font-weight: 800; }
.campaign-bottom ion-button { --color: var(--forest); text-transform: none; font-size: 11px; }
.demo-notice { text-align: center; font-size: 11px; line-height: 1.7; color: #7e7d70; margin: 28px 0 0; }

.features-section { background: var(--deep); color: #fff8e8; text-align: center; padding: 85px 5% 80px; }
.features-heading { margin-bottom: 39px; }
.features-heading h2 { font-size: clamp(33px, 3.7vw, 52px); font-weight: 400; margin-bottom: 13px; }
.features-heading > p:last-child { color: #cbd9c9; font-size: 13px; line-height: 1.7; }
.feature-gallery { display: flex; align-items: center; justify-content: center; gap: 14px; max-width: 1120px; margin: 0 auto 35px; }
.feature-card {
  cursor: pointer; color: #fff8e8; background: var(--forest);
  border: 1px solid rgba(255,255,255,.14); border-radius: 25px;
  padding: 25px 10px; min-width: 0; flex: 1; min-height: 200px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 13px;
  opacity: .65; transition: transform .25s, opacity .25s, box-shadow .25s;
}
.feature-card.is-active { transform: scale(1.09); opacity: 1; position: relative; z-index: 2; background: #f7e8c8; color: var(--forest); box-shadow: 0 18px 30px rgba(0,0,0,.18); }
.feature-card ion-icon { font-size: clamp(32px, 4.5vw, 63px); color: var(--gold); }
.feature-card.is-active ion-icon { color: var(--terracotta); }
.feature-number { font-size: 10px; letter-spacing: 2px; font-weight: 800; }
.feature-card strong { font-size: clamp(12px, 1.3vw, 17px); }
.feature-card small { font-size: 9px; letter-spacing: 1px; }
.feature-detail { display: grid; grid-template-columns: 40px minmax(0, 580px) 40px; gap: 22px; justify-content: center; align-items: center; margin: 0 auto 27px; }
.feature-detail > button { background: transparent; border: 1px solid rgba(255,255,255,.3); color: var(--gold); border-radius: 50%; width: 40px; height: 40px; display: grid; place-items: center; cursor: pointer; }
.feature-detail > button:hover { background: var(--forest); }
.feature-detail span { color: var(--gold); font-weight: 800; font-size: 10px; letter-spacing: 2px; }
.feature-detail h3 { font-size: 24px; font-weight: 400; margin: 7px 0; }
.feature-detail p { font-size: 12px; line-height: 1.8; color: #cbd9c9; margin-bottom: 0; }

.transparency-section { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .95fr); gap: clamp(35px, 6vw, 90px); align-items: center; }
.transparency-copy > p:not(.eyebrow) { font-size: 13px; line-height: 1.9; color: var(--muted); }
.transparency-points { margin: 28px 0; }
.transparency-points div { display: flex; align-items: center; gap: 12px; margin: 15px 0; font-size: 12px; font-weight: 700; }
.transparency-points ion-icon { font-size: 21px; color: #448953; flex-shrink: 0; }
.transparency-preview { border: 1px solid #e9dfc9; padding: 35px; background: #fffdf5; border-radius: 18px; box-shadow: 0 15px 45px rgba(29,55,35,.08); }
.preview-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; }
.preview-header > ion-icon { font-size: 34px; color: #428c58; }
.preview-kicker { color: var(--terracotta); font-weight: 800; font-size: 10px; letter-spacing: 1.3px; }
.preview-header h3 { font-size: 24px; font-weight: 400; margin: 8px 0; }
.preview-subtitle { color: var(--muted); font-size: 12px; margin-bottom: 30px; }
.preview-amount { display: flex; align-items: baseline; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }
.preview-amount strong { font-size: 27px; }
.preview-amount span { color: var(--muted); font-size: 12px; }
.preview-stats { display: grid; grid-template-columns: 1fr 1fr; margin-top: 22px; gap: 20px; }
.preview-stats div, .proof-row div { display: flex; flex-direction: column; gap: 4px; }
.preview-stats strong { font-size: 23px; }
.preview-stats span { color: var(--muted); font-size: 11px; }
.preview-divider { background: #e9dfc9; height: 1px; margin: 28px 0; }
.proof-row { display: flex; align-items: center; gap: 15px; margin: 17px 0; }
.proof-row ion-icon { font-size: 22px; color: #468455; background: #edf3e7; padding: 11px; border-radius: 12px; }
.proof-row strong { font-size: 13px; }
.proof-row span { color: var(--muted); font-size: 11px; }

.closing-section { display: grid; grid-template-columns: .72fr 1fr; gap: 60px; align-items: center; background: var(--forest); color: #fff8e8; padding: 70px 12%; }
.closing-art img { display: block; width: 100%; max-width: 330px; margin: auto; }
.closing-copy h2 { font-size: clamp(32px, 3.7vw, 50px); line-height: 1.13; font-weight: 400; }
.closing-copy > p:not(.eyebrow) { color: #d6dfd0; font-size: 13px; line-height: 1.9; max-width: 530px; }
.footer { background: var(--cream); padding: 62px 6% 25px; }
.footer-top { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 65px; }
.footer-brand h2 { font-size: 36px; letter-spacing: -2px; margin-bottom: 10px; }
.footer-brand h2 span { color: var(--terracotta); }
.footer-brand p { font-family: Georgia, serif; font-style: italic; }
.footer-brand small { color: var(--muted); font-size: 11px; }
.footer-links { display: flex; gap: clamp(22px, 4vw, 75px); }
.footer-links div { display: flex; flex-direction: column; gap: 13px; }
.footer-links h4 { font-size: 13px; margin: 0 0 10px; }
.footer-links a { font-size: 12px; color: #526657; }
.footer-links a:hover { color: var(--terracotta); }
.footer-bottom { border-top: 1px solid #d8cdb5; padding-top: 23px; display: flex; justify-content: space-between; gap: 15px; color: #6b7567; font-size: 11px; }

@media (min-width: 861px) {
  .desktop-nav.nav-open {
    position: absolute; top: 76px; left: 20px; margin-left: 0; z-index: 30;
    display: flex; flex-direction: column; align-items: stretch; gap: 0;
    padding: 14px 24px; min-width: 220px;
    background: var(--cream); border: 1px solid #e9dfc9;
    box-shadow: 0 15px 25px rgba(0,0,0,.08);
  }
  .desktop-nav.nav-open a { padding: 12px 0; }
}

@media (max-width: 1120px) {
  .navbar { gap: 16px; padding: 0 21px; }
  .desktop-nav { gap: 13px; }
  .desktop-nav a { font-size: 9px; }
  .side-rail { width: 54px; }
  .hero-main { padding-left: 75px; padding-right: 75px; gap: 3%; }
  .hero-copy h1 { font-size: clamp(29px, 3.2vw, 41px); }
  .about-layout { gap: 23px; }
  .value-item { padding: 22px 10px; }
}
@media (max-width: 860px) {
  .navbar { height: 73px; }
  .desktop-nav {
    display: none; position: absolute; z-index: 30; top: 73px; left: 0; right: 0;
    flex-direction: column; align-items: stretch; background: var(--cream);
    border-bottom: 1px solid #e9dfc9; padding: 18px 27px; gap: 0;
    box-shadow: 0 12px 20px rgba(0,0,0,.07);
  }
  .desktop-nav.nav-open { display: flex; }
  .desktop-nav a { padding: 13px 0; font-size: 12px; }
  .nav-actions { margin-left: auto; }
  .layout-frame { display: block; }
  .side-rail { display: none; }
  .hero-main { grid-template-columns: 1fr 1fr; padding: 38px 5% 25px; }
  .hero-visual { min-height: 260px; }
  .hero-copy h1 { font-size: clamp(29px, 4vw, 39px); }
  .hero-description { font-size: 12px; }
  .hero-watermark { letter-spacing: -6px; }
  .values-strip { grid-template-columns: repeat(2, 1fr); }
  .value-item:nth-child(2) { border-right: 0; }
  .value-item:nth-child(-n+2) { border-bottom: 1px solid #e9dfc9; }
  .about-layout { grid-template-columns: 1fr 1.2fr; }
  .about-image-panel { grid-column: 1 / -1; max-width: 420px; width: 100%; justify-self: center; }
  .section { padding: 80px 30px; }
  .campaign-grid { gap: 12px; }
  .campaign-body { padding: 16px; }
  .campaign-body h3 { font-size: 20px; }
  .closing-section { padding: 65px 7%; }
  .footer-top { flex-direction: column; }
}
@media (max-width: 600px) {
  .navbar { height: 69px; padding: 0 12px; gap: 9px; }
  .desktop-nav { top: 69px; }
  .brand { font-size: 26px; }
  .nav-actions { gap: 0; }
  .nav-actions ion-button { font-size: 10px; margin-inline: 1px; }
  .hero-main { grid-template-columns: 1fr; padding: 30px 20px 32px; gap: 6px; }
  .hero-visual { min-height: 240px; }
  .hero-logo { max-width: 410px; }
  .hero-image-kicker, .hero-image-caption { font-size: 8px; }
  .hero-copy { text-align: center; }
  .hero-copy h1 { font-size: clamp(30px, 8vw, 39px); margin-left: auto; margin-right: auto; }
  .hero-description, .hero-funding { margin-left: auto; margin-right: auto; }
  .hero-secondary-links { justify-content: center; gap: 13px; padding: 0 12px 19px; }
  .hero-secondary-links a { font-size: 9px; }
  .hero-slider { min-height: 63px; padding: 0 9px; }
  .slider-side { gap: 2px; font-size: 9px; max-width: 110px; }
  .slider-side ion-icon { font-size: 19px; }
  .slider-dots { gap: 8px; }
  .hero-watermark { font-size: 88px; top: 60px; }
  .values-strip { grid-template-columns: 1fr 1fr; }
  .value-item { flex-direction: column; padding: 17px 12px; }
  .value-item h3 { font-size: 15px; }
  .about-banner { padding: 53px 22px 35px; }
  .about-banner h2 { font-size: 40px; }
  .about-layout { grid-template-columns: 1fr; padding: 35px 22px 47px; gap: 17px; }
  .about-image-panel { grid-column: auto; }
  .section { padding: 67px 22px; }
  .section-heading { align-items: flex-start; flex-direction: column; }
  .campaign-grid { grid-template-columns: 1fr; max-width: 490px; margin: auto; gap: 20px; }
  .campaign-body h3, .campaign-body > p { min-height: 0; }
  .features-section { padding: 65px 15px; }
  .feature-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .feature-card { min-height: 155px; padding: 18px 8px; border-radius: 18px; }
  .feature-card.is-active { transform: scale(1.03); }
  .feature-card strong { font-size: 13px; }
  .feature-detail { grid-template-columns: 30px minmax(0, 1fr) 30px; gap: 9px; }
  .feature-detail > button { width: 30px; height: 30px; }
  .transparency-section { grid-template-columns: 1fr; }
  .transparency-preview { padding: 23px; }
  .closing-section { grid-template-columns: 1fr; text-align: center; gap: 22px; padding: 55px 23px; }
  .closing-art img { max-width: 230px; }
  .closing-copy > p:not(.eyebrow) { margin-left: auto; margin-right: auto; }
  .footer { padding: 50px 25px 24px; }
  .footer-links { flex-wrap: wrap; justify-content: space-between; gap: 25px; }
  .footer-bottom { flex-direction: column; }
}

:global(html:has(.welcome-page)),
:global(body:has(.welcome-page)) {
  background-color: #f8f3e4;
}

.welcome-page {
  background: #f8f3e4;
}
.welcome-content {
  --background: #f8f3e4;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}
.welcome-content::part(background) {
  background: #f8f3e4;
}
.welcome-content::part(scroll) {
  background-color: #f8f3e4;
}
.site,
.layout-frame,
.page-main {
  background-color: var(--cream);
}

.hero-slider,
.about-section,
.features-section,
.closing-section {
  width: calc(100% - var(--page-gutter) - var(--page-gutter));
  max-width: none;
  margin-left: var(--page-gutter);
  margin-right: var(--page-gutter);
}

@media (min-width: 1121px) {
  .side-rail {
    width: var(--page-gutter);
  }
}

.footer {
  background: var(--cream);
  padding-bottom: max(36px, env(safe-area-inset-bottom));
}

@media (max-width: 860px) {
  .site {
    --page-gutter: clamp(12px, 3vw, 24px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-card, .campaign-card, .side-rail a { transition: none; }
}

@media (min-width: 861px) {
  .site {
    --reliefgo-navbar-height: 72px;
  }

  .navbar {
    height: var(--reliefgo-navbar-height);
  }

  .hero {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - var(--reliefgo-navbar-height));
    min-height: calc(100dvh - var(--reliefgo-navbar-height));
  }

  .hero-main {
    flex: 1 1 auto;
    min-height: 0;
    padding: clamp(18px, 2.5vh, 32px)
             clamp(78px, 6.7vw, 116px)
             clamp(8px, 1.5vh, 18px);
    grid-template-columns: minmax(0, 1.07fr) minmax(0, .93fr);
    gap: clamp(20px, 3vw, 46px);
    align-items: center;
  }

  .hero-visual {
    min-height: 0;
    max-height: 100%;
  }

  .hero-logo {
    width: 100%;
    max-width: 590px;
    max-height: min(51dvh, 470px);
    object-fit: contain;
  }

  .hero-copy {
    min-width: 0;
    padding: 8px 0;
  }

  .hero-copy h1 {
    font-size: clamp(30px, 2.6vw, 44px);
    line-height: 1.08;
    letter-spacing: -1.5px;
    margin-bottom: 16px;
    max-width: 580px;
  }

  .hero-description {
    font-size: clamp(12px, .9vw, 14px);
    line-height: 1.65;
    margin-bottom: 17px;
  }

  .hero-funding {
    margin-bottom: 16px;
  }

  .hero-funding strong {
    font-size: clamp(24px, 2.1vw, 30px);
  }

  .hero-funding p {
    margin-bottom: 10px;
  }

  .gold-button {
    min-height: 42px;
  }

  .hero-secondary-links {
    flex: 0 0 auto;
    padding: 6px clamp(78px, 6.7vw, 116px) 14px;
    gap: clamp(12px, 2.2vw, 34px);
  }

  .hero-secondary-links a {
    font-size: 10px;
    letter-spacing: .65px;
  }

  .hero-slider {
    flex: 0 0 clamp(58px, 8dvh, 72px);
    min-height: clamp(58px, 8dvh, 72px);
  }

  .side-rail {
    bottom: clamp(58px, 8dvh, 72px);
  }

  .hero-watermark {
    font-size: clamp(105px, 14.5vw, 230px);
  }
}

@media (min-width: 861px) and (max-width: 1120px) {
  .hero-main {
    padding-left: 75px;
    padding-right: 75px;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 20px;
  }

  .hero-logo {
    max-height: min(47dvh, 390px);
  }

  .hero-copy h1 {
    font-size: clamp(27px, 3.2vw, 38px);
    letter-spacing: -1px;
  }

  .hero-secondary-links {
    padding-left: 75px;
    padding-right: 75px;
  }
}

@media (min-width: 861px) and (max-height: 740px) {
  .hero-main {
    padding-top: 10px;
    padding-bottom: 6px;
  }

  .hero-logo {
    max-height: min(45dvh, 365px);
  }

  .hero-copy h1 {
    font-size: clamp(27px, 2.45vw, 37px);
    margin-bottom: 10px;
  }

  .hero-copy .eyebrow {
    margin-bottom: 10px;
  }

  .hero-description {
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .hero-funding {
    margin-bottom: 11px;
  }

  .hero-funding p {
    margin-bottom: 8px;
  }

  .hero-secondary-links {
    padding-top: 0;
    padding-bottom: 8px;
  }
}

@media (max-width: 860px) {
  .hero {
    min-height: 0;
    display: block;
  }

  .hero-main {
    min-height: 0;
  }
}

.values-strip {
  width: calc(100% - 2 * var(--page-gutter));
  margin-inline: var(--page-gutter);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-left: 1px solid #e9dfc9;
  border-right: 1px solid #e9dfc9;
  background: var(--cream);
}
.value-item {
  min-width: 0;
  gap: clamp(10px, 1vw, 17px);
  padding: 23px clamp(12px, 1.6vw, 26px);
}
.value-item > div { min-width: 0; }
.value-item h3 { font-size: clamp(14px, 1.1vw, 18px); line-height: 1.25; overflow-wrap: break-word; }
.value-item p { font-size: clamp(11px, .78vw, 13px); line-height: 1.55; overflow-wrap: break-word; }

.hero-watermark,
.about-banner > span {
  display: none;
}

.hero-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  gap: 8px;
  overflow: visible;
}
.hero-image-kicker,
.hero-image-caption {
  position: static;
  z-index: 2;
  display: block;
  width: auto;
  max-width: 100%;
  line-height: 1.45;
  white-space: normal;
  overflow-wrap: anywhere;
}
.hero-image-kicker {
  align-self: flex-start;
  margin: 0 0 0 5%;
  color: var(--forest);
}
.hero-image-caption {
  align-self: flex-end;
  margin: 0 5% 0 0;
  color: var(--terracotta);
  text-align: right;
}
.hero-logo {
  display: block;
  width: min(100%, 675px);
  height: auto;
  max-width: 675px;
  max-height: none;
  object-fit: contain;
  flex: 0 1 auto;
}
.hero-copy { min-width: 0; }
.hero-copy h1 {
  max-width: 100%;
  line-height: 1.14;
  letter-spacing: -.9px;
  overflow-wrap: normal;
  hyphens: none;
}
.hero-description,
.hero-funding,
.hero-copy .eyebrow { max-width: 100%; overflow-wrap: break-word; }
.hero-copy .eyebrow { line-height: 1.5; }

.about-layout {
  grid-template-columns: minmax(0, .72fr) minmax(0, 1.18fr) minmax(0, 1.18fr);
  gap: clamp(22px, 2.7vw, 44px);
  align-items: start;
}
.about-layout > * { min-width: 0; }
.about-intro h3 { overflow-wrap: break-word; }
.about-copy p { overflow-wrap: break-word; }
.about-image-panel { min-width: 0; padding: 14px 16px 16px; }
.about-image-panel img {
  display: block;
  width: 100%;
  max-width: 100%;
  max-height: 265px;
  height: auto;
  object-fit: contain;
}
.about-image-panel span { line-height: 1.5; overflow-wrap: break-word; }
.closing-art img { max-width: 400px; }

.hero-main > *,
.campaign-grid > *,
.transparency-section > *,
.closing-section > * { min-width: 0; }
.hero-secondary-links { align-items: center; }
.hero-secondary-links a { line-height: 1.6; }

@media (min-width: 1121px) {
  .hero-main {
    grid-template-columns: minmax(0, 1.17fr) minmax(0, .83fr);
    gap: clamp(24px, 2.3vw, 40px);
    padding-left: clamp(88px, 6.1vw, 118px);
    padding-right: clamp(88px, 6.1vw, 118px);
  }
  .hero-logo {
    max-width: 675px;
    max-height: min(57dvh, 525px);
  }
  .hero-copy h1 { font-size: clamp(29px, 2.5vw, 43px); }
}

@media (min-width: 861px) and (max-width: 1120px) {
  .hero-main {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
    gap: 20px;
  }
  .hero-logo { max-width: 580px; max-height: min(52dvh, 445px); }
  .hero-copy h1 { font-size: clamp(28px, 3.1vw, 39px); }
  .about-layout { gap: 20px; }
  .about-image-panel img { max-height: 225px; }
}

@media (min-width: 861px) and (max-height: 740px) {
  .hero-visual { gap: 4px; }
  .hero-logo { max-height: min(49dvh, 390px); }
  .hero-image-kicker, .hero-image-caption { font-size: 9px; }
  .hero-copy h1 { line-height: 1.13; }
}

@media (max-width: 860px) {
  .values-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hero-visual { gap: 7px; }
  .hero-logo { width: min(100%, 580px); max-height: none; }
  .hero-copy h1 { line-height: 1.15; }
  .about-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: 20px;
  }
  .about-image-panel { grid-column: 1 / -1; width: min(100%, 520px); }
  .about-image-panel img { max-height: 270px; }
}

@media (max-width: 600px) {
  .values-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .value-item { padding: 17px 12px; }
  .value-item h3 { font-size: 14px; }
  .value-item p { font-size: 11px; }
  .hero-image-kicker { align-self: center; margin: 0; text-align: center; }
  .hero-image-caption { align-self: center; margin: 0; text-align: center; }
  .hero-logo { width: min(100%, 460px); max-height: none; }
  .hero-copy h1 { font-size: clamp(29px, 7vw, 38px); }
  .about-layout { grid-template-columns: 1fr; }
  .about-image-panel { grid-column: auto; width: 100%; }
  .about-image-panel img { max-height: 265px; }
  .closing-art img { max-width: min(88%, 320px); }
}

@media (min-width: 861px) {
  .hero {
    --hero-slider-height: clamp(76px, 9.4dvh, 88px);
  }

  .hero-main {
    grid-template-columns: minmax(0, 1.12fr) minmax(0, .88fr);
    gap: clamp(20px, 2vw, 34px);
    padding: clamp(12px, 2vh, 22px) clamp(76px, 5.45vw, 100px) 10px;
    align-items: center;
  }
  .hero-visual {
    min-width: 0;
    gap: clamp(5px, 1vh, 11px);
  }
  .hero-logo {
    display: block;
    width: 100%;
    max-width: 800px;
    max-height: min(63dvh, 595px);
    height: auto;
    object-fit: contain;
  }
  .hero-copy {
    min-width: 0;
    padding: 4px 0;
  }
  .hero-copy .eyebrow {
    font-size: clamp(11px, .85vw, 13px);
    line-height: 1.4;
    letter-spacing: 1.7px;
    margin-bottom: clamp(9px, 1.5vh, 16px);
  }
  .hero-copy h1 {
    max-width: 100%;
    font-size: clamp(39px, 3vw, 55px);
    line-height: 1.12;
    letter-spacing: -1.2px;
    margin-bottom: clamp(12px, 1.75vh, 21px);
    overflow-wrap: break-word;
  }
  .hero-description {
    font-size: clamp(15px, 1.05vw, 17px);
    line-height: 1.65;
    max-width: 100%;
    margin-bottom: clamp(15px, 2.2vh, 24px);
  }
  .hero-funding {
    max-width: min(100%, 500px);
    margin-bottom: clamp(16px, 2.1vh, 22px);
  }
  .hero-funding small {
    font-size: clamp(11px, .78vw, 13px);
    line-height: 1.45;
    margin-bottom: 9px;
  }
  .hero-funding strong {
    display: block;
    font-size: clamp(32px, 2.55vw, 43px);
    line-height: 1.2;
    letter-spacing: -.7px;
  }
  .hero-funding p {
    font-size: clamp(13px, .95vw, 15px);
    line-height: 1.5;
    margin: 5px 0 13px;
  }
  .hero-funding .campaign-progress { height: 11px; }
  .hero-copy .gold-button {
    font-size: 12px;
    min-height: 48px;
  }
  .hero-secondary-links { padding-bottom: 12px; }

  .hero-slider {
    flex: 0 0 var(--hero-slider-height);
    min-height: var(--hero-slider-height);
    height: var(--hero-slider-height);
    padding-inline: clamp(22px, 3vw, 48px);
  }
  .side-rail { bottom: var(--hero-slider-height); }
  .slider-side { font-size: clamp(12px, .85vw, 15px); gap: 13px; }
  .slider-side ion-icon { font-size: 30px; }
  .slider-dots { gap: 12px; }
  .slider-dots button { width: 8px; height: 8px; }
  .slider-dots button.active { width: 11px; height: 11px; }
}

@media (min-width: 861px) and (max-width: 1120px) {
  .hero-main {
    grid-template-columns: minmax(0, 1.04fr) minmax(0, .96fr);
    padding-left: 68px;
    padding-right: 68px;
    gap: 18px;
  }
  .hero-logo { max-height: min(56dvh, 480px); }
  .hero-copy h1 { font-size: clamp(32px, 3.5vw, 43px); }
  .hero-description { font-size: clamp(13px, 1.3vw, 15px); }
  .hero-funding strong { font-size: clamp(27px, 2.85vw, 36px); }
  .hero-secondary-links { padding-left: 68px; padding-right: 68px; }
}

@media (min-width: 861px) and (max-height: 740px) {
  .hero { --hero-slider-height: clamp(70px, 9dvh, 80px); }
  .hero-main { padding-top: 7px; padding-bottom: 5px; }
  .hero-visual { gap: 4px; }
  .hero-logo { max-height: min(54dvh, 455px); }
  .hero-copy .eyebrow { margin-bottom: 9px; }
  .hero-copy h1 { font-size: clamp(32px, 2.7vw, 46px); margin-bottom: 11px; }
  .hero-description { line-height: 1.45; margin-bottom: 11px; }
  .hero-funding { margin-bottom: 12px; }
  .hero-funding p { margin-bottom: 8px; }
  .hero-secondary-links { padding-top: 0; padding-bottom: 8px; }
}

@media (max-width: 860px) {
  .hero-slider { min-height: 72px; padding-block: 5px; }
  .slider-side { font-size: 11px; }
  .slider-side ion-icon { font-size: 23px; }
}

@media (min-width: 861px) {
  .hero {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto var(--hero-slider-height);
    height: calc(100vh - var(--reliefgo-navbar-height));
    height: calc(100dvh - var(--reliefgo-navbar-height));
    min-height: 0;
    overflow: hidden;
  }

  .hero-main {
    min-height: 0;
    height: 100%;
    align-self: stretch;
    padding-top: clamp(8px, 1.4dvh, 18px);
    padding-bottom: clamp(5px, 1dvh, 10px);
  }
  .hero-visual {
    min-height: 0;
    max-height: 100%;
  }
  .hero-logo {
    width: 100%;
    height: auto;
    max-height: min(57dvh, 535px);
    object-fit: contain;
  }
  .hero-copy {
    min-height: 0;
    max-height: 100%;
  }
  .hero-secondary-links {
    align-self: center;
    min-height: 0;
  }
  .hero-slider {
    height: var(--hero-slider-height);
    min-height: var(--hero-slider-height);
    align-self: stretch;
  }
  .side-rail { bottom: var(--hero-slider-height); }
}

@media (min-width: 861px) and (max-height: 790px) {
  .hero-logo { max-height: min(49dvh, 420px); }
  .hero-main { padding-top: 6px; padding-bottom: 4px; }
  .hero-visual { gap: 4px; }
  .hero-copy .eyebrow { margin-bottom: 8px; }
  .hero-copy h1 { font-size: clamp(31px, 2.65vw, 45px); margin-bottom: 10px; }
  .hero-description { margin-bottom: 10px; line-height: 1.45; }
  .hero-funding { margin-bottom: 10px; }
  .hero-funding p { margin-bottom: 7px; }
  .hero-secondary-links { padding-top: 0; padding-bottom: 7px; }
}

@media (min-width: 861px) and (max-height: 590px) {
  .hero {
    height: auto;
    min-height: calc(100dvh - var(--reliefgo-navbar-height));
    grid-template-rows: auto auto var(--hero-slider-height);
  }
  .hero-main { height: auto; }
}

.feature-gallery {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  width: min(100%, 1330px);
  max-width: 1330px;
  gap: clamp(18px, 2vw, 30px);
  padding: 8px 2px 18px;
  margin: 0 auto 32px;
}
.feature-card {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 288px;
  box-sizing: border-box;
  padding: 21px 14px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  border: 1px solid rgba(255,255,255,.17);
  border-radius: 26px;
  background: var(--forest);
  color: #fff8e8;
  opacity: .9;
  transform: none;
  box-shadow: none;
  overflow: hidden;
  transition: background-color .2s, border-color .2s, box-shadow .2s, opacity .2s;
}
.feature-card.is-active {
  transform: none;
  opacity: 1;
  z-index: 1;
  background: #f7e8c8;
  color: var(--forest);
  border: 1px solid var(--gold);
  box-shadow: 0 14px 28px rgba(0,0,0,.16);
}
.feature-card:hover:not(.is-active) { opacity: 1; border-color: rgba(232,174,76,.5); }
.feature-card:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
.feature-illustration {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 170px;
  object-fit: cover;
  object-position: center;
  border-radius: 15px;
  flex: 0 0 auto;
}
.feature-card .feature-number {
  flex: 0 0 auto;
  font-size: 11px;
  line-height: 1.25;
  letter-spacing: 2px;
  font-weight: 800;
}
.feature-card strong {
  font-size: clamp(13px, 1.23vw, 18px);
  line-height: 1.3;
  font-weight: 800;
  overflow-wrap: break-word;
}
.feature-card small {
  margin-top: 5px;
  font-size: 9px;
  line-height: 1.4;
  letter-spacing: 1px;
}
@media (max-width: 1100px) {
  .feature-gallery { gap: 17px; }
  .feature-card { min-height: 260px; padding: 17px 11px 19px; gap: 10px; }
  .feature-illustration { border-radius: 12px; }
}
@media (max-width: 860px) {
  .feature-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    max-width: 640px;
  }
  .feature-card { min-height: 255px; }
  .feature-card strong { font-size: 15px; }
}
@media (max-width: 600px) {
  .feature-gallery { gap: 12px; padding: 6px 0 16px; }
  .feature-card { min-height: 215px; padding: 12px 9px 15px; gap: 8px; border-radius: 18px; }
  .feature-illustration { max-height: 125px; border-radius: 10px; }
  .feature-card strong { font-size: 13px; }
  .feature-card small { font-size: 8px; letter-spacing: .35px; }
  .feature-card .feature-number { font-size: 9px; }
}

.about-image-panel {
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
  aspect-ratio: 4 / 3; 
  min-height: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
  border-radius: 14px; 
  background: var(--forest);
  isolation: isolate;
  border: 1px solid rgba(255, 255, 255, .16);
}

.about-image-panel img {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: cover;
  object-position: center center;
}

.about-image-panel span {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 68px;
  margin: 0;
  padding: 29px 12px 15px;
  background: linear-gradient(to top, rgba(16, 42, 32, .94), rgba(16, 42, 32, .64) 56%, transparent);
  color: #fff8e8;
  font-size: clamp(9px, .75vw, 12px);
  font-weight: 800;
  letter-spacing: 1.15px;
  line-height: 1.5;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .25);
}

@media (max-width: 600px) {
  .about-image-panel { aspect-ratio: 4 / 3; }
  .about-image-panel span { padding: 24px 9px 12px; font-size: 9px; letter-spacing: .85px; }
}

</style>