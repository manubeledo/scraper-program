const axios = require('axios');

const API_KEY = 'TU_API_KEY';

async function buscarBares() {
  const response = await axios.get('https://serpapi.com/search', {
    params: {
      engine: 'google_maps',
      q: 'bares en palermo buenos aires',
      api_key: '8b7729012121f87d9ffd094572d6c151b5225504c183f6253cea83d0b7abeb12'
    }
  });

  const places = response.data.local_results;

  places.forEach(place => {
    console.log({
      nombre: place.title,
      direccion: place.address,
      telefono: place.phone,
      web: place.website,
      rating: place.rating,
    });
  });
}

buscarBares();
