<template>
  <div class="location-picker">
    <p class="label">Pin the exact location on the map (optional)</p>

    <div v-if="hasMapsKey" class="map-box">
      <div ref="mapEl" class="map"></div>
      <div v-if="status === 'loading'" class="overlay">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
      </div>
      <div v-else-if="status === 'error'" class="overlay">
        <p>The map could not be loaded. You can still submit without a pin.</p>
      </div>
    </div>
    <p v-else class="fallback">
      The map is not set up yet (no Google Maps key in the .env file). You can still submit the
      campaign without a pin.
    </p>

    <template v-if="hasMapsKey">
      <p v-if="modelValue" class="coords">
        Pinned: {{ modelValue.lat.toFixed(5) }}, {{ modelValue.lng.toFixed(5) }}
      </p>
      <p v-else class="coords">
        Tap or click the map to drop a pin. You can drag the pin to adjust it.
      </p>

      <div class="buttons">
        <ion-button size="small" fill="outline" @click="useMyLocation">
          <ion-icon slot="start" :icon="locateOutline"></ion-icon>
          Use my current location
        </ion-button>
        <ion-button
          size="small"
          fill="clear"
          color="danger"
          :disabled="!modelValue"
          @click="clearPin"
        >
          Clear pin
        </ion-button>
      </div>
      <p v-if="geoMessage" class="geo">{{ geoMessage }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { locateOutline } from 'ionicons/icons';
import { hasMapsKey, loadGoogleMaps } from '../services/googleMaps';
import type { MapPoint } from '../services/googleMaps';

const props = defineProps<{
  modelValue: MapPoint | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: MapPoint | null): void;
}>();

// A starting view that shows the whole Philippines
const PH_CENTER: MapPoint = { lat: 12.8797, lng: 121.774 };

const mapEl = ref<HTMLElement | null>(null);
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');
const geoMessage = ref('');

let map: google.maps.Map | null = null;
let marker: google.maps.marker.AdvancedMarkerElement | null = null;
let MarkerClass: typeof google.maps.marker.AdvancedMarkerElement | null = null;
let lastEmitted = '';

function pointKey(point: MapPoint | null): string {
  return point ? `${point.lat},${point.lng}` : '';
}

function toPoint(
  position:
    | google.maps.LatLng
    | google.maps.LatLngLiteral
    | google.maps.LatLngAltitude
    | null
    | undefined
): MapPoint | null {
  if (!position) return null;
  if (position instanceof google.maps.LatLng) {
    return { lat: position.lat(), lng: position.lng() };
  }
  return { lat: position.lat, lng: position.lng };
}

/** Shows (or removes) the marker on the map. Does not tell the parent. */
function showPin(point: MapPoint | null) {
  if (!map || !MarkerClass) return;

  if (!point) {
    if (marker) marker.map = null;
    marker = null;
    return;
  }

  if (marker) {
    marker.position = point;
    return;
  }

  marker = new MarkerClass({
    map,
    position: point,
    gmpDraggable: true,
    title: 'Campaign location',
  });
  marker.addListener('dragend', () => {
    const dropped = toPoint(marker?.position);
    if (dropped) setPoint(dropped);
  });
}

/** The person chose a place: show it and tell the parent form. */
function setPoint(point: MapPoint) {
  const rounded = {
    lat: Math.round(point.lat * 1e6) / 1e6,
    lng: Math.round(point.lng * 1e6) / 1e6,
  };
  lastEmitted = pointKey(rounded);
  showPin(rounded);
  emit('update:modelValue', rounded);
}

function clearPin() {
  lastEmitted = '';
  showPin(null);
  emit('update:modelValue', null);
}

function useMyLocation() {
  geoMessage.value = '';
  if (!navigator.geolocation) {
    geoMessage.value = 'Your device does not support location.';
    return;
  }

  geoMessage.value = 'Finding your location...';
  navigator.geolocation.getCurrentPosition(
    (position) => {
      geoMessage.value = '';
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      setPoint(point);
      map?.panTo(point);
      map?.setZoom(16);
    },
    () => {
      geoMessage.value =
        'Could not get your location. Please allow location access, or tap the map instead.';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

onMounted(async () => {
  if (!hasMapsKey || !mapEl.value) return;

  status.value = 'loading';
  try {
    await loadGoogleMaps();
    const { Map: GoogleMap } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
    const markerLibrary = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
    MarkerClass = markerLibrary.AdvancedMarkerElement;

    if (!mapEl.value) {
      status.value = 'idle';
      return; // the page was closed while the map was loading
    }

    const start = props.modelValue ?? PH_CENTER;
    map = new GoogleMap(mapEl.value, {
      center: start,
      zoom: props.modelValue ? 15 : 6,
      mapId: 'DEMO_MAP_ID', // allows the standard marker; fine for development
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        setPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      }
    });

    showPin(props.modelValue);
    status.value = 'ready';
  } catch (error) {
    console.error('Map error:', error);
    status.value = 'error';
  }
});

// The form can change the pin from outside (for example when editing a campaign)
watch(
  () => props.modelValue,
  (point) => {
    showPin(point);
    if (point && map && pointKey(point) !== lastEmitted) {
      map.panTo(point);
      map.setZoom(15);
    }
  }
);

onBeforeUnmount(() => {
  if (marker) marker.map = null;
  marker = null;
  map = null;
});
</script>

<style scoped>
.location-picker {
  margin-bottom: 14px;
}

.label {
  margin: 0 0 8px;
  font-weight: 600;
}

.map-box {
  position: relative;
}

.map {
  width: 100%;
  height: 300px;
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
  padding: 16px;
  text-align: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  color: #52606d;
}

.fallback {
  margin: 0;
  padding: 14px;
  border-radius: 16px;
  background: var(--rg-green-soft);
  font-size: 0.9rem;
  color: #52606d;
}

.coords {
  margin: 8px 0 4px;
  font-size: 0.85rem;
  color: #52606d;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.geo {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #7b8794;
}
</style>