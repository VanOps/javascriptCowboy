// =============================================
// score-calculator.js — Calculador de scores CI/CD
// Uso: node scripts/score-calculator.js --errors 3 --warnings 10 --coverage 85
// =============================================

// 🎯 CLOSURE: Sistema de scoring con pesos configurables
function createScoringSystem(config = {}) {
  // 🎯 Pesos por defecto (closure privado)
  const defaultWeights = {
    errors: 30,        // Errores críticos (30% del score)
    warnings: 15,      // Warnings (15%)
    coverage: 25,      // Cobertura de tests (25%)
    performance: 15,   // Performance metrics (15%)
    security: 15       // Vulnerabilidades (15%)
  };

  const weights = { ...defaultWeights, ...config.weights };
  const history = [];

  // 🎯 Verificar que pesos sumen 100
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (totalWeight !== 100) {
    console.warn(`⚠️  Pesos suman ${totalWeight}%, ajustando proporcionalmente...`);
    // 🎯 Normalizar pesos
    Object.keys(weights).forEach(key => {
      weights[key] = (weights[key] / totalWeight) * 100;
    });
  }

  return {
    // 🎯 Calcular score basado en métricas
    calculate(metrics) {
      console.log('\n🔢 Calculando score...');

      let totalScore = 0;
      const breakdown = {};

      // 🎯 ERRORES: Penalización exponencial
      if ('errors' in metrics) {
        const errorPenalty = Math.min(100, metrics.errors * 10); // 10 puntos por error
        const errorScore = Math.max(0, 100 - errorPenalty);
        breakdown.errors = {
          score: errorScore,
          weight: weights.errors,
          contribution: (errorScore * weights.errors) / 100,
          details: `${metrics.errors} errores detectados`
        };
        totalScore += breakdown.errors.contribution;
      }

      // 🎯 WARNINGS: Penalización lineal
      if ('warnings' in metrics) {
        const warningPenalty = Math.min(100, metrics.warnings * 2); // 2 puntos por warning
        const warningScore = Math.max(0, 100 - warningPenalty);
        breakdown.warnings = {
          score: warningScore,
          weight: weights.warnings,
          contribution: (warningScore * weights.warnings) / 100,
          details: `${metrics.warnings} warnings`
        };
        totalScore += breakdown.warnings.contribution;
      }

      // 🎯 COVERAGE: Score directo con umbral
      if ('coverage' in metrics) {
        const coverageScore = metrics.coverage; // Ya es porcentaje 0-100
        const bonus = metrics.coverage >= 80 ? 10 : 0; // Bonus por >80%
        const finalCoverageScore = Math.min(100, coverageScore + bonus);
        
        breakdown.coverage = {
          score: finalCoverageScore,
          weight: weights.coverage,
          contribution: (finalCoverageScore * weights.coverage) / 100,
          details: `${metrics.coverage}% cobertura${bonus > 0 ? ' (+bonus)' : ''}`
        };
        totalScore += breakdown.coverage.contribution;
      }

      // 🎯 PERFORMANCE: Basado en response time
      if ('responseTime' in metrics) {
        // Escala: <100ms=100pts, >1000ms=0pts
        const perfScore = Math.max(0, 100 - (metrics.responseTime / 10));
        breakdown.performance = {
          score: perfScore,
          weight: weights.performance,
          contribution: (perfScore * weights.performance) / 100,
          details: `${metrics.responseTime}ms response time`
        };
        totalScore += breakdown.performance.contribution;
      }

      // 🎯 SECURITY: Penalización por severidad de CVEs
      if ('vulnerabilities' in metrics) {
        const { critical = 0, high = 0, medium = 0, low = 0 } = metrics.vulnerabilities;
        
        // Pesos: critical=25pts, high=10pts, medium=5pts, low=1pt
        const securityPenalty = (critical * 25) + (high * 10) + (medium * 5) + (low * 1);
        const securityScore = Math.max(0, 100 - securityPenalty);
        
        breakdown.security = {
          score: securityScore,
          weight: weights.security,
          contribution: (securityScore * weights.security) / 100,
          details: `${critical}C/${high}H/${medium}M/${low}L vulnerabilities`
        };
        totalScore += breakdown.security.contribution;
      }

      // 🎯 Redondear score final
      const finalScore = Math.round(totalScore);

      // 🎯 Determinar grade
      const grade = getGrade(finalScore);

      // 🎯 Determinar status
      const status = finalScore >= 70 ? 'PASS' : 'FAIL';

      const result = {
        score: finalScore,
        grade,
        status,
        breakdown,
        metrics,
        timestamp: new Date().toISOString()
      };

      // Guardar en historial
      history.push(result);

      return result;
    },

    // 🎯 Obtener tendencia de scores
    getTrend() {
      if (history.length < 2) {
        return { trend: 'insufficient-data', change: 0 };
      }

      // 🎯 Últimos 2 scores
      const current = history[history.length - 1].score;
      const previous = history[history.length - 2].score;

      const change = current - previous;
      
      let trend;
      if (change > 5) trend = 'improving';
      else if (change < -5) trend = 'degrading';
      else trend = 'stable';

      return { trend, change, current, previous };
    },

    // 🎯 Obtener historial
    getHistory() {
      return history;
    },

    // 🎯 Obtener configuración de pesos
    getWeights() {
      return { ...weights };
    }
  };
}

// 🎯 Convertir score a grade letter
function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// 🎯 Formatear breakdown para display
function formatBreakdown(breakdown) {
  console.log('\n📊 Score Breakdown:\n');

  // 🎯 OBJECT.ENTRIES + SORT
  const entries = Object.entries(breakdown).sort((a, b) => 
    b[1].contribution - a[1].contribution
  );

  entries.forEach(([category, data]) => {
    const bar = createProgressBar(data.score, 30);
    console.log(`   ${category.padEnd(12)} ${bar} ${data.score.toFixed(1)}/100`);
    console.log(`   ${''.padEnd(12)} Weight: ${data.weight.toFixed(1)}% | Contribution: ${data.contribution.toFixed(1)}`);
    console.log(`   ${''.padEnd(12)} ${data.details}`);
    console.log('');
  });
}

// 🎯 Crear barra de progreso ASCII
function createProgressBar(percentage, length = 20) {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;

  // 🎯 REPEAT: Crear caracteres repetidos
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  // Color según porcentaje
  const color = percentage >= 80 ? '🟢'
    : percentage >= 50 ? '🟡'
    : '🔴';

  return `${color} [${bar}]`;
}

// 🎯 Parsear argumentos CLI
function parseArgs(argv) {
  const args = {};
  
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      let value = argv[i + 1];
      
      // 🎯 Convertir a número si es numérico
      if (!isNaN(value)) {
        value = parseFloat(value);
      }
      
      args[key] = value;
      i++;
    }
  }

  return args;
}

// 🎯 Main function
async function main() {
  console.log('═'.repeat(60));
  console.log('📊 CI/CD SCORE CALCULATOR');
  console.log('═'.repeat(60));

  // 🎯 Parsear args
  const args = parseArgs(process.argv);

  // 🎯 DESTRUCTURING
  const {
    errors = 0,
    warnings = 0,
    coverage,
    'response-time': responseTime,
    critical = 0,
    high = 0,
    medium = 0,
    low = 0,
    'output-file': outputFile
  } = args;

  console.log(`\n⚙️  Métricas Input:`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Warnings: ${warnings}`);
  if (coverage !== undefined) console.log(`   Coverage: ${coverage}%`);
  if (responseTime !== undefined) console.log(`   Response time: ${responseTime}ms`);
  if (critical || high || medium || low) {
    console.log(`   Vulnerabilities: ${critical}C/${high}H/${medium}M/${low}L`);
  }

  try {
    // 🎯 Crear scoring system
    const scorer = createScoringSystem({
      weights: {
        errors: 30,
        warnings: 15,
        coverage: 25,
        performance: 15,
        security: 15
      }
    });

    // 🎯 Preparar métricas
    const metrics = {
      errors,
      warnings
    };

    if (coverage !== undefined) metrics.coverage = coverage;
    if (responseTime !== undefined) metrics.responseTime = responseTime;
    if (critical || high || medium || low) {
      metrics.vulnerabilities = { critical, high, medium, low };
    }

    // 🎯 Calcular score
    const result = scorer.calculate(metrics);

    // 🎯 Mostrar resultado
    console.log('\n' + '═'.repeat(60));
    console.log('🎯 RESULTADO FINAL');
    console.log('═'.repeat(60));

    const statusIcon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`\n${statusIcon} Status: ${result.status}`);
    console.log(`📊 Score: ${result.score}/100`);
    console.log(`🎓 Grade: ${result.grade}`);

    // 🎯 Mostrar breakdown
    formatBreakdown(result.breakdown);

    // 🎯 Recomendaciones según score
    console.log('💡 Recomendaciones:\n');
    
    if (result.score < 70) {
      console.log('   ❌ CI/CD BLOQUEADO - Score insuficiente');
      
      // 🎯 ARRAY.FILTER + SORT: Encontrar categorías con peor score
      const worstCategories = Object.entries(result.breakdown)
        .filter(([_, data]) => data.score < 70)
        .sort((a, b) => a[1].score - b[1].score);

      if (worstCategories.length > 0) {
        console.log('\n   Categorías que requieren atención:');
        worstCategories.forEach(([cat, data]) => {
          console.log(`   - ${cat}: ${data.score.toFixed(1)}/100 - ${data.details}`);
        });
      }
    } else if (result.score < 80) {
      console.log('   ⚠️  CI/CD APROBADO pero con mejoras recomendadas');
    } else {
      console.log('   ✅ CI/CD EXCELENTE - Continuar con deploy');
    }

    // 🎯 Guardar reporte si se especifica
    if (outputFile) {
      const { writeFileSync } = await import('fs');
      
      const report = {
        ...result,
        weights: scorer.getWeights()
      };

      writeFileSync(outputFile, JSON.stringify(report, null, 2));
      console.log(`\n💾 Reporte guardado: ${outputFile}`);
    }

    // 🎯 Exit code según status
    process.exit(result.status === 'PASS' ? 0 : 1);

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
//    - createScoringSystem() con weights y history privados
//    - Estado encapsulado persistente
//
// ✅ SPREAD OPERATOR
//    - { ...defaultWeights, ...config.weights }
//    - Merge de objetos
//
// ✅ OBJECT.VALUES + REDUCE
//    - Object.values(weights).reduce((sum, w) => sum + w, 0)
//    - Sumar todos los valores
//
// ✅ OBJECT.KEYS + FOREACH
//    - Object.keys(weights).forEach(key => ...)
//    - Iterar claves
//
// ✅ DESTRUCTURING anidado
//    - const { critical = 0, high = 0 } = metrics.vulnerabilities
//    - Valores por defecto en destructuring
//
// ✅ MATH METHODS
//    - Math.min(), Math.max()
//    - Math.round()
//
// ✅ IN OPERATOR
//    - 'errors' in metrics
//    - Verificar existencia de propiedad
//
// ✅ TERNARY OPERATORS
//    - trend = change > 5 ? 'improving' : change < -5 ? 'degrading' : 'stable'
//    - Condicionales anidadas
//
// ✅ ARRAY METHODS avanzados
//    - Object.entries().sort((a, b) => ...)
//    - .filter().sort() encadenado
//
// ✅ STRING.REPEAT
//    - '█'.repeat(filled)
//    - Crear caracteres repetidos
//
// ✅ STRING.PADEND
//    - category.padEnd(12)
//    - Alinear texto
//
// ✅ TEMPLATE LITERALS
//    - Construcción de mensajes
//    - Interpolación
//
// ✅ ISNAN
//    - !isNaN(value)
//    - Validar números
