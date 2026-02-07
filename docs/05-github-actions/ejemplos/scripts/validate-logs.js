// =============================================
// validate-logs.js — Validador de logs para CI/CD gates
// Uso: node scripts/validate-logs.js
// =============================================

// 🎯 CLOSURE: Analizador de logs con estadísticas
function createLogAnalyzer() {
  // Estado privado
  const stats = {
    totalLines: 0,
    errors: [],
    warnings: [],
    criticals: [],
    patterns: new Map()
  };

  // 🎯 Patrones de búsqueda configurables
  const defaultPatterns = {
    error: [
      /ERROR/i,
      /Exception/i,
      /Failed/i,
      /fatal/i,
      /\[ERR\]/i
    ],
    warning: [
      /WARNING/i,
      /WARN/i,
      /deprecated/i,
      /\[WARN\]/i
    ],
    critical: [
      /CRITICAL/i,
      /FATAL/i,
      /OutOfMemory/i,
      /StackOverflow/i,
      /\[CRIT\]/i
    ]
  };

  return {
    // 🎯 Analizar una línea de log
    analyzeLine(line, lineNumber) {
      stats.totalLines++;

      // 🎯 OBJECT.ENTRIES para iterar patrones
      for (const [level, patterns] of Object.entries(defaultPatterns)) {
        // 🎯 ARRAY.SOME: verificar si algún patrón coincide
        const matched = patterns.some(pattern => pattern.test(line));

        if (matched) {
          const entry = {
            line: lineNumber,
            content: line.trim(),
            level,
            timestamp: new Date().toISOString()
          };

          // Agregar al array correspondiente
          stats[`${level}s`].push(entry);

          // Contar ocurrencias de patrones
          const key = `${level}_count`;
          stats.patterns.set(key, (stats.patterns.get(key) || 0) + 1);

          break; // Solo contar una vez por línea
        }
      }
    },

    // 🎯 Analizar archivo completo
    analyzeFile(content) {
      console.log('🔍 Analizando logs...\n');

      // 🎯 SPLIT + FOREACH para procesar líneas
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        this.analyzeLine(line, index + 1);
      });

      console.log(`✅ ${stats.totalLines} líneas analizadas`);
      return this.getResults();
    },

    // 🎯 Obtener resultados
    getResults() {
      return {
        summary: {
          totalLines: stats.totalLines,
          errorCount: stats.errors.length,
          warningCount: stats.warnings.length,
          criticalCount: stats.criticals.length
        },
        errors: stats.errors,
        warnings: stats.warnings,
        criticals: stats.criticals
      };
    },

    // 🎯 Agregar patrón personalizado
    addPattern(level, regex) {
      if (!defaultPatterns[level]) {
        defaultPatterns[level] = [];
      }
      defaultPatterns[level].push(regex);
      console.log(`➕ Patrón agregado: ${level} -> ${regex}`);
    }
  };
}

// 🎯 CLOSURE: Generador de reportes con formateo
function createReporter() {
  const formats = {
    // 🎯 Formato para GitHub Actions
    github: (results) => {
      const lines = [];
      
      lines.push('## 📊 Análisis de Logs\n');
      lines.push(`- **Total líneas**: ${results.summary.totalLines}`);
      lines.push(`- **Errores**: ${results.summary.errorCount} ❌`);
      lines.push(`- **Warnings**: ${results.summary.warningCount} ⚠️`);
      lines.push(`- **Críticos**: ${results.summary.criticalCount} 🔴\n`);

      // 🎯 Mostrar críticos si hay
      if (results.criticals.length > 0) {
        lines.push('### 🔴 Errores Críticos\n');
        // 🎯 SLICE: limitar a primeros 5
        results.criticals.slice(0, 5).forEach(entry => {
          lines.push(`- Línea ${entry.line}: \`${entry.content}\``);
        });
        lines.push('');
      }

      // 🎯 Mostrar errores si hay
      if (results.errors.length > 0) {
        lines.push('### ❌ Errores\n');
        results.errors.slice(0, 10).forEach(entry => {
          lines.push(`- Línea ${entry.line}: \`${entry.content}\``);
        });
        if (results.errors.length > 10) {
          lines.push(`\n_... y ${results.errors.length - 10} errores más_\n`);
        }
      }

      return lines.join('\n');
    },

    // 🎯 Formato JSON
    json: (results) => {
      return JSON.stringify(results, null, 2);
    },

    // 🎯 Formato consola con colores (básico)
    console: (results) => {
      const lines = [];
      
      lines.push('\n' + '═'.repeat(50));
      lines.push('📊 RESUMEN DE ANÁLISIS');
      lines.push('═'.repeat(50));
      lines.push(`Total líneas: ${results.summary.totalLines}`);
      lines.push(`Críticos:     ${results.summary.criticalCount} 🔴`);
      lines.push(`Errores:      ${results.summary.errorCount} ❌`);
      lines.push(`Warnings:     ${results.summary.warningCount} ⚠️`);
      
      return lines.join('\n');
    }
  };

  return {
    generate(results, format = 'console') {
      const formatter = formats[format];
      
      if (!formatter) {
        throw new Error(`Formato no soportado: ${format}`);
      }

      return formatter(results);
    },

    // 🎯 Guardar reporte
    save(results, format, filePath) {
      const { writeFileSync } = await import('fs');
      const content = this.generate(results, format);
      
      writeFileSync(filePath, content);
      console.log(`💾 Reporte guardado: ${filePath}`);
    }
  };
}

// 🎯 Validar umbrales (thresholds)
function validateThresholds(results, thresholds) {
  console.log('\n🎯 Validando umbrales...');

  // 🎯 DESTRUCTURING con defaults
  const {
    maxErrors = 0,
    maxWarnings = 10,
    maxCriticals = 0,
    failOnCritical = true
  } = thresholds;

  const violations = [];

  // 🎯 Verificar críticos
  if (results.summary.criticalCount > maxCriticals) {
    violations.push({
      type: 'critical',
      count: results.summary.criticalCount,
      max: maxCriticals,
      message: `${results.summary.criticalCount} críticos encontrados (máx: ${maxCriticals})`
    });
  }

  // 🎯 Verificar errores
  if (results.summary.errorCount > maxErrors) {
    violations.push({
      type: 'error',
      count: results.summary.errorCount,
      max: maxErrors,
      message: `${results.summary.errorCount} errores encontrados (máx: ${maxErrors})`
    });
  }

  // 🎯 Verificar warnings
  if (results.summary.warningCount > maxWarnings) {
    violations.push({
      type: 'warning',
      count: results.summary.warningCount,
      max: maxWarnings,
      message: `${results.summary.warningCount} warnings encontrados (máx: ${maxWarnings})`
    });
  }

  // 🎯 Mostrar violaciones
  if (violations.length > 0) {
    console.log('\n❌ Umbrales excedidos:');
    violations.forEach(v => {
      console.log(`   - ${v.message}`);
    });
    return false;
  }

  console.log('✅ Todos los umbrales cumplidos');
  return true;
}

// 🎯 Main function
async function main() {
  const { readFileSync, writeFileSync, existsSync } = await import('fs');

  console.log('═'.repeat(50));
  console.log('📋 LOG VALIDATOR');
  console.log('═'.repeat(50));

  // 🎯 DESTRUCTURING de env vars
  const {
    LOG_FILE,
    MAX_ERRORS = '0',
    MAX_WARNINGS = '10',
    MAX_CRITICALS = '0',
    OUTPUT_FORMAT = 'console',
    REPORT_FILE = './log-report.md',
    GITHUB_STEP_SUMMARY,
    GITHUB_OUTPUT
  } = process.env;

  // Validación
  if (!LOG_FILE) {
    console.error('❌ Error: LOG_FILE env var es requerida');
    console.error('   Uso: LOG_FILE=./app.log node validate-logs.js');
    process.exit(1);
  }

  if (!existsSync(LOG_FILE)) {
    console.error(`❌ Error: Archivo no encontrado: ${LOG_FILE}`);
    process.exit(1);
  }

  try {
    console.log(`\n📂 Archivo: ${LOG_FILE}`);

    // 🎯 Leer archivo de logs
    const logContent = readFileSync(LOG_FILE, 'utf-8');

    // 🎯 Crear analizador (closure)
    const analyzer = createLogAnalyzer();

    // 🎯 Agregar patrones personalizados (opcional)
    // analyzer.addPattern('error', /CUSTOM_ERROR/);

    // 🎯 Analizar logs
    const results = analyzer.analyzeFile(logContent);

    // 🎯 Crear reporter (closure)
    const reporter = createReporter();

    // 🎯 Generar y mostrar reporte
    const consoleReport = reporter.generate(results, 'console');
    console.log(consoleReport);

    // 🎯 Validar umbrales
    const thresholds = {
      maxErrors: parseInt(MAX_ERRORS),
      maxWarnings: parseInt(MAX_WARNINGS),
      maxCriticals: parseInt(MAX_CRITICALS),
      failOnCritical: true
    };

    const passed = validateThresholds(results, thresholds);

    // 🎯 Guardar reporte para GitHub Actions
    if (GITHUB_STEP_SUMMARY) {
      const githubReport = reporter.generate(results, 'github');
      writeFileSync(GITHUB_STEP_SUMMARY, githubReport, { flag: 'a' });
      console.log(`\n📝 Reporte agregado a GitHub Step Summary`);
    }

    // 🎯 Guardar reporte en archivo
    if (OUTPUT_FORMAT !== 'console') {
      const fileReport = reporter.generate(results, OUTPUT_FORMAT);
      writeFileSync(REPORT_FILE, fileReport);
      console.log(`💾 Reporte guardado: ${REPORT_FILE}`);
    }

    // 🎯 Escribir outputs para GitHub Actions
    if (GITHUB_OUTPUT) {
      const outputs = [
        `error-count=${results.summary.errorCount}`,
        `warning-count=${results.summary.warningCount}`,
        `critical-count=${results.summary.criticalCount}`,
        `validation-passed=${passed}`
      ];
      
      writeFileSync(GITHUB_OUTPUT, outputs.join('\n') + '\n', { flag: 'a' });
    }

    // 🎯 Exit con código según resultado
    if (!passed) {
      console.log('\n❌ Validación FALLIDA - exit code 1');
      process.exit(1);
    }

    console.log('\n✅ Validación EXITOSA - exit code 0');
    process.exit(0);

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
//    - createLogAnalyzer() con stats privado
//    - createReporter() con formats privado
//    - Estado encapsulado y persistente
//
// ✅ MAP (estructura de datos)
//    - stats.patterns = new Map()
//    - stats.patterns.set(), get()
//    - Almacenar contadores de patrones
//
// ✅ REGEX (expresiones regulares)
//    - /ERROR/i, /Exception/i
//    - pattern.test(line) para matching
//    - Búsqueda de patrones en logs
//
// ✅ ARRAY METHODS
//    - patterns.some(pattern => pattern.test(line))
//    - lines.forEach((line, index) => ...)
//    - results.criticals.slice(0, 5)
//    - violations.forEach()
//
// ✅ DESTRUCTURING
//    - const { maxErrors = 0 } = thresholds
//    - const { LOG_FILE, MAX_ERRORS = '0' } = process.env
//    - Valores por defecto
//
// ✅ TEMPLATE LITERALS
//    - `${results.summary.errorCount} errores`
//    - Construcción dinámica de mensajes
//
// ✅ FOR...OF
//    - for (const [level, patterns] of Object.entries(...))
//    - Iteración sobre pares clave-valor
//
// ✅ OBJECT METHODS
//    - Object.entries() para convertir a array
//    - JSON.stringify() para serialización
//
// ✅ STRING METHODS
//    - content.split('\n') para dividir por líneas
//    - line.trim() para limpiar espacios
//    - lines.join('\n') para unir array
//
// ✅ DYNAMIC IMPORTS
//    - await import('fs')
//    - Imports asíncronos
//
// ✅ CONDITIONAL LOGIC
//    - if/else para control de flujo
//    - Ternarios para asignaciones condicionales
//    - process.exit(0/1) para códigos de salida
