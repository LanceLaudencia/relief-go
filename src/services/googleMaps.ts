/// <reference types="google.maps" />

export interface MapPoint {
  lat: number;
  lng: number;
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/** True when a Google Maps key has been added to .env. */
export const hasMapsKey = Boolean(apiKey && apiKey.trim());

let loadPromise: Promise<void> | null = null;

/** Loads the Google Maps script once. Safe to call many times. */
export function loadGoogleMaps(): Promise<void> {
  if (!hasMapsKey || !apiKey) {
    return Promise.reject(new Error('The Google Maps API key is missing.'));
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (typeof google !== 'undefined' && google.maps && google.maps.importLibrary) {
      resolve();
      return;
    }

    const callbackName = '__reliefGoMapsReady';
    (window as unknown as Record<string, unknown>)[callbackName] = () => resolve();

    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js' +
      `?key=${encodeURIComponent(apiKey.trim())}` +
      '&v=weekly&loading=async' +
      `&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Could not load Google Maps.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** A link that opens a place in the Google Maps app or website (no API key needed). */
export function googleMapsLink(point: MapPoint | null, address: string): string {
  if (point) {
    return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
  }
  if (address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
  }
  return '';
}