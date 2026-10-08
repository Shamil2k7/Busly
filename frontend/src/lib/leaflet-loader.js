/**
 * SSR-safe, client-side dynamic loader for Leaflet.
 * Checks for window.L, injects CSS and JS from local public vendor assets,
 * with fallback to unpkg CDN if required.
 */

let leafletPromise = null;

export function loadLeaflet() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet cannot be loaded on the server.'));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletPromise) {
    return leafletPromise;
  }

  leafletPromise = new Promise((resolve, reject) => {
    // 1. Inject CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = '/vendor/leaflet/leaflet.css';
      link.onerror = () => {
        // Fallback to CDN
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      };
      document.head.appendChild(link);
    }

    // 2. Inject JS if not already present
    if (window.L) {
      resolve(window.L);
      return;
    }

    const existingScript = document.getElementById('leaflet-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = '/vendor/leaflet/leaflet.js';
    script.async = true;

    script.onload = () => {
      if (window.L) {
        // Fix default icon path
        delete window.L.Icon.Default.prototype._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/vendor/leaflet/images/marker-icon-2x.png',
          iconUrl: '/vendor/leaflet/images/marker-icon.png',
          shadowUrl: '/vendor/leaflet/images/marker-shadow.png',
        });
        resolve(window.L);
      } else {
        reject(new Error('Leaflet script loaded but window.L is undefined'));
      }
    };

    script.onerror = () => {
      // CDN Fallback
      const cdnScript = document.createElement('script');
      cdnScript.id = 'leaflet-js-cdn';
      cdnScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      cdnScript.async = true;
      cdnScript.onload = () => resolve(window.L);
      cdnScript.onerror = (err) => reject(err);
      document.head.appendChild(cdnScript);
    };

    document.head.appendChild(script);
  });

  return leafletPromise;
}
