// =============================================
// validator.js — LLM CI Validator con Ollama
// Ejecutado desde: action.yml
// =============================================

import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

// 🎯 CLOSURE: Cliente LLM con caché y estadísticas
function createLLMClient(baseUrl, cacheEnabled = true) {
  // Estado privado del closure
  const cache = new Map();
  const stats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalTokens: 0
  };

  return {
    async generate(model, prompt, context) {
      stats.totalRequests++;

      // 🎯 Crear clave de caché única
      const cacheKey = `${model}:${prompt.substring(0, 100)}:${context.substring(0, 100)}`;

      // 🎯 Verificar caché si está habilitado
      if (cacheEnabled && cache.has(cacheKey)) {
        stats.cacheHits++;
        console.log(`\n📦 CACHE HIT (${stats.cacheHits}/${stats.totalRequests})`);
        return cache.get(cacheKey);
      }

      stats.cacheMisses++;
      console.log(`\n🔍 CACHE MISS - Llamando a LLM...`);

      // 🎯 TEMPLATE LITERAL: Construir prompt completo
      const fullPrompt = `CONTEXTO CI/CD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCCIÓN: ${prompt}

FORMATO DE RESPUESTA REQUERIDO (JSON estricto):
{
  "isValid": true | false,
  "score": <número 0-100>,
  "analysis": "<análisis detallado en español>",
  "recommendations": ["<recomendación 1>", "<recomendación 2>"],
  "severity": "low" | "medium" | "high" | "critical"
}

REGLAS:
- isValid: false SI hay errores críticos que bloqueen deploy
- score: 100 (perfecto) → 0 (crítico)
- analysis: explica QUÉ detectaste y POR QUÉ es importante
- recommendations: pasos concretos para resolver problemas
- severity: nivel de gravedad general del contexto

RESPONDE SOLO CON EL JSON (sin markdown, sin código):`;

      try {
        // 🎯 FETCH API: Llamar a Ollama
        const response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            prompt: fullPrompt,
            stream: false,
            options: {
              temperature: 0.3,  // Más determinístico
              top_p: 0.9
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
        }

        // 🎯 DESTRUCTURING: Extraer respuesta
        const { response: llmResponse, total_duration, eval_count } = await response.json();

        console.log(`   ✅ Respuesta recibida (${(total_duration / 1e9).toFixed(2)}s)`);
        console.log(`   📊 Tokens evaluados: ${eval_count || 'N/A'}`);

        if (eval_count) {
          stats.totalTokens += eval_count;
        }

        // 🎯 Parsear JSON de la respuesta
        const result = extractJSON(llmResponse);

        // Guardar en caché
        if (cacheEnabled) {
          cache.set(cacheKey, result);
        }

        return result;

      } catch (error) {
        console.error(`❌ Error en LLM request:`, error.message);
        throw error;
      }
    },

    getStats() {
      return {
        ...stats,
        cacheHitRate: stats.totalRequests > 0 
          ? ((stats.cacheHits / stats.totalRequests) * 100).toFixed(2) + '%'
          : '0%',
        cachedItems: cache.size
      };
    },

    clearCache() {
      const size = cache.size;
      cache.clear();
      console.log(`🗑️  Cache limpiado: ${size} items`);
    }
  };
}

// 🎯 Extraer JSON robusto de respuesta LLM
function extractJSON(text) {
  console.log(`\n📄 Procesando respuesta LLM (${text.length} chars)...`);

  // Intentar parsear directamente
  try {
    return JSON.parse(text);
  } catch (e) {
    // Buscar bloque JSON con regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error('❌ JSON inválido después de extracción');
      }
    }

    // Si todo falla, construir respuesta por defecto
    console.warn('⚠️  No se pudo parsear JSON, usando valores por defecto');
    return {
      isValid: false,
      score: 0,
      analysis: `Error al parsear respuesta del LLM. Respuesta original: ${text.substring(0, 200)}...`,
      recommendations: ['Revisar logs del LLM', 'Verificar formato del prompt'],
      severity: 'high'
    };
  }
}

// 🎯 Validar estructura de respuesta
function validateResponse(response) {
  const required = ['isValid', 'score', 'analysis'];
  
  // 🎯 ARRAY.EVERY: Verificar que todos los campos existan
  const hasRequired = required.every(field => field in response);

  if (!hasRequired) {
    const missing = required.filter(field => !(field in response));
    throw new Error(`Respuesta LLM incompleta. Faltan: ${missing.join(', ')}`);
  }

  // Validar tipos
  if (typeof response.isValid !== 'boolean') {
    throw new Error('isValid debe ser boolean');
  }

  if (typeof response.score !== 'number' || response.score < 0 || response.score > 100) {
    throw new Error('score debe ser número entre 0-100');
  }

  return true;
}

// 🎯 Escribir outputs para GitHub Actions
function writeOutputs(result, model, outputFile) {
  if (!outputFile) {
    console.warn('⚠️  GITHUB_OUTPUT no definido');
    return;
  }

  console.log(`\n📝 Escribiendo outputs a GitHub Actions...`);

  const outputs = [
    `is-valid=${result.isValid}`,
    `score=${result.score}`,
    `analysis=${result.analysis}`,
    `model-used=${model}`
  ];

  // 🎯 JOIN: Unir array con saltos de línea
  writeFileSync(outputFile, outputs.join('\n') + '\n', { flag: 'a' });

  console.log(`   ✅ Outputs escritos:`);
  outputs.forEach(output => {
    const [key] = output.split('=');
    console.log(`      - ${key}`);
  });
}

// 🎯 Generar resumen visual
function generateSummary(result, stats) {
  console.log('\n' + '═'.repeat(60));
  console.log('🤖 LLM VALIDATION RESULT');
  console.log('═'.repeat(60));

  // 🎯 Icono según score
  const icon = result.score >= 80 ? '✅' 
    : result.score >= 50 ? '⚠️' 
    : '❌';

  console.log(`\n${icon} Validación: ${result.isValid ? 'APROBADA ✅' : 'BLOQUEADA ❌'}`);
  console.log(`📊 Score: ${result.score}/100`);
  console.log(`🚨 Severity: ${result.severity || 'N/A'}`);
  
  console.log(`\n📝 Análisis:`);
  console.log(`   ${result.analysis}`);

  if (result.recommendations?.length > 0) {
    console.log(`\n💡 Recomendaciones:`);
    // 🎯 FOREACH con índice
    result.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }

  console.log(`\n📊 Estadísticas LLM:`);
  console.log(`   Total requests: ${stats.totalRequests}`);
  console.log(`   Cache hit rate: ${stats.cacheHitRate}`);
  console.log(`   Total tokens: ${stats.totalTokens}`);

  console.log('\n' + '═'.repeat(60));
}

// 🎯 Main function
async function main() {
  console.log('═'.repeat(60));
  console.log('🤖 OLLAMA LLM CI VALIDATOR');
  console.log('═'.repeat(60));

  // 🎯 DESTRUCTURING con defaults
  const {
    CONTEXT,
    PROMPT,
    MODEL = 'llama3.2',
    LLM_URL = 'http://localhost:11434',
    CACHE_ENABLED = 'true',
    GITHUB_OUTPUT,
    GITHUB_STEP_SUMMARY
  } = process.env;

  // Validación de inputs
  if (!CONTEXT) {
    console.error('❌ Error: CONTEXT env var es requerida');
    process.exit(1);
  }

  if (!PROMPT) {
    console.error('❌ Error: PROMPT env var es requerida');
    process.exit(1);
  }

  console.log(`\n⚙️  Configuración:`);
  console.log(`   LLM URL: ${LLM_URL}`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Cache: ${CACHE_ENABLED === 'true' ? 'Enabled ✅' : 'Disabled ❌'}`);
  console.log(`   Context length: ${CONTEXT.length} chars`);
  console.log(`   Prompt: "${PROMPT.substring(0, 80)}..."`);

  try {
    // 🎯 Crear cliente LLM (closure)
    const llmClient = createLLMClient(LLM_URL, CACHE_ENABLED === 'true');

    // 🎯 Generar validación
    const result = await llmClient.generate(MODEL, PROMPT, CONTEXT);

    // 🎯 Validar estructura de respuesta
    validateResponse(result);

    // 🎯 Obtener estadísticas del closure
    const stats = llmClient.getStats();

    // 🎯 Mostrar resumen
    generateSummary(result, stats);

    // 🎯 Escribir outputs para GitHub Actions
    if (GITHUB_OUTPUT) {
      writeOutputs(result, MODEL, GITHUB_OUTPUT);
    }

    // 🎯 Escribir Step Summary (markdown)
    if (GITHUB_STEP_SUMMARY) {
      const severity = result.severity || 'unknown';
      const emoji = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        critical: '🔴'
      }[severity] || '⚪';

      const summary = `
## 🤖 LLM Validation Result

| Metric | Value |
|--------|-------|
| **Status** | ${result.isValid ? '✅ Valid' : '❌ Invalid'} |
| **Score** | ${result.score}/100 |
| **Severity** | ${emoji} ${severity.toUpperCase()} |
| **Model** | ${MODEL} |

### 📝 Analysis

${result.analysis}

${result.recommendations?.length > 0 ? `
### 💡 Recommendations

${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
` : ''}

### 📊 LLM Stats

- **Total Requests**: ${stats.totalRequests}
- **Cache Hit Rate**: ${stats.cacheHitRate}
- **Total Tokens**: ${stats.totalTokens}
`;

      writeFileSync(GITHUB_STEP_SUMMARY, summary, { flag: 'a' });
      console.log('\n✅ Step Summary generado');
    }

    // 🎯 Exit code según resultado
    if (!result.isValid) {
      console.log('\n❌ CI BLOQUEADA - Validación falló');
      process.exit(1);
    }

    console.log('\n✅ CI APROBADA - Validación exitosa');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error crítico:', error.message);
    console.error(error.stack);

    // Escribir error a outputs
    if (GITHUB_OUTPUT) {
      writeFileSync(GITHUB_OUTPUT, 
        `is-valid=false\nscore=0\nanalysis=Error: ${error.message}\nmodel-used=${MODEL}\n`,
        { flag: 'a' }
      );
    }

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
//    - createLLMClient() con cache y stats privados
//    - Estado persistente entre llamadas
//    - Métodos que acceden al closure
//
// ✅ ASYNC/AWAIT
//    - async function main()
//    - await llmClient.generate()
//    - await fetch() para API calls
//
// ✅ FETCH API
//    - fetch() con POST y headers
//    - await response.json()
//    - Error handling con response.ok
//
// ✅ DESTRUCTURING
//    - const { CONTEXT, PROMPT, MODEL = 'default' } = process.env
//    - const { response: llmResponse, total_duration } = await...
//    - Valores por defecto
//
// ✅ TEMPLATE LITERALS
//    - Prompt completo multilínea
//    - `${variable}` interpolación
//    - Construcción dinámica
//
// ✅ MAP (estructura)
//    - cache = new Map()
//    - cache.set(), get(), has()
//    - Almacenamiento clave-valor
//
// ✅ ARRAY METHODS
//    - required.every(field => field in response)
//    - required.filter(field => ...)
//    - recommendations.forEach()
//    - recommendations.map()
//
// ✅ REGEX
//    - text.match(/\{[\s\S]*\}/)
//    - Extracción de JSON de texto
//
// ✅ SPREAD OPERATOR
//    - { ...stats, cacheHitRate: ... }
//    - Combinar objetos
//
// ✅ CONDITIONAL (TERNARY)
//    - icon = score >= 80 ? '✅' : score >= 50 ? '⚠️' : '❌'
//    - Lógica condicional compacta
//
// ✅ STRING METHODS
//    - text.substring(0, 100)
//    - outputs.join('\n')
//    - text.length
//
// ✅ OPTIONAL CHAINING
//    - result.recommendations?.length
//    - Acceso seguro a propiedades
