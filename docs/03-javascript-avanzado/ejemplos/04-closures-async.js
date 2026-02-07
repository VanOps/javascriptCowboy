// =============================================
// Ejemplo 04: Closures y Async/Await
// Ejecutar: node 04-closures-async.js
// =============================================

// --- CLOSURE: Caché IA con encapsulación ---
function crearCacheIA(maxSize = 5) {
  const cache = new Map();  // 🔒 Variable privada (closure)
  let hits = 0;
  let misses = 0;

  return {
    consultar: async (prompt) => {
      if (cache.has(prompt)) {
        hits++;
        console.log(`  ✅ Cache HIT (${hits} hits, ${misses} misses)`);
        return cache.get(prompt);
      }

      misses++;
      // Simular llamada IA (800ms)
      const respuesta = await new Promise(resolve =>
        setTimeout(() => resolve(`🤖 IA: ${prompt.toUpperCase()}`), 800)
      );

      if (cache.size >= maxSize) {
        const primeraKey = cache.keys().next().value;
        cache.delete(primeraKey);
        console.log(`  🗑️ Eliminado del cache: "${primeraKey}"`);
      }

      cache.set(prompt, respuesta);
      return respuesta;
    },

    stats: () => ({ size: cache.size, hits, misses })
  };
}

// --- ASYNC/AWAIT: Uso del cache ---
async function demo() {
  const ia = crearCacheIA(3);

  console.log('--- Primera consulta (MISS) ---');
  const r1 = await ia.consultar('qué es kubernetes');
  console.log(r1);

  console.log('\n--- Misma consulta (HIT) ---');
  const r2 = await ia.consultar('qué es kubernetes');
  console.log(r2);

  console.log('\n--- Nuevas consultas ---');
  await ia.consultar('qué es docker');
  await ia.consultar('qué es helm');
  await ia.consultar('qué es ansible');  // Expulsa la primera

  console.log('\n--- Stats ---');
  console.log(ia.stats());
}

demo().then(() => console.log('\n✅ Demo completada'));
