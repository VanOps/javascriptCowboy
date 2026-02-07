// =============================================
// validator.js — Copilot CLI CI Validator
// Ejecutado desde: action.yml
// =============================================

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync } from 'fs';

const execAsync = promisify(exec);

// 🎯 CLOSURE: Cliente Copilot con caché
function createCopilotClient(githubToken, includeRepoContext = true) {
  // Estado privado
  const cache = new Map();
  const stats = {
    totalQueries: 0,
    cacheHits: 0,
    avgResponseTime: 0,
    responseTimes: []
  };

  return {
    async ask(prompt, context, temperature = 0.3) {
      stats.totalQueries++;
      const startTime = Date.now();

      // 🎯 Clave de caché
      const cacheKey = `${prompt.substring(0, 100)}:${context.substring(0, 100)}`;

      if (cache.has(cacheKey)) {
        stats.cacheHits++;
        console.log(`\n📦 CACHE HIT (${stats.cacheHits}/${stats.totalQueries})`);
        return cache.get(cacheKey);
      }

      console.log(`\n🔍 Consultando GitHub Copilot...`);

      try {
        // 🎯 TEMPLATE LITERAL: Construir prompt completo
        const fullPrompt = `SISTEMA: Eres un experto en CI/CD analizando logs y contexto de build/deploy.

CONTEXTO DEL CI/CD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TAREA: ${prompt}

FORMATO DE RESPUESTA (JSON estricto):
{
  "isValid": true | false,
  "score": <0-100>,
  "analysis": "<análisis detallado>",
  "recommendations": ["<acción 1>", "<acción 2>"],
  "severity": "low" | "medium" | "high" | "critical",
  "confidence": "low" | "medium" | "high"
}

REGLAS:
- isValid: false SI detectas problemas que bloqueen producción
- score: 100 (perfecto) a 0 (crítico)
- analysis: explica QUÉ viste y POR QUÉ es relevante
- recommendations: acciones concretas y ejecutables
- severity: nivel de gravedad general
- confidence: qué tan seguro estás del análisis

RESPONDE SOLO CON JSON VÁLIDO (sin markdown):`;

        // 🎯 Llamar a Copilot CLI via gh
        // Usamos gh api para llamar a Copilot API directamente
        const { stdout, stderr } = await execAsync(
          `gh api -X POST /copilot/chat/completions \
            -H "Accept: application/json" \
            -f model="gpt-4" \
            -f temperature="${temperature}" \
            -f messages='[
              {
                "role": "system",
                "content": "Eres un experto en CI/CD y análisis de logs."
              },
              {
                "role": "user",
                "content": ${JSON.stringify(fullPrompt)}
              }
            ]'`,
          {
            env: {
              ...process.env,
              GH_TOKEN: githubToken
            },
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
          }
        );

        if (stderr) {
          console.warn('⚠️  Copilot stderr:', stderr);
        }

        // 🎯 DESTRUCTURING: Parsear respuesta
        const response = JSON.parse(stdout);
        const { choices } = response;

        if (!choices || choices.length === 0) {
          throw new Error('No se recibieron respuestas de Copilot');
        }

        // 🎯 OPTIONAL CHAINING: Acceso seguro
        const content = choices[0]?.message?.content;

        if (!content) {
          throw new Error('Respuesta de Copilot vacía');
        }

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        stats.responseTimes.push(responseTime);

        // Calcular promedio
        stats.avgResponseTime = 
          stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;

        console.log(`   ✅ Respuesta recibida (${(responseTime / 1000).toFixed(2)}s)`);

        // 🎯 Extraer JSON de la respuesta
        const result = extractJSON(content);

        // Guardar en caché
        cache.set(cacheKey, result);

        return result;

      } catch (error) {
        console.error(`❌ Error en Copilot request:`, error.message);
        
        // Si es error de autenticación, ser más específico
        if (error.message.includes('authentication') || error.message.includes('401')) {
          throw new Error('Error de autenticación. Verifica que GITHUB_TOKEN tenga permisos Copilot');
        }

        throw error;
      }
    },

    getStats() {
      return {
        ...stats,
        cacheHitRate: stats.totalQueries > 0
          ? ((stats.cacheHits / stats.totalQueries) * 100).toFixed(2) + '%'
          : '0%',
        avgResponseTimeSeconds: (stats.avgResponseTime / 1000).toFixed(2),
        cachedItems: cache.size
      };
    }
  };
}

// 🎯 Extraer JSON de respuesta (igual que Ollama validator)
function extractJSON(text) {
  console.log(`\n📄 Procesando respuesta Copilot (${text.length} chars)...`);

  // Limpiar markdown code blocks si existen
  let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // Buscar JSON con regex
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error('❌ JSON inválido después de extracción');
      }
    }

    console.warn('⚠️  No se pudo parsear JSON, usando valores por defecto');
    return {
      isValid: false,
      score: 0,
      analysis: `Error al parsear respuesta de Copilot. Texto: ${text.substring(0, 200)}...`,
      recommendations: ['Revisar respuesta de Copilot', 'Ajustar prompt'],
      severity: 'high',
      confidence: 'low'
    };
  }
}

// 🎯 Validar estructura de respuesta
function validateResponse(response) {
  const required = ['isValid', 'score', 'analysis', 'confidence'];
  
  // 🎯 ARRAY.FILTER + LENGTH
  const missing = required.filter(field => !(field in response));

  if (missing.length > 0) {
    throw new Error(`Respuesta incompleta. Faltan: ${missing.join(', ')}`);
  }

  // Validar tipos
  if (typeof response.isValid !== 'boolean') {
    throw new Error('isValid debe ser boolean');
  }

  if (typeof response.score !== 'number' || response.score < 0 || response.score > 100) {
    throw new Error('score debe estar entre 0-100');
  }

  // Validar confidence
  const validConfidence = ['low', 'medium', 'high'];
  if (!validConfidence.includes(response.confidence)) {
    console.warn(`⚠️  Confidence inválido: ${response.confidence}, usando 'medium'`);
    response.confidence = 'medium';
  }

  return true;
}

// 🎯 Escribir outputs
function writeOutputs(result, outputFile) {
  if (!outputFile) {
    console.warn('⚠️  GITHUB_OUTPUT no definido');
    return;
  }

  console.log(`\n📝 Escribiendo outputs...`);

  const outputs = [
    `is-valid=${result.isValid}`,
    `score=${result.score}`,
    `analysis=${result.analysis}`,
    `confidence=${result.confidence}`
  ];

  writeFileSync(outputFile, outputs.join('\n') + '\n', { flag: 'a' });

  console.log('   ✅ Outputs escritos');
}

// 🎯 Generar resumen visual
function generateSummary(result, stats) {
  console.log('\n' + '═'.repeat(60));
  console.log('🤖 COPILOT VALIDATION RESULT');
  console.log('═'.repeat(60));

  // 🎯 Iconos según métricas
  const validIcon = result.isValid ? '✅' : '❌';
  const scoreIcon = result.score >= 80 ? '🟢'
    : result.score >= 50 ? '🟡'
    : '🔴';
  const confidenceIcon = {
    high: '🟢',
    medium: '🟡',
    low: '🔴'
  }[result.confidence] || '⚪';

  console.log(`\n${validIcon} Validación: ${result.isValid ? 'APROBADA' : 'BLOQUEADA'}`);
  console.log(`${scoreIcon} Score: ${result.score}/100`);
  console.log(`${confidenceIcon} Confidence: ${result.confidence.toUpperCase()}`);
  console.log(`🚨 Severity: ${result.severity || 'N/A'}`);

  console.log(`\n📝 Análisis:`);
  console.log(`   ${result.analysis}`);

  if (result.recommendations?.length > 0) {
    console.log(`\n💡 Recomendaciones:`);
    result.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }

  console.log(`\n📊 Estadísticas Copilot:`);
  console.log(`   Total queries: ${stats.totalQueries}`);
  console.log(`   Cache hit rate: ${stats.cacheHitRate}`);
  console.log(`   Avg response time: ${stats.avgResponseTimeSeconds}s`);

  console.log('\n' + '═'.repeat(60));
}

// 🎯 Main function
async function main() {
  console.log('═'.repeat(60));
  console.log('🤖 GITHUB COPILOT CLI CI VALIDATOR');
  console.log('═'.repeat(60));

  // 🎯 DESTRUCTURING
  const {
    CONTEXT,
    PROMPT,
    GITHUB_TOKEN,
    GITHUB_REPOSITORY,
    INCLUDE_REPO_CONTEXT = 'true',
    TEMPERATURE = '0.3',
    GITHUB_OUTPUT,
    GITHUB_STEP_SUMMARY
  } = process.env;

  // Validación
  if (!CONTEXT) {
    console.error('❌ Error: CONTEXT env var requerida');
    process.exit(1);
  }

  if (!PROMPT) {
    console.error('❌ Error: PROMPT env var requerida');
    process.exit(1);
  }

  if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN env var requerida');
    process.exit(1);
  }

  console.log(`\n⚙️  Configuración:`);
  console.log(`   Repository: ${GITHUB_REPOSITORY || 'N/A'}`);
  console.log(`   Include repo context: ${INCLUDE_REPO_CONTEXT === 'true' ? 'Yes ✅' : 'No ❌'}`);
  console.log(`   Temperature: ${TEMPERATURE}`);
  console.log(`   Context length: ${CONTEXT.length} chars`);
  console.log(`   Prompt: "${PROMPT.substring(0, 80)}..."`);

  try {
    // 🎯 Crear cliente Copilot (closure)
    const copilot = createCopilotClient(
      GITHUB_TOKEN,
      INCLUDE_REPO_CONTEXT === 'true'
    );

    // 🎯 Ejecutar validación
    const temperature = parseFloat(TEMPERATURE);
    const result = await copilot.ask(PROMPT, CONTEXT, temperature);

    // 🎯 Validar estructura
    validateResponse(result);

    // 🎯 Obtener stats
    const stats = copilot.getStats();

    // 🎯 Mostrar resumen
    generateSummary(result, stats);

    // 🎯 Escribir outputs
    if (GITHUB_OUTPUT) {
      writeOutputs(result, GITHUB_OUTPUT);
    }

    // 🎯 Escribir Step Summary
    if (GITHUB_STEP_SUMMARY) {
      const summary = `
## 🤖 Copilot Validation Result

| Metric | Value |
|--------|-------|
| **Status** | ${result.isValid ? '✅ Valid' : '❌ Invalid'} |
| **Score** | ${result.score}/100 |
| **Confidence** | ${result.confidence.toUpperCase()} |
| **Severity** | ${result.severity?.toUpperCase() || 'N/A'} |

### 📝 Analysis

${result.analysis}

${result.recommendations?.length > 0 ? `
### 💡 Recommendations

${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
` : ''}

### 📊 Copilot Stats

- **Total Queries**: ${stats.totalQueries}
- **Cache Hit Rate**: ${stats.cacheHitRate}
- **Avg Response Time**: ${stats.avgResponseTimeSeconds}s
`;

      writeFileSync(GITHUB_STEP_SUMMARY, summary, { flag: 'a' });
      console.log('\n✅ Step Summary generado');
    }

    // 🎯 Exit code según validación
    if (!result.isValid) {
      console.log('\n❌ CI BLOQUEADA');
      process.exit(1);
    }

    console.log('\n✅ CI APROBADA');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error crítico:', error.message);
    console.error(error.stack);

    // Escribir error a outputs
    if (GITHUB_OUTPUT) {
      writeFileSync(GITHUB_OUTPUT,
        `is-valid=false\nscore=0\nanalysis=Error: ${error.message}\nconfidence=low\n`,
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
//    - createCopilotClient() con cache y stats privados
//    - Estado persistente entre llamadas
//
// ✅ ASYNC/AWAIT
//    - async function main()
//    - await copilot.ask()
//    - await execAsync() para comandos shell
//
// ✅ PROMISIFY
//    - const execAsync = promisify(exec)
//    - Convertir callbacks a Promises
//
// ✅ DESTRUCTURING
//    - const { CONTEXT, PROMPT, GITHUB_TOKEN = 'default' } = process.env
//    - const { choices } = response
//    - const { stdout, stderr } = await execAsync()
//
// ✅ TEMPLATE LITERALS
//    - Prompt completo multilínea
//    - Interpolación de variables
//    - Comandos shell dinámicos
//
// ✅ OPTIONAL CHAINING
//    - choices[0]?.message?.content
//    - result.recommendations?.length
//    - Acceso seguro a propiedades anidadas
//
// ✅ MAP (estructura)
//    - cache = new Map()
//    - cache.set(), get(), has()
//
// ✅ ARRAY METHODS
//    - required.filter(field => ...)
//    - stats.responseTimes.reduce((a, b) => a + b, 0)
//    - recommendations.forEach()
//    - recommendations.map()
//
// ✅ SPREAD OPERATOR
//    - { ...process.env, GH_TOKEN: ... }
//    - { ...stats, cacheHitRate: ... }
//
// ✅ REGEX
//    - text.match(/\{[\s\S]*\}/)
//    - text.replace(/```json\n?/g, '')
//
// ✅ JSON METHODS
//    - JSON.parse() / JSON.stringify()
//    - Serialización y parsing
//
// ✅ STRING METHODS
//    - text.substring(0, 100)
//    - outputs.join('\n')
//    - text.replace()
