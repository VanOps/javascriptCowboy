// =============================================
// vault-fetch.js — Fetch secrets desde Vault
// Uso: node scripts/vault-fetch.js
// =============================================

// 🎯 CLOSURE: Cliente Vault con token cacheado
function createVaultClient(baseURL, token) {
  // Estado privado del closure
  const cache = new Map();
  let requestCount = 0;

  // Retornar objeto con métodos que acceden al closure
  return {
    async getSecret(path) {
      requestCount++;
      
      // Verificar cache primero
      if (cache.has(path)) {
        console.log(`📦 Cache hit para: ${path}`);
        return cache.get(path);
      }

      console.log(`🔐 Fetching secret #${requestCount}: ${path}`);

      try {
        // 🎯 FETCH con async/await
        const response = await fetch(`${baseURL}/v1/secret/data/${path}`, {
          headers: {
            'X-Vault-Token': token
          }
        });

        if (!response.ok) {
          throw new Error(`Vault error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // 🎯 DESTRUCTURING anidado
        const { data: { data: secretData } } = data;

        // Guardar en cache
        cache.set(path, secretData);

        return secretData;

      } catch (error) {
        console.error(`❌ Error fetching ${path}:`, error.message);
        throw error;
      }
    },

    async getMultipleSecrets(paths) {
      console.log(`\n📚 Fetching ${paths.length} secrets en paralelo...`);
      
      // 🎯 PROMISE.ALL: Fetch múltiples secrets simultáneamente
      const promises = paths.map(path => this.getSecret(path));
      const results = await Promise.all(promises);

      // 🎯 REDUCE: Combinar resultados en un objeto
      return paths.reduce((acc, path, index) => {
        acc[path] = results[index];
        return acc;
      }, {});
    },

    getStats() {
      return {
        totalRequests: requestCount,
        cachedItems: cache.size,
        cacheKeys: Array.from(cache.keys())
      };
    },

    clearCache() {
      const size = cache.size;
      cache.clear();
      console.log(`🗑️  Cache limpiado: ${size} items eliminados`);
    }
  };
}

// 🎯 Escribir secrets a GITHUB_OUTPUT
function writeToGitHubOutput(secrets, outputFile) {
  if (!outputFile) {
    console.warn('⚠️  GITHUB_OUTPUT no definido, saltando escritura');
    return;
  }

  console.log(`\n📝 Escribiendo outputs a: ${outputFile}`);

  // 🎯 OBJECT.ENTRIES + FOR...OF
  for (const [key, value] of Object.entries(secrets)) {
    // Convertir path a nombre válido de output (replace / por _)
    const outputName = key.replace(/\//g, '_');
    
    // 🎯 TEMPLATE LITERALS con múltiples líneas
    const outputValue = typeof value === 'object' 
      ? JSON.stringify(value)
      : value;

    // Escribir en formato GitHub Actions
    const { appendFileSync } = await import('fs');
    appendFileSync(outputFile, `${outputName}=${outputValue}\n`);
    
    console.log(`   ✅ ${outputName}`);
  }
}

// 🎯 Main function
async function main() {
  console.log('═'.repeat(50));
  console.log('🔐 VAULT SECRET FETCHER');
  console.log('═'.repeat(50));

  // 🎯 DESTRUCTURING con defaults
  const {
    VAULT_ADDR,
    VAULT_TOKEN,
    SECRET_PATHS = 'app/database,app/api-keys',
    GITHUB_OUTPUT
  } = process.env;

  // Validación
  if (!VAULT_ADDR || !VAULT_TOKEN) {
    console.error('❌ Error: VAULT_ADDR y VAULT_TOKEN son requeridos');
    process.exit(1);
  }

  try {
    // Crear cliente Vault (closure)
    const vault = createVaultClient(VAULT_ADDR, VAULT_TOKEN);

    // 🎯 SPLIT + MAP: Convertir string a array
    const paths = SECRET_PATHS.split(',').map(p => p.trim());

    console.log(`\n📋 Secrets a obtener:`);
    paths.forEach((path, i) => console.log(`   ${i + 1}. ${path}`));

    // 🎯 Fetch múltiples secrets
    const secrets = await vault.getMultipleSecrets(paths);

    console.log(`\n✅ Secrets obtenidos exitosamente!`);
    
    // 🎯 Mostrar stats del closure
    const stats = vault.getStats();
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Total requests: ${stats.totalRequests}`);
    console.log(`   Cache size: ${stats.cachedItems}`);

    // 🎯 Escribir a GitHub Actions output
    if (GITHUB_OUTPUT) {
      // Aplanar secrets anidados
      const flatSecrets = {};
      
      // 🎯 FOR...IN para iterar objeto
      for (const path in secrets) {
        const secretData = secrets[path];
        
        // Si el secret tiene múltiples keys, exponerlas individualmente
        if (typeof secretData === 'object') {
          for (const key in secretData) {
            const flatKey = `${path.replace(/\//g, '_')}_${key}`;
            flatSecrets[flatKey] = secretData[key];
          }
        } else {
          flatSecrets[path] = secretData;
        }
      }

      await writeToGitHubOutput(flatSecrets, GITHUB_OUTPUT);
    }

    // 🎯 Simular uso de secrets (en producción, usarías aquí)
    console.log(`\n🔍 Preview de secrets (primeros 3 chars):`);
    for (const [path, data] of Object.entries(secrets)) {
      if (typeof data === 'object') {
        console.log(`   ${path}:`);
        for (const [key, value] of Object.entries(data)) {
          const preview = String(value).substring(0, 3) + '***';
          console.log(`      ${key}: ${preview}`);
        }
      } else {
        const preview = String(data).substring(0, 3) + '***';
        console.log(`   ${path}: ${preview}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// 🔍 CONCEPTOS JAVASCRIPT USADOS:
//
// ✅ CLOSURES
//    - createVaultClient() retorna objeto con métodos
//    - cache, requestCount son privados y persistentes
//    - Cada método accede al closure
//
// ✅ ASYNC/AWAIT
//    - async function main(), getSecret(), getMultipleSecrets()
//    - await fetch() para llamadas HTTP
//    - await Promise.all() para paralelismo
//
// ✅ FETCH API
//    - fetch() con headers personalizados
//    - response.json() para parsear respuesta
//    - Error handling con response.ok
//
// ✅ DESTRUCTURING
//    - const { data: { data: secretData } } = data (anidado)
//    - const { VAULT_ADDR, VAULT_TOKEN = 'default' } = process.env
//    - for (const [key, value] of Object.entries(...))
//
// ✅ ARROW FUNCTIONS
//    - paths.map(p => p.trim())
//    - promises = paths.map(path => this.getSecret(path))
//
// ✅ ARRAY METHODS
//    - .map() para transformar
//    - .reduce() para combinar
//    - Promise.all() para paralelismo
//
// ✅ MAP (estructura de datos)
//    - cache = new Map()
//    - cache.set(), cache.get(), cache.has()
//    - Array.from(cache.keys())
//
// ✅ TEMPLATE LITERALS
//    - `${baseURL}/v1/secret/data/${path}`
//    - Interpolación dinámica
//
// ✅ FOR...OF / FOR...IN
//    - for (const [key, value] of Object.entries(...))
//    - for (const path in secrets)
