// =============================================
// deploy-k8s.js — Deploy standalone a Kubernetes
// Uso: node scripts/deploy-k8s.js
// =============================================

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// 🎯 CLOSURE: Ejecutor de comandos con logging
function createCommandRunner(dryRun = false) {
  const executedCommands = [];

  return {
    run(command, options = {}) {
      executedCommands.push({
        command,
        timestamp: new Date().toISOString(),
        dryRun
      });

      console.log(`\n💻 ${dryRun ? '[DRY-RUN] ' : ''}Ejecutando:`);
      console.log(`   ${command}`);

      if (dryRun) {
        console.log('   ⏭️  Saltando ejecución (dry-run)');
        return '(dry-run)';
      }

      try {
        const output = execSync(command, {
          encoding: 'utf-8',
          ...options
        });

        return output.trim();
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        throw error;
      }
    },

    getHistory() {
      return executedCommands;
    },

    summary() {
      console.log(`\n📊 Comandos ejecutados: ${executedCommands.length}`);
      executedCommands.forEach((cmd, i) => {
        console.log(`   ${i + 1}. ${cmd.command.substring(0, 60)}...`);
      });
    }
  };
}

// 🎯 CLOSURE: Gestor de manifiestos K8s
function createManifestManager() {
  const manifests = [];

  return {
    load(path) {
      if (!existsSync(path)) {
        throw new Error(`Manifest no encontrado: ${path}`);
      }

      const content = readFileSync(path, 'utf-8');
      manifests.push({ path, content });
      
      console.log(`📄 Manifest cargado: ${path}`);
      return content;
    },

    // 🎯 Reemplazar placeholders en manifests
    interpolate(content, values) {
      let interpolated = content;

      // 🎯 OBJECT.ENTRIES + REDUCE
      const replacements = Object.entries(values).reduce((acc, [key, value]) => {
        const placeholder = `\${${key}}`;
        acc[placeholder] = value;
        return acc;
      }, {});

      // 🎯 FOR...OF para reemplazos
      for (const [placeholder, value] of Object.entries(replacements)) {
        // 🎯 REGEX global para reemplazar todas las ocurrencias
        interpolated = interpolated.replace(new RegExp(placeholder, 'g'), value);
      }

      return interpolated;
    },

    validate(content) {
      // Verificar que es YAML válido (básico)
      const hasApiVersion = /apiVersion:\s*\S+/.test(content);
      const hasKind = /kind:\s*\S+/.test(content);
      const hasMetadata = /metadata:/.test(content);

      if (!hasApiVersion || !hasKind || !hasMetadata) {
        throw new Error('Manifest K8s inválido: falta apiVersion, kind o metadata');
      }

      console.log('   ✅ Manifest válido');
      return true;
    },

    getManifests() {
      return manifests;
    }
  };
}

// 🎯 Función para obtener status de deployment
async function getDeploymentStatus(name, namespace, runner) {
  console.log(`\n🔍 Verificando status de deployment...`);

  try {
    // Get deployment info
    const deploymentInfo = runner.run(
      `kubectl get deployment ${name} -n ${namespace} -o json`
    );

    const deployment = JSON.parse(deploymentInfo);
    
    // 🎯 DESTRUCTURING anidado con defaults
    const {
      status: {
        replicas = 0,
        availableReplicas = 0,
        updatedReplicas = 0,
        conditions = []
      } = {}
    } = deployment;

    // 🎯 ARRAY.FIND para buscar condición
    const availableCondition = conditions.find(
      c => c.type === 'Available'
    );

    const isAvailable = availableCondition?.status === 'True';

    return {
      name,
      namespace,
      replicas,
      availableReplicas,
      updatedReplicas,
      isAvailable,
      ready: availableReplicas === replicas && replicas > 0
    };

  } catch (error) {
    console.error(`❌ Error obteniendo status: ${error.message}`);
    return null;
  }
}

// 🎯 Main function
async function main() {
  console.log('═'.repeat(50));
  console.log('🚀 KUBERNETES DEPLOYMENT SCRIPT');
  console.log('═'.repeat(50));

  // 🎯 DESTRUCTURING con defaults
  const {
    DEPLOYMENT_NAME = 'mi-app',
    NAMESPACE = 'default',
    IMAGE_TAG = 'latest',
    IMAGE_REPO = 'ghcr.io/my-org/mi-app',
    MANIFEST_PATH = './k8s/deployment.yaml',
    DRY_RUN = 'false',
    GITHUB_OUTPUT
  } = process.env;

  const dryRun = DRY_RUN === 'true';

  // Crear herramientas (closures)
  const runner = createCommandRunner(dryRun);
  const manifestManager = createManifestManager();

  console.log(`\n⚙️  Configuración:`);
  console.log(`   Deployment: ${DEPLOYMENT_NAME}`);
  console.log(`   Namespace: ${NAMESPACE}`);
  console.log(`   Image: ${IMAGE_REPO}:${IMAGE_TAG}`);
  console.log(`   Dry-run: ${dryRun}`);

  try {
    // 🎯 OPCIÓN 1: Aplicar manifest desde archivo
    if (existsSync(MANIFEST_PATH)) {
      console.log(`\n📄 Usando manifest: ${MANIFEST_PATH}`);

      // Cargar y validar manifest
      const manifest = manifestManager.load(MANIFEST_PATH);
      manifestManager.validate(manifest);

      // 🎯 Interpolar variables
      const interpolated = manifestManager.interpolate(manifest, {
        DEPLOYMENT_NAME,
        NAMESPACE,
        IMAGE: `${IMAGE_REPO}:${IMAGE_TAG}`
      });

      // Guardar manifest interpolado temporalmente
      const tempPath = `/tmp/k8s-manifest-${Date.now()}.yaml`;
      writeFileSync(tempPath, interpolated);

      // Aplicar manifest
      runner.run(`kubectl apply -f ${tempPath} -n ${NAMESPACE}`);

      console.log('   ✅ Manifest aplicado');

    } else {
      // 🎯 OPCIÓN 2: Actualizar imagen directamente
      console.log(`\n🔄 Actualizando imagen con kubectl set image`);

      const fullImage = `${IMAGE_REPO}:${IMAGE_TAG}`;
      
      runner.run(
        `kubectl set image deployment/${DEPLOYMENT_NAME} ${DEPLOYMENT_NAME}=${fullImage} -n ${NAMESPACE}`
      );

      console.log('   ✅ Imagen actualizada');
    }

    // 🎯 Esperar rollout si no es dry-run
    if (!dryRun) {
      console.log(`\n⏳ Esperando rollout...`);
      
      runner.run(
        `kubectl rollout status deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE} --timeout=5m`
      );

      console.log('   ✅ Rollout completado');

      // 🎯 Obtener status final
      const status = await getDeploymentStatus(DEPLOYMENT_NAME, NAMESPACE, runner);

      if (status) {
        console.log(`\n📊 Status del Deployment:`);
        console.log(`   Nombre: ${status.name}`);
        console.log(`   Namespace: ${status.namespace}`);
        console.log(`   Replicas: ${status.availableReplicas}/${status.replicas}`);
        console.log(`   Updated: ${status.updatedReplicas}`);
        console.log(`   Estado: ${status.ready ? '✅ Ready' : '⏳ Not Ready'}`);

        // 🎯 Escribir outputs
        if (GITHUB_OUTPUT) {
          const outputs = [
            `status=${status.ready ? 'success' : 'pending'}`,
            `replicas=${status.replicas}`,
            `available=${status.availableReplicas}`,
            `pod-count=${status.replicas}`
          ];

          writeFileSync(GITHUB_OUTPUT, outputs.join('\n') + '\n', { flag: 'a' });
          console.log(`\n✅ Outputs escritos a ${GITHUB_OUTPUT}`);
        }

        // Verificar que está ready
        if (!status.ready) {
          throw new Error('Deployment no está ready después del rollout');
        }
      }

      // 🎯 Listar pods del deployment
      console.log(`\n📦 Pods del deployment:`);
      const pods = runner.run(
        `kubectl get pods -n ${NAMESPACE} -l app=${DEPLOYMENT_NAME} -o wide`
      );
      console.log(pods);
    }

    // 🎯 Mostrar resumen de comandos ejecutados
    runner.summary();

    console.log(`\n✅ Deployment exitoso!`);

  } catch (error) {
    console.error(`\n❌ Error en deployment:`, error.message);
    console.error(error.stack);

    // 🎯 Escribir error a outputs
    if (GITHUB_OUTPUT && !dryRun) {
      writeFileSync(GITHUB_OUTPUT, 'status=failure\n', { flag: 'a' });
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
//    - createCommandRunner() con estado executedCommands
//    - createManifestManager() con array manifests privado
//    - Métodos que acceden y modifican estado privado
//
// ✅ ASYNC/AWAIT
//    - async function main()
//    - async function getDeploymentStatus()
//    - Manejo asíncrono de comandos
//
// ✅ DESTRUCTURING
//    - const { DEPLOYMENT_NAME = 'default' } = process.env
//    - const { status: { replicas = 0 } = {} } = deployment (anidado)
//    - for (const [key, value] of Object.entries(...))
//
// ✅ OPTIONAL CHAINING
//    - availableCondition?.status
//    - Acceso seguro a propiedades que pueden no existir
//
// ✅ ARRAY METHODS
//    - conditions.find(c => c.type === 'Available')
//    - executedCommands.forEach()
//    - Object.entries().reduce()
//
// ✅ TEMPLATE LITERALS
//    - `kubectl set image deployment/${name}...`
//    - Construcción dinámica de comandos
//
// ✅ REGEX
//    - /apiVersion:\s*\S+/.test(content)
//    - new RegExp(placeholder, 'g')
//    - Validación y reemplazo de patrones
//
// ✅ SPREAD OPERATOR
//    - execSync(command, { encoding: 'utf-8', ...options })
//    - Combinar objetos de configuración
//
// ✅ MODULES
//    - import { execSync } from 'child_process'
//    - import { readFileSync, writeFileSync } from 'fs'
