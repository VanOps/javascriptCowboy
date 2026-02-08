const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// Configuración
const PANDOC_VERSION = process.env.PANDOC_VERSION || '3.1.11';
const OUTPUT_FILE = process.env.OUTPUT_FILE || 'javascript-cowboy-book.pdf';
const BOOK_CONTENT_FILE = 'book-content.md';
const MERMAID_DIR = 'mermaid-images';
const IMAGES_DIR = 'downloaded-images';

// Estructura de módulos (orden de aparición en el libro)
const MODULE_STRUCTURE = [
  { type: 'file', path: 'README.md' },
  { type: 'module', path: 'docs/01-entorno-y-herramientas' },
  { type: 'module', path: 'docs/02-javascript-fundamentos' },
  { type: 'module', path: 'docs/03-javascript-avanzado' },
  { type: 'module', path: 'docs/04-react-nextjs' },
  { type: 'module', path: 'docs/05-github-actions' },
  { type: 'module', path: 'docs/06-ia-cicd' }
];

// Metadatos YAML para el PDF
const YAML_HEADER = `---
title: "JavaScript Cowboy - Guía Completa"
author: "GitHub Copilot Workshop"
date: "${new Date().toISOString().split('T')[0]}"
geometry: margin=2.5cm
toc: true
toc-depth: 3
numbersections: true
---

`;

/**
 * Lee y ordena archivos markdown de un directorio
 */
async function getMarkdownFilesFromDir(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const mdFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => path.join(dirPath, entry.name))
      .sort((a, b) => {
        const nameA = path.basename(a);
        const nameB = path.basename(b);
        
        // README siempre primero
        if (nameA === 'README.md') return -1;
        if (nameB === 'README.md') return 1;
        
        // Ordenar numéricamente por prefijo (01-, 02-, etc.)
        const numA = nameA.match(/^(\d+)-/)?.[1];
        const numB = nameB.match(/^(\d+)-/)?.[1];
        
        if (numA && numB) {
          return parseInt(numA) - parseInt(numB);
        }
        
        // Orden alfabético por defecto
        return nameA.localeCompare(nameB);
      });
    
    return mdFiles;
  } catch (error) {
    core.warning(`No se pudo leer el directorio ${dirPath}: ${error.message}`);
    return [];
  }
}

/**
 * Construye la lista completa de archivos siguiendo la estructura
 */
async function buildFileList() {
  const fileList = [];
  
  for (const item of MODULE_STRUCTURE) {
    if (item.type === 'file') {
      fileList.push(item.path);
    } else if (item.type === 'module') {
      const moduleFiles = await getMarkdownFilesFromDir(item.path);
      fileList.push(...moduleFiles);
    }
  }
  
  return fileList;
}

/**
 * Descarga una imagen desde una URL con seguimiento de redirecciones
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const handleResponse = (response) => {
      // Manejar redirecciones
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = response.headers.location;
        const redirectProtocol = redirectUrl.startsWith('https') ? https : http;
        redirectProtocol.get(redirectUrl, handleResponse).on('error', reject);
        return;
      }
      
      if (response.statusCode === 200) {
        const file = require('fs').createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
        file.on('error', (err) => {
          file.close();
          require('fs').unlink(filepath, () => {});
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
      }
    };
    
    protocol.get(url, handleResponse).on('error', reject);
  });
}

/**
 * Procesa y descarga imágenes externas, elimina emojis
 */
async function sanitizeMarkdownForPDF(content) {
  let sanitized = content;
  
  // Crear directorio para imágenes descargadas
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  
  // Encontrar todas las imágenes externas
  const imagePattern = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
  const matches = [...sanitized.matchAll(imagePattern)];
  
  core.info(`  Encontradas ${matches.length} imágenes externas`);
  
  // Descargar cada imagen
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const altText = match[1];
    const url = match[2];
    
    try {
      // Generar nombre de archivo seguro (solo números)
      const ext = '.png'; // Siempre usar PNG para evitar problemas
      const filename = `img-${String(i).padStart(3, '0')}${ext}`;
      const filepath = path.join(IMAGES_DIR, filename);
      
      // Descargar imagen
      await downloadImage(url, filepath);
      
      // Reemplazar URL con ruta local (sin caracteres especiales)
      sanitized = sanitized.replace(match[0], `![${altText}](${filepath})`);
      core.info(`    ✓ Descargada: ${url} -> ${filename}`);
    } catch (error) {
      // Si falla la descarga, reemplazar con texto alternativo
      core.warning(`    ⚠️  Error descargando ${url}: ${error.message}`);
      sanitized = sanitized.replace(match[0], altText ? `*${altText}*` : '');
    }
  }
  
  // Eliminar emojis (caracteres Unicode fuera del rango ASCII extendido)
  sanitized = sanitized.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  sanitized = sanitized.replace(/[\u{2600}-\u{26FF}]/gu, '');
  sanitized = sanitized.replace(/[\u{2700}-\u{27BF}]/gu, '');
  
  return sanitized;
}

async function consolidateMarkdown() {
  core.info('📝 Consolidando archivos markdown...');
  
  // Construir lista dinámica de archivos
  const markdownFiles = await buildFileList();
  core.info(`  Encontrados ${markdownFiles.length} archivos markdown`);
  
  let content = YAML_HEADER;
  
  for (const file of markdownFiles) {
    try {
      const fileContent = await fs.readFile(file, 'utf-8');
      content += fileContent + '\n\n\\newpage\n\n';
      core.info(`  ✓ ${file}`);
    } catch (error) {
      core.warning(`  ⚠️  No se pudo leer ${file}: ${error.message}`);
    }
  }
  
  // Sanitizar contenido para PDF (descargar imágenes externas y eliminar emojis)
  core.info('🖼️  Procesando imágenes externas...');
  content = await sanitizeMarkdownForPDF(content);
  
  await fs.writeFile(BOOK_CONTENT_FILE, content);
  core.info(`✓ Consolidado en ${BOOK_CONTENT_FILE}`);
  
  return content;
}

async function convertMermaidDiagrams(content) {
  core.info('🎨 Procesando diagramas Mermaid...');
  
  // Buscar bloques mermaid
  const mermaidPattern = /```mermaid\n([\s\S]*?)```/g;
  const matches = [...content.matchAll(mermaidPattern)];
  
  if (matches.length === 0) {
    core.info('  No se encontraron diagramas Mermaid');
    return content;
  }
  
  core.info(`  Encontrados ${matches.length} diagramas Mermaid`);
  
  // Crear directorio para imágenes
  await fs.mkdir(MERMAID_DIR, { recursive: true });
  
  let updatedContent = content;
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const mermaidCode = match[1];
    const mmdFile = path.join(MERMAID_DIR, `diagram-${i}.mmd`);
    const pngFile = path.join(MERMAID_DIR, `diagram-${i}.png`);
    
    // Guardar código mermaid
    await fs.writeFile(mmdFile, mermaidCode);
    
    // Convertir a PNG
    try {
      // Crear archivo de configuración de puppeteer
      const puppeteerConfig = {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };
      const configFile = path.join(MERMAID_DIR, `puppeteer-config-${i}.json`);
      await fs.writeFile(configFile, JSON.stringify(puppeteerConfig));
      
      await exec.exec('mmdc', [
        '-i', mmdFile,
        '-o', pngFile,
        '-b', 'transparent',
        '-p', configFile
      ]);
      
      // Reemplazar en contenido
      updatedContent = updatedContent.replace(
        match[0],
        `![Diagrama ${i + 1}](${pngFile})`
      );
      
      core.info(`  ✓ Convertido diagrama ${i + 1}`);
    } catch (error) {
      core.warning(`  ⚠️  Error convirtiendo diagrama ${i + 1}: ${error.message}`);
    }
  }
  
  // Guardar contenido actualizado
  await fs.writeFile(BOOK_CONTENT_FILE, updatedContent);
  
  return updatedContent;
}

async function generatePDF() {
  core.info(`📄 Generando PDF con Pandoc ${PANDOC_VERSION}...`);
  
  const pandocArgs = [
    'run', '--rm',
    '-v', `${process.cwd()}:/data`,
    '-w', '/data',
    `pandoc/latex:${PANDOC_VERSION}`,
    BOOK_CONTENT_FILE,
    '-o', OUTPUT_FILE,
    '--pdf-engine=xelatex',
    '--syntax-highlighting=idiomatic',
    '--toc',
    '--toc-depth=3',
    '--number-sections',
    '-V', 'colorlinks=true',
    '-V', 'linkcolor=blue',
    '-V', 'urlcolor=blue',
    '-V', 'toccolor=black',
    '-V', 'geometry:margin=2.5cm',
    '-V', 'mainfont=DejaVu Sans',
    '-V', 'monofont=DejaVu Sans Mono'
  ];
  
  await exec.exec('docker', pandocArgs);
  
  core.info(`✅ PDF generado: ${OUTPUT_FILE}`);
}

async function cleanup() {
  core.info('🧹 Limpiando archivos temporales...');
  
  try {
    await fs.unlink(BOOK_CONTENT_FILE);
    await fs.rm(MERMAID_DIR, { recursive: true, force: true });
    await fs.rm(IMAGES_DIR, { recursive: true, force: true });
    core.info('✓ Limpieza completada');
  } catch (error) {
    core.warning(`Advertencia durante limpieza: ${error.message}`);
  }
}

async function main() {
  try {
    core.info('📚 Iniciando generación de PDF...');
    
    // 1. Consolidar markdown
    let content = await consolidateMarkdown();
    
    // 2. Convertir diagramas Mermaid
    content = await convertMermaidDiagrams(content);
    
    // 3. Generar PDF
    await generatePDF();
    
    // 4. Limpiar
    await cleanup();
    
    // Output para GitHub Actions
    core.setOutput('pdf-path', OUTPUT_FILE);
    
    core.info('🎉 ¡Generación completada exitosamente!');
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar solo si es el script principal
if (require.main === module) {
  main();
}

module.exports = { main };
