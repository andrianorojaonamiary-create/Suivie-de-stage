// Service de géocodage avec Nominatim (OpenStreetMap - Gratuit)
// Respecte la policy Nominatim: User-Agent + Accept-Language + throttle
let lastGeocodeTime = 0;
export async function geocodeAddress(address) {
  // Throttle 1 req/s
  const now = Date.now();
  const wait = 1100 - (now - lastGeocodeTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastGeocodeTime = Date.now();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&email=contact@emit.mg&accept-language=fr`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SuiviDeStage-EMIT/1.0 (contact@emit.mg)',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error.message);
    return null;
  }
}