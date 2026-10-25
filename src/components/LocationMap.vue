<template>
  <div class="location-map">
    <div v-if="canShowMap" class="map-box">
      <div ref="mapEl" class="map"></div>
      <div v-if="status === 'loading'" class="overlay">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
      </div>
      <div v-else-if="status === 'error'" class="overlay">
        <p>The map could not be loaded.</p>
      </div>
    </div>

    <div v-else class="fallback">
      <ion-icon :icon="locationOutline"></ion-icon>
      <p v-if="!hasMapsKey">The interactive map is not set up yet.</p>
      <p v-else>The organizer did not pin an exact spot on the map.</p>
    </div>

    <ion-button
      v-if="mapsLink"
      size="small"
      fill="outline"
      :href="mapsLink"
      target="_blank"
      rel="noopener noreferrer"
    >
      <ion-icon slot="start" :icon="openOutline"></ion-icon>
      Open in Google Maps
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { locationOutline, openOutline } from 'ionicons/icons';
import { googleMapsLink, hasMapsKey, loadGoogleMaps } from '../services/googleMaps';

const props = defineProps<{
  latitude: number | null;
  longitude: number | null;
  address: string;
}>();

const mapEl = ref<HTMLElement | null>(null);
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');

let map: google.maps.Map | null = null;
let marker: google.maps.marker.AdvancedMarkerElement | null = null;

const hasPin = computed(() => props.latitude !== null && props.longitude !== null);
const canShowMap = computed(() => hasMapsKey && hasPin.value);

const mapsLink = computed(() =>
  googleMapsLink(
    hasPin.value ? { lat: props.latitude as number, lng: props.longitude as number } : null,
    props.address
  )
);

async function drawMap() {
  if (!canShowMap.value) {
    map = null;
    marker = null;
    return;
  }
  if (!mapEl.value) return;

  const position = { lat: props.latitude as number, lng: props.longitude as number };

  // Map already exists: just move it
  if (map && marker) {
    map.setCenter(position);
    marker.position = position;
    return;
  }

  status.value = 'loading';
  try {
    await loadGoogleMaps();
    const { Map: GoogleMap } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = (await google.maps.importLibrary(
      'marker'
    )) as google.maps.MarkerLibrary;

    if (!mapEl.value) {
      status.value = 'idle';
      return; // the page was closed while the map was loading
    }

    map = new GoogleMap(mapEl.value, {
      center: position,
      zoom: 15,
      mapId: 'DEMO_MAP_ID', // allows the standard marker; fine for development
      streetViewControl: false,
      mapTypeControl: false,
    });
    marker = new AdvancedMarkerElement({ map, position, title: props.address });
    status.value = 'ready';
  } catch (error) {
    console.error('Map error:', error);
    status.value = 'error';
  }
}

onMounted(drawMap);

// "post" waits for the page to update first, so the map container exists
watch(() => [props.latitude, props.longitude], drawMap, { flush: 'post' });

onBeforeUnmount(() => {
  if (marker) marker.map = null;
  marker = null;
  map = null;
});
</script>

<style scoped>
.location-map {
  margin-bottom: 8px;
}

.map-box {
  position: relative;
  margin-bottom: 10px;
}

.map {
  width: 100%;
  height: 260px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--rg-green-soft);
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  color: #52606d;
}

.fallback {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 14px;
  border-radius: 16px;
  background: var(--rg-green-soft);
  color: #52606d;
}

.fallback p {
  margin: 0;
  font-size: 0.9rem;
}
</style>