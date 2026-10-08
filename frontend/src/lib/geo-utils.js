/**
 * High-accuracy GPS geolocation & OpenStreetMap reverse-geocoding utilities
 */

export async function getCurrentGpsLocation() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser or device.'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS location is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Reverse geocodes coordinates to a human-readable street/landmark name
 * using OpenStreetMap Nominatim API.
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();

    const addr = data.address || {};
    // Build a clean, short landmark name
    const landmark =
      addr.amenity ||
      addr.shop ||
      addr.building ||
      addr.road ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.village ||
      addr.town ||
      addr.city ||
      '';

    const locality = addr.suburb || addr.town || addr.city || addr.county || '';
    const shortName = landmark && locality && landmark !== locality
      ? `${landmark}, ${locality}`
      : landmark || data.display_name?.split(',').slice(0, 2).join(',') || `Stop @ ${latitude}, ${longitude}`;

    return {
      displayName: data.display_name,
      shortName: shortName.trim(),
      landmark,
      locality,
      road: addr.road,
      city: addr.city || addr.town || addr.village,
      postcode: addr.postcode,
      raw: data,
    };
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return {
      displayName: `GPS (${latitude}, ${longitude})`,
      shortName: `Stop @ ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
  }
}

/**
 * Address / Landmark search using OpenStreetMap Nominatim
 */
export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const results = await res.json();
    return results.map((r) => ({
      displayName: r.display_name,
      latitude: parseFloat(parseFloat(r.lat).toFixed(6)),
      longitude: parseFloat(parseFloat(r.lon).toFixed(6)),
      type: r.type,
    }));
  } catch (err) {
    console.warn('Address search error:', err);
    return [];
  }
}
