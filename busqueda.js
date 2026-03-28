const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.SERPAPI_KEY; // 👈 key de SERPAPI

async function main() {
  // Seleccionar Opciones de Búsqueda
  // 1. Input simple (funciona en cualquier terminal)
  const inquirer = (await import('inquirer')).default;
  try {
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

      // Eliminar duplicados (nombre + dirección)
      const unique = Array.from(
        new Map(
          places.map(p => [`${p.title}-${p.address}`, p])
        ).values()
      );

      console.log(`Se encontraron ${unique.length} resultados únicos\n`);

      // Crear CSV
      const rows = [];
      rows.push("Nombre,Direccion,Telefono,Web,Rating");

      unique.forEach(p => {
        rows.push(
          `"${p.title || ''}","${p.address || ''}","${p.phone || ''}","${p.website || ''}","${p.rating || ''}"`
        );
      });

      // Guardar archivo
      // Guardar archivo
      if (!fs.existsSync('bares_maps.csv')) {
        fs.appendFileSync('bares_maps.csv', "Titulo,Link,Descripcion\n");
      }

      fs.appendFileSync('bares_maps.csv', rows.join('\n') + '\n');

      console.log("✅ CSV guardado como bares_maps.csv");

    } else {
      let todos = [];

      const paginas = 10;

      for (let i = 0; i < paginas; i++) { // 10 páginas = 100 resultados
        const resp = await axios.get('https://serpapi.com/search', {
          params: {
          engine: 'google',
          q: query,
          start: i * 10,
          api_key: API_KEY
          }
        });

        const resultados = resp.data.organic_results || [];

        if (resultados.length === 0) break;

        todos = todos.concat(resultados);
      }

      // Eliminar duplicados por link
      const unique = Array.from(
        new Map(todos.map(r => [r.link, r])).values()
      );

      console.log(`Se encontraron ${unique.length} resultados únicos\n`);

      // Crear CSV
      const rows = [];
      rows.push("Titulo,Link,Descripcion");

      unique.forEach(r => {
        console.log({
          titulo: r.title,
          link: r.link,
          descripcion: r.snippet
        });
      });

      unique.forEach(r => {
        rows.push(
          `"${r.title || ''}","${r.link || ''}","${r.snippet || ''}"`
        );
      });

      // Guardar archivo
      if (!fs.existsSync('resultados_search.csv')) {
        fs.appendFileSync('resultados_search.csv', "Titulo,Link,Descripcion\n");
      }

      fs.appendFileSync('resultados_search.csv', rows.join('\n') + '\n');

      console.log("✅ CSV guardado como resultados_search.csv");
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
