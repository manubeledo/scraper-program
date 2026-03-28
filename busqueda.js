const inquirer = require('inquirer').default;
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SERPAPI_KEY; // 👈 poné tu key acá

async function main() {
  try {
    // 1. Input simple (funciona en cualquier terminal)
    const respuestas = await inquirer.prompt([
      {
        type: 'input',
        name: 'tipo',
        message: 'Elegí: 1 = Google Maps (negocios) | 2 = Google Search (webs)'
      },
      {
        type: 'input',
        name: 'query',
        message: 'Escribí la búsqueda (ej: bares en villa del parque):'
      }
    ]);

    // 2. Mapear opción a engine correcto
    const engine = respuestas.tipo === '1' ? 'google_maps' : 'google';
    const query = respuestas.query;

    // 🔍 DEBUG (clave si algo falla)
    console.log("\nDEBUG:");
    console.log("ENGINE:", engine);
    console.log("QUERY:", query);
    console.log("\n🔎 Buscando...\n");

    // 3. Request a SerpAPI
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine,
        q: query,
        api_key: API_KEY
      }
    });

    // 4. Procesar resultados
    if (engine === 'google_maps') {
      const places = response.data.local_results || [];

      console.log(`Se encontraron ${places.length} resultados\n`);

      places.slice(0, 40).forEach(place => {
        console.log({
          nombre: place.title,
          direccion: place.address,
          telefono: place.phone,
          web: place.website,
          rating: place.rating
        });
      });

    } else {
      const results = response.data.organic_results || [];

      console.log(`Se encontraron ${results.length} resultados\n`);

      results.slice(0, 40).forEach(r => {
        console.log({
          titulo: r.title,
          link: r.link,
          descripcion: r.snippet
        });
      });
    }

  } catch (error) {
    console.error("\n❌ Error:");
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

main();
