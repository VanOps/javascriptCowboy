// =============================================
// deploy.js — Script de Deploy K8s
// Ejecutado desde: .github/actions/deploy-k8s/action.yml
// =============================================

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

// 🎯 CLOSURE: Cliente K8s reutilizable
function createK8sClient(cluster) {
  const config = {
    cluster,
    deployments: 0,
    errors: []
  };

  // Función interna con acceso al closure
  return async function deploy(deployment, image, namespace = 'default') {
    config.deployments++;
    
    console.log(`\n🚀 Deploy #${config.deployments} a ${cluster}`);
    console.log(`   Deployment: ${deployment}`);
    console.log(`   Image: ${image}`);
    console.log(`   Namespace: ${namespace}`);

    try {
      // Verificar que kubectl está disponible
      execSync('kubectl version --client', { stdio: 'pipe' });
      
      // Actualizar imagen del deployment
      const command = `kubectl set image deployment/${deployment} ${deployment}=${image} -n ${namespace}`;
      
      console.log(`\n📝 Ejecutando: ${command}`);
      execSync(command, { stdio: 'inherit' });

      return { 
        success: true, 
        deployment: config.deployments,
        cluster: config.cluster 
      };

    } catch (error) {
      config.errors.push(error.message);
      console.error(`❌ Error en deploy #${config.deployments}:`, error.message);
      return { success: false, error: error.message };
    }
  };
}

// 🎯 CLOSURE: Cliente Helm reutilizable
function createHelmClient(cluster) {
  let releases = 0;

  return async function upgrade(releaseName, chartPath, values = {}) {
    releases++;
    
    console.log(`\n📦 Helm upgrade #${releases} en ${cluster}`);
    console.log(`   Release: ${releaseName}`);
    console.log(`   Chart: ${chartPath}`);

    try {
      // Construir comando Helm
      const valuesArgs = Object.entries(values)
        .map(([key, value]) => `--set ${key}=${value}`)
        .join(' ');

      const command = `helm upgrade --install ${releaseName} ${chartPath} ${valuesArgs}`;
      
      console.log(`\n📝 Ejecutando: ${command}`);
      execSync(command, { stdio: 'inherit' });

      return { success: true, releases };

    } catch (error) {
      console.error(`❌ Error en Helm upgrade:`, error.message);
      return { success: false, error: error.message };
    }
  };
}

// 🎯 Main function
async function main() {
  // 🎯 DESTRUCTURING: Extraer env vars
  const {
    CLUSTER,
    IMAGE_TAG = 'latest',
    NAMESPACE = 'default',
    DEPLOYMENT_NAME = 'mi-app',
    USE_HELM = 'false',
    GITHUB_OUTPUT = ''
  } = process.env;

  console.log('═'.repeat(50));
  console.log('🚀 KUBERNETES DEPLOY SCRIPT');
  console.log('═'.repeat(50));

  // Validación
  if (!CLUSTER) {
    console.error('❌ Error: CLUSTER env var es requerida');
    process.exit(1);
  }

  try {
    let result;

    if (USE_HELM === 'true') {
      // 🎯 Deploy con Helm
      const helmClient = createHelmClient(CLUSTER);
      
      result = await helmClient(DEPLOYMENT_NAME, './charts', {
        'image.tag': IMAGE_TAG,
        'replicaCount': CLUSTER === 'production' ? 3 : 1
      });

    } else {
      // 🎯 Deploy con kubectl
      const k8sClient = createK8sClient(CLUSTER);
      
      // Construir nombre completo de imagen
      const fullImage = `ghcr.io/my-org/${DEPLOYMENT_NAME}:${IMAGE_TAG}`;
      
      result = await k8sClient(DEPLOYMENT_NAME, fullImage, NAMESPACE);
    }

    // 🎯 Escribir outputs para GitHub Actions
    if (GITHUB_OUTPUT) {
      const status = result.success ? 'success' : 'failure';
      writeFileSync(GITHUB_OUTPUT, `status=${status}\n`, { flag: 'a' });
    }

    if (!result.success) {
      console.error('\n❌ Deployment falló');
      process.exit(1);
    }

    console.log('\n✅ Deployment exitoso!');
    console.log(`\n📊 Stats:`);
    console.log(`   Cluster: ${CLUSTER}`);
    console.log(`   Image: ${IMAGE_TAG}`);
    console.log(`   Namespace: ${NAMESPACE}`);

  } catch (error) {
    console.error('\n❌ Error crítico:', error.message);
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
// ✅ MODULES
//    - import { execSync } from 'child_process'
//    - import { writeFileSync } from 'fs'
//
// ✅ CLOSURES
//    - createK8sClient() retorna función con estado privado
//    - config, deployments, errors encapsulados
//
// ✅ ASYNC/AWAIT
//    - async function main()
//    - await helmClient() / await k8sClient()
//
// ✅ DESTRUCTURING
//    - const { CLUSTER, IMAGE_TAG = 'default' } = process.env
//    - Valores por defecto con =
//
// ✅ TEMPLATE LITERALS
//    - `kubectl set image deployment/${deployment}...`
//    - Construcción dinámica de comandos
//
// ✅ ARROW FUNCTIONS
//    - .map(([key, value]) => ...)
//    - Callbacks concisas
//
// ✅ ARRAY METHODS
//    - Object.entries().map().join()
//    - Transformar objeto a args de línea de comando
//
// ✅ ERROR HANDLING
//    - try/catch en múltiples niveles
//    - process.exit(1) para señalar error
