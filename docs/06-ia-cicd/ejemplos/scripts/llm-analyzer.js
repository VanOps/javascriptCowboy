// =============================================
// llm-analyzer.js — Analizador genérico LLM
// Uso: node scripts/llm-analyzer.js
// =============================================

import fetch from 'node-fetch';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// 🎯 CLOSURE: Factory de analizadores LLM
function createAnalyzerFactory() {
  const analyzers = new Map();
  const globalStats = {
    totalAnalysis: 0,
    successfulAnalysis: 0,
    failedAnalysis: 0
  };

  return {
    // 🎯 Crear analizador especializado
    createAnalyzer(type, config) {
      const analyzer = {
        type,
        config,
        history: [],

        async analyze(content, options = {}) {
          globalStats.totalAnalysis++;

          console.log(`\n🔍 Analizando (tipo: ${type})...`);

          try {
            // 🎯 TEMPLATE LITERAL: Construir prompt según tipo
            const prompt = buildPromptForType(type, content, options);

            // 🎯 Llamar a LLM
            const result = await callLLM(
              config.llmUrl,
              config.model,
              prompt,
              config
            );

            // Guardar en historial
            this.history.push({
              timestamp: new Date().toISOString(),
              type,
              success: true,
              result
            });

            globalStats.successfulAnalysis++;
            return result;

          } catch (error) {
            globalStats.failedAnalysis++;
            
            this.history.push({
              timestamp: new Date().toISOString(),
              type,
              success: false,
              error: error.message
            });

            throw error;
          }
        },

        getHistory() {
          return this.history;
        }
      };

      analyzers.set(type, analyzer);
      return analyzer;
    },

    getGlobalStats() {
      return {
        ...globalStats,
        successRate: globalStats.totalAnalysis > 0
          ? ((globalStats.successfulAnalysis / globalStats.totalAnalysis) * 100).toFixed(2) + '%'
          : '0%',
        analyzersCreated: analyzers.size
      };
    }
  };
}

// 🎯 Construir prompt según tipo de análisis
function buildPromptForType(type, content, options) {
  const prompts = {
    'k8s-logs': `ANÁLISIS DE LOGS KUBERNETES

LOGS:
${content}

Analiza estos logs de Kubernetes y determina:
1. ¿Hay errores críticos? (CrashLoopBackOff, OOMKilled, ImagePullBackOff, etc.)
2. ¿Cuál es la causa raíz del problema?
3. ¿Qué acciones de remediación recomiendas?
4. ¿Es seguro hacer deploy con estos logs?

Responde en JSON:
{
  "hasErrors": boolean,
  "severity": "low|medium|high|critical",
  "rootCause": "descripción",
  "recommendations": ["acción1", "acción2"],
  "safeForDeploy": boolean
}`,

    'build-logs': `ANÁLISIS DE BUILD LOGS

BUILD OUTPUT:
${content}

Analiza este output de build y responde:
1. ¿El build fue exitoso?
2. ¿Hay warnings críticos que deban resolverse?
3. ¿Hay problemas de dependencias o seguridad?
4. ¿Qué optimizaciones recomiendas?

JSON response:
{
  "buildSuccess": boolean,
  "criticalWarnings": number,
  "securityIssues": ["issue1"],
  "recommendations": ["optimización1"],
  "qualityScore": 0-100
}`,

    'test-results': `ANÁLISIS DE TEST RESULTS

TEST OUTPUT:
${content}

Analiza los resultados de tests:
1. ¿Cuántos tests fallaron y por qué?
2. ¿Son fallos críticos que bloquean release?
3. ¿Hay patrones en los fallos? (timeouts, race conditions, etc.)
4. ¿La cobertura es aceptable?

JSON response:
{
  "totalTests": number,
  "failed": number,
  "criticalFailures": number,
  "patterns": ["patrón1"],
  "coverageAcceptable": boolean,
  "blockingRelease": boolean
}`,

    'security-scan': `ANÁLISIS DE SECURITY SCAN

SCAN RESULTS:
${content}

Analiza el reporte de seguridad:
1. ¿Hay vulnerabilidades CRITICAL o HIGH?
2. ¿Qué CVEs específicos afectan?
3. ¿Hay parches disponibles?
4. ¿Bloquean deploy a producción?

JSON response:
{
  "vulnerabilities": {
    "critical": number,
    "high": number,
    "medium": number,
    "low": number
  },
  "cves": ["CVE-2023-xxxx"],
  "patchesAvailable": boolean,
  "blockProduction": boolean
}`,

    'generic': `ANÁLISIS GENERAL

CONTENIDO:
${content}

${options.customPrompt || 'Analiza este contenido y proporciona insights relevantes.'}

Responde en JSON con estructura apropiada.`
  };

  return prompts[type] || prompts['generic'];
}

// 🎯 Llamar a LLM (Ollama u otro)
async function callLLM(url, model, prompt, config = {}) {
  console.log(`   📡 Llamando a LLM (${model})...`);

  try {
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: config.temperature || 0.3,
          top_p: config.top_p || 0.9
        }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM error: ${response.status}`);
    }

    const { response: llmResponse } = await response.json();

    // 🎯 Intentar extraer JSON
    try {
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: llmResponse };
    } catch (e) {
      return { raw: llmResponse };
    }

  } catch (error) {
    console.error(`   ❌ Error en LLM: ${error.message}`);
    throw error;
  }
}

// 🎯 Leer archivo de logs
function readLogFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }

  console.log(`📂 Leyendo: ${filePath}`);
  const content = readFileSync(filePath, 'utf-8');
  console.log(`   ✅ ${content.length} chars leídos`);

  return content;
}

// 🎯 Guardar reporte
function saveReport(result, outputPath, format = 'json') {
  console.log(`\n💾 Guardando reporte: ${outputPath}`);

  let content;

  if (format === 'json') {
    content = JSON.stringify(result, null, 2);
  } else if (format === 'markdown') {
    content = generateMarkdownReport(result);
  } else {
    content = JSON.stringify(result, null, 2);
  }

  writeFileSync(outputPath, content);
  console.log('   ✅ Reporte guardado');
}

// 🎯 Generar reporte Markdown
function generateMarkdownReport(result) {
  const lines = ['# 🤖 LLM Analysis Report\n'];

  lines.push(`**Timestamp**: ${new Date().toISOString()}\n`);

  // 🎯 OBJECT.ENTRIES para iterar
  for (const [key, value] of Object.entries(result)) {
    if (Array.isArray(value)) {
      lines.push(`## ${key}\n`);
      value.forEach((item, i) => {
        lines.push(`${i + 1}. ${item}`);
      });
      lines.push('');
    } else if (typeof value === 'object') {
      lines.push(`## ${key}\n`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```\n');
    } else {
      lines.push(`**${key}**: ${value}\n`);
    }
  }

  return lines.join('\n');
}

// 🎯 Main function
async function main() {
  console.log('═'.repeat(60));
  console.log('🤖 GENERIC LLM ANALYZER');
  console.log('═'.repeat(60));

  // 🎯 DESTRUCTURING
  const {
    LOG_FILE,
    ANALYSIS_TYPE = 'generic',
    LLM_URL = 'http://localhost:11434',
    MODEL = 'llama3.2',
    OUTPUT_FILE = './analysis-report.json',
    OUTPUT_FORMAT = 'json',
    CUSTOM_PROMPT
  } = process.env;

  // Validación
  if (!LOG_FILE) {
    console.error('❌ Error: LOG_FILE env var requerida');
    console.error('\nUso:');
    console.error('  LOG_FILE=./app.log ANALYSIS_TYPE=k8s-logs node llm-analyzer.js');
    console.error('\nTipos soportados:');
    console.error('  - k8s-logs');
    console.error('  - build-logs');
    console.error('  - test-results');
    console.error('  - security-scan');
    console.error('  - generic (con CUSTOM_PROMPT)');
    process.exit(1);
  }

  console.log(`\n⚙️  Configuración:`);
  console.log(`   Log file: ${LOG_FILE}`);
  console.log(`   Analysis type: ${ANALYSIS_TYPE}`);
  console.log(`   LLM URL: ${LLM_URL}`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Output: ${OUTPUT_FILE} (${OUTPUT_FORMAT})`);

  try {
    // 🎯 Crear factory de analizadores
    const factory = createAnalyzerFactory();

    // 🎯 Crear analizador específico
    const analyzer = factory.createAnalyzer(ANALYSIS_TYPE, {
      llmUrl: LLM_URL,
      model: MODEL,
      temperature: 0.3
    });

    // 🎯 Leer archivo de logs
    const content = readLogFile(LOG_FILE);

    // 🎯 Analizar
    const result = await analyzer.analyze(content, {
      customPrompt: CUSTOM_PROMPT
    });

    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESULTADO DEL ANÁLISIS');
    console.log('═'.repeat(60));
    console.log(JSON.stringify(result, null, 2));

    // 🎯 Guardar reporte
    saveReport(result, OUTPUT_FILE, OUTPUT_FORMAT);

    // 🎯 Mostrar estadísticas globales
    const stats = factory.getGlobalStats();
    console.log('\n📊 Estadísticas Globales:');
    console.log(`   Total análisis: ${stats.totalAnalysis}`);
    console.log(`   Success rate: ${stats.successRate}`);

    console.log('\n✅ Análisis completado exitosamente');

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
// ✅ CLOSURES ANIDADOS
//    - createAnalyzerFactory() retorna objeto
//    - createAnalyzer() closure dentro de closure
//    - Estado compartido (globalStats)
//
// ✅ MAP (estructura)
//    - analyzers = new Map()
//    - Almacenar múltiples analizadores por tipo
//
// ✅ ASYNC/AWAIT
//    - async function analyze()
//    - await callLLM()
//    - await fetch()
//
// ✅ TEMPLATE LITERALS
//    - Prompts multilínea complejos
//    - Interpolación de content
//
// ✅ OBJECT LITERAL con métodos
//    - analyzer = { type, config, async analyze() {...} }
//    - Retornar objetos con comportamiento
//
// ✅ DESTRUCTURING
//    - const { LOG_FILE, ANALYSIS_TYPE = 'generic' } = process.env
//    - Valores por defecto
//
// ✅ ARRAY.FOREACH
//    - value.forEach((item, i) => ...)
//
// ✅ FOR...OF + OBJECT.ENTRIES
//    - for (const [key, value] of Object.entries(result))
//
// ✅ TYPEOF checking
//    - typeof value === 'object'
//    - Array.isArray(value)
//
// ✅ REGEX
//    - llmResponse.match(/\{[\s\S]*\}/)
