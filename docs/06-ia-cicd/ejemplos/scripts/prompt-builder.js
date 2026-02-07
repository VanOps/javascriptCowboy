// =============================================
// prompt-builder.js — Constructor de prompts optimizados
// Uso: node scripts/prompt-builder.js --type k8s --severity critical
// =============================================

// 🎯 CLOSURE: Factory de constructores de prompts
function createPromptBuilder() {
  const templates = new Map();
  const builtPrompts = [];

  // 🎯 Registrar templates predefinidos
  function registerTemplates() {
    templates.set('k8s-deployment', {
      system: 'Eres un experto en Kubernetes y troubleshooting de deployments.',
      context: (data) => `
DEPLOYMENT INFO:
- Nombre: ${data.deploymentName || 'N/A'}
- Namespace: ${data.namespace || 'default'}
- Réplicas: ${data.replicas?.desired || 0} deseadas, ${data.replicas?.ready || 0} ready
- Estado: ${data.status || 'Unknown'}

LOGS:
${data.logs || 'No logs available'}

EVENTOS:
${data.events?.join('\n') || 'No events'}
      `,
      task: (severity) => {
        const tasks = {
          low: '¿Hay issues menores que puedan mejorar el deployment?',
          medium: '¿Hay problemas que afecten la estabilidad?',
          high: '¿Hay errores críticos que bloqueen el deployment?',
          critical: '¿Hay fallos catastróficos que requieran rollback inmediato?'
        };
        return tasks[severity] || tasks.medium;
      },
      responseFormat: {
        isValid: 'boolean',
        severity: 'low|medium|high|critical',
        issues: ['issue1', 'issue2'],
        recommendations: ['acción1', 'acción2'],
        requiresRollback: 'boolean'
      }
    });

    templates.set('build-analysis', {
      system: 'Eres un experto en análisis de builds y CI/CD pipelines.',
      context: (data) => `
BUILD INFO:
- Project: ${data.project || 'N/A'}
- Branch: ${data.branch || 'N/A'}
- Commit: ${data.commit || 'N/A'}
- Exit code: ${data.exitCode || 'N/A'}

BUILD OUTPUT:
${data.output || 'No output'}

PREVIOUS BUILDS:
${data.previousBuilds?.map((b, i) => `${i + 1}. ${b.commit} - ${b.status}`).join('\n') || 'N/A'}
      `,
      task: (severity) => `Analiza el build y determina si los errores son ${severity === 'critical' ? 'bloqueantes' : 'resolvibles'}.`,
      responseFormat: {
        buildSuccess: 'boolean',
        errors: ['error1'],
        warnings: ['warning1'],
        fixable: 'boolean',
        estimatedFixTime: 'string (e.g., "5 minutes", "2 hours")'
      }
    });

    templates.set('test-analysis', {
      system: 'Eres un experto en testing y quality assurance.',
      context: (data) => `
TEST RUN:
- Framework: ${data.framework || 'N/A'}
- Total: ${data.total || 0}
- Passed: ${data.passed || 0}
- Failed: ${data.failed || 0}
- Coverage: ${data.coverage || 'N/A'}%

FAILURES:
${data.failures?.map((f, i) => `${i + 1}. ${f.test}: ${f.error}`).join('\n') || 'No failures'}
      `,
      task: (severity) => '¿Los tests fallidos son críticos para release o pueden pasarse temporalmente?',
      responseFormat: {
        blockingRelease: 'boolean',
        criticalFailures: 'number',
        patterns: ['pattern1'],
        coverageAcceptable: 'boolean',
        recommendations: ['fix1']
      }
    });

    templates.set('security-audit', {
      system: 'Eres un experto en seguridad de aplicaciones y vulnerability assessment.',
      context: (data) => `
SECURITY SCAN:
- Tool: ${data.tool || 'N/A'}
- Timestamp: ${data.timestamp || 'N/A'}

VULNERABILITIES:
${data.vulnerabilities?.map((v, i) => 
  `${i + 1}. [${v.severity}] ${v.cve || v.id}: ${v.description}`
).join('\n') || 'No vulnerabilities'}

DEPENDENCIES:
${data.dependencies?.map((d) => `- ${d.name}@${d.version}`).join('\n') || 'N/A'}
      `,
      task: (severity) => `¿Hay vulnerabilidades ${severity === 'critical' ? 'CRITICAL/HIGH' : 'MEDIUM/LOW'} que bloqueen deploy?`,
      responseFormat: {
        blockProduction: 'boolean',
        cves: ['CVE-xxxx'],
        patchesAvailable: 'boolean',
        recommendations: ['upgrade package X', 'apply patch Y']
      }
    });

    templates.set('performance-analysis', {
      system: 'Eres un experto en performance optimization y profiling.',
      context: (data) => `
PERFORMANCE METRICS:
- Response time: ${data.responseTime || 'N/A'}ms
- Throughput: ${data.throughput || 'N/A'} req/s
- Error rate: ${data.errorRate || 'N/A'}%
- CPU: ${data.cpu || 'N/A'}%
- Memory: ${data.memory || 'N/A'}

SLOW QUERIES/ENDPOINTS:
${data.slowQueries?.map((q, i) => `${i + 1}. ${q.query}: ${q.duration}ms`).join('\n') || 'N/A'}
      `,
      task: (severity) => '¿Hay problemas de performance que afecten UX o estabilidad?',
      responseFormat: {
        performanceAcceptable: 'boolean',
        bottlenecks: ['bottleneck1'],
        optimizations: ['optimization1'],
        estimatedImprovement: 'string (e.g., "30% faster")'
      }
    });
  }

  return {
    init() {
      registerTemplates();
      console.log(`✅ ${templates.size} templates registrados`);
    },

    // 🎯 Construir prompt desde template
    build(type, data, options = {}) {
      const template = templates.get(type);

      if (!template) {
        throw new Error(`Template no encontrado: ${type}. Disponibles: ${Array.from(templates.keys()).join(', ')}`);
      }

      // 🎯 DESTRUCTURING con defaults
      const {
        severity = 'medium',
        includeSystem = true,
        format = 'json'
      } = options;

      // Construir prompt completo
      const parts = [];

      if (includeSystem) {
        parts.push(`SISTEMA: ${template.system}\n`);
      }

      parts.push(template.context(data));
      parts.push(`\nTAREA: ${template.task(severity)}\n`);

      if (format === 'json') {
        parts.push(`FORMATO DE RESPUESTA (JSON):`);
        parts.push(JSON.stringify(template.responseFormat, null, 2));
        parts.push('\nResponde SOLO con JSON válido (sin markdown):');
      }

      const prompt = parts.join('\n');

      // Guardar en historial
      builtPrompts.push({
        type,
        severity,
        timestamp: new Date().toISOString(),
        length: prompt.length
      });

      return prompt;
    },

    // 🎯 Listar templates disponibles
    listTemplates() {
      return Array.from(templates.keys());
    },

    // 🎯 Obtener estadísticas
    getStats() {
      return {
        templatesAvailable: templates.size,
        promptsBuilt: builtPrompts.length,
        avgPromptLength: builtPrompts.length > 0
          ? Math.round(
              builtPrompts.reduce((sum, p) => sum + p.length, 0) / builtPrompts.length
            )
          : 0
      };
    },

    // 🎯 Agregar template personalizado
    addTemplate(name, template) {
      if (templates.has(name)) {
        console.warn(`⚠️  Template '${name}' ya existe, sobrescribiendo...`);
      }

      templates.set(name, template);
      console.log(`✅ Template '${name}' agregado`);
    }
  };
}

// 🎯 Parsear argumentos CLI
function parseArgs(argv) {
  const args = {};
  
  // 🎯 FOR loop con índice para pares --key value
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      
      args[key] = value;
      i++; // Saltar el valor
    }
  }

  return args;
}

// 🎯 Main function
async function main() {
  console.log('═'.repeat(60));
  console.log('🔧 PROMPT BUILDER');
  console.log('═'.repeat(60));

  // 🎯 Parsear args de CLI
  const args = parseArgs(process.argv);

  // 🎯 DESTRUCTURING con defaults
  const {
    type,
    severity = 'medium',
    'list-templates': listTemplates,
    'output-file': outputFile
  } = args;

  // Crear builder
  const builder = createPromptBuilder();
  builder.init();

  // 🎯 Si se pide listar templates
  if (listTemplates !== undefined) {
    console.log('\n📋 Templates Disponibles:\n');
    const templates = builder.listTemplates();
    templates.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t}`);
    });
    console.log('\nUso:');
    console.log('  node prompt-builder.js --type k8s-deployment --severity critical');
    process.exit(0);
  }

  // Validación
  if (!type) {
    console.error('❌ Error: --type es requerido');
    console.error('\nTemplates disponibles:');
    builder.listTemplates().forEach(t => console.error(`  - ${t}`));
    console.error('\nEjemplo:');
    console.error('  node prompt-builder.js --type k8s-deployment --severity high');
    process.exit(1);
  }

  try {
    console.log(`\n⚙️  Configuración:`);
    console.log(`   Type: ${type}`);
    console.log(`   Severity: ${severity}`);

    // 🎯 Data de ejemplo según tipo
    const exampleData = getExampleData(type);

    // 🎯 Construir prompt
    const prompt = builder.build(type, exampleData, {
      severity,
      includeSystem: true,
      format: 'json'
    });

    console.log('\n' + '═'.repeat(60));
    console.log('📝 PROMPT GENERADO');
    console.log('═'.repeat(60));
    console.log(prompt);

    // 🎯 Guardar a archivo si se especifica
    if (outputFile) {
      const { writeFileSync } = await import('fs');
      writeFileSync(outputFile, prompt);
      console.log(`\n💾 Prompt guardado: ${outputFile}`);
    }

    // 🎯 Mostrar stats
    const stats = builder.getStats();
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Templates: ${stats.templatesAvailable}`);
    console.log(`   Prompts built: ${stats.promptsBuilt}`);
    console.log(`   Avg length: ${stats.avgPromptLength} chars`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// 🎯 Obtener data de ejemplo según tipo
function getExampleData(type) {
  const examples = {
    'k8s-deployment': {
      deploymentName: 'api-backend',
      namespace: 'production',
      replicas: { desired: 5, ready: 2 },
      status: 'CrashLoopBackOff',
      logs: 'Error: Cannot connect to database\nConnection timeout after 5000ms',
      events: [
        'Warning: BackOff restarting failed container',
        'Warning: Readiness probe failed'
      ]
    },
    'build-analysis': {
      project: 'frontend-app',
      branch: 'main',
      commit: 'abc123',
      exitCode: 1,
      output: 'ERROR: TypeScript compilation failed\nTS2345: Type mismatch',
      previousBuilds: [
        { commit: 'xyz789', status: 'success' },
        { commit: 'def456', status: 'success' }
      ]
    },
    'test-analysis': {
      framework: 'Jest',
      total: 150,
      passed: 142,
      failed: 8,
      coverage: 78,
      failures: [
        { test: 'should process payment', error: 'TypeError: amount is undefined' },
        { test: 'should validate email', error: 'AssertionError: expected true to be false' }
      ]
    },
    'security-audit': {
      tool: 'npm audit',
      timestamp: new Date().toISOString(),
      vulnerabilities: [
        { severity: 'HIGH', cve: 'CVE-2023-1234', description: 'Prototype pollution in lodash' },
        { severity: 'MEDIUM', cve: 'CVE-2023-5678', description: 'XSS vulnerability in express' }
      ],
      dependencies: [
        { name: 'lodash', version: '4.17.19' },
        { name: 'express', version: '4.17.1' }
      ]
    },
    'performance-analysis': {
      responseTime: 1250,
      throughput: 45,
      errorRate: 2.3,
      cpu: 78,
      memory: '1.2GB / 2GB',
      slowQueries: [
        { query: 'SELECT * FROM users WHERE ...', duration: 3500 },
        { query: 'JOIN orders ON ...', duration: 2800 }
      ]
    }
  };

  return examples[type] || {};
}

// Ejecutar
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// 🔍 CONCEPTOS JAVASCRIPT USADOS:
//
// ✅ CLOSURES
//    - createPromptBuilder() con templates y builtPrompts privados
//    - registerTemplates() closure interno
//
// ✅ MAP (estructura)
//    - templates = new Map()
//    - templates.set(), get(), has()
//    - Array.from(templates.keys())
//
// ✅ OBJECT LITERAL con funciones
//    - { context: (data) => ..., task: (severity) => ... }
//    - Funciones como valores de objeto
//
// ✅ ARROW FUNCTIONS
//    - (data) => `template...`
//    - (severity) => { ... }
//
// ✅ TEMPLATE LITERALS
//    - Construcción de prompts multilínea
//    - Interpolación compleja
//
// ✅ DESTRUCTURING
//    - const { severity = 'medium', includeSystem = true } = options
//    - const { type, 'list-templates': listTemplates } = args
//
// ✅ ARRAY METHODS
//    - data.events?.join('\n')
//    - data.previousBuilds?.map((b, i) => ...)
//    - builtPrompts.reduce((sum, p) => sum + p.length, 0)
//
// ✅ OPTIONAL CHAINING
//    - data.replicas?.desired
//    - data.events?.join()
//
// ✅ FOR LOOP tradicional
//    - for (let i = 2; i < argv.length; i++)
//    - Control de índice manual
//
// ✅ ARRAY.FROM
//    - Array.from(templates.keys())
//    - Convertir iterador a array
//
// ✅ DYNAMIC IMPORTS
//    - await import('fs')
//    - Imports condicionales
