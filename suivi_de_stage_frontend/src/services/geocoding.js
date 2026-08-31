// Service de géocodage avec Nominatim (OpenStreetMap - Gratuit)
export async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
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
    // ✅ error bien utilisé ici
    console.error('Erreur de géocodage:', error.message);
    /*throw new Error('Impossible de géolocaliser cette adresse');*/
  }
}