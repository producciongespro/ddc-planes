import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Suite 4: guardrails (Auditoría Automatizada de Seguridad y Arnés)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const srcDir = path.join(rootDir, 'src');
  const catalogPath = path.join(rootDir, 'public/data/ddc-planeamientos.json');

  const publicDir = path.join(rootDir, 'public');
  const baseFilesDir = path.join(publicDir, 'ddc-planeamientos');

  // Función auxiliar recursiva para listar archivos de código excluyendo pruebas
  function getProductionFilesRecursively(dir, extensions = ['.js', '.jsx', '.json', '.html']) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '__tests__') {
          results = results.concat(getProductionFilesRecursively(filePath, extensions));
        }
      } else {
        if (extensions.some((ext) => file.endsWith(ext))) {
          results.push(filePath);
        }
      }
    });
    return results;
  }

  // Función recursiva para auditar directorios físicos en el árbol público
  function getDirectoriesRecursively(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      if (item.isDirectory()) {
        const full = path.join(dir, item.name);
        results.push(full);
        results = results.concat(getDirectoriesRecursively(full));
      }
    }
    return results;
  }

  // Función recursiva para auditar archivos físicos en el árbol público
  function getFilesRecursively(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(getFilesRecursively(full));
      } else {
        results.push(full);
      }
    }
    return results;
  }

  it('TEST-18: Certificación Anti-Mojibake en código fuente y catálogo JSON', () => {
    const filesToAudit = [
      ...getProductionFilesRecursively(srcDir),
      catalogPath
    ];

    const mojibakePatterns = [
      'Ã¡', 'Ã©', 'Ã­', 'Ã³', 'Ãº', 'Ã±', 'Ã‘', 'Â°', 'â€“', 'â€”', 'Ã', 'Ã‰', 'Ã', 'Ã“', 'Ãš'
    ];

    const corruptedFiles = [];

    filesToAudit.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        mojibakePatterns.forEach((pattern) => {
          if (content.includes(pattern)) {
            corruptedFiles.push({ file: path.relative(rootDir, filePath), pattern });
          }
        });
      }
    });

    expect(
      corruptedFiles,
      `Se detectó mojibake en los siguientes archivos: ${JSON.stringify(corruptedFiles)}`
    ).toEqual([]);
  });

  it('TEST-19: Certificación Zero-Windows-Paths en public/data/ddc-planeamientos.json', () => {
    expect(fs.existsSync(catalogPath)).toBe(true);
    const content = fs.readFileSync(catalogPath, 'utf8');
    const catalog = JSON.parse(content);

    expect(Array.isArray(catalog)).toBe(true);
    expect(catalog.length).toBe(197);

    catalog.forEach((item) => {
      expect(item).not.toHaveProperty('carpetaFisica');
      expect(item.rutaRelativa).not.toMatch(/^[a-zA-Z]:\\/);
      expect(item.rutaDescarga).not.toMatch(/^[a-zA-Z]:\\/);
      expect(item.rutaDescarga).toMatch(/^\/ddc-planeamientos\//);
    });
  });

  it('TEST-20: Certificación de Desacople del Bundle en React (Cero import de catálogos JSON)', () => {
    const srcFiles = getProductionFilesRecursively(srcDir, ['.js', '.jsx']);
    const offendingImports = [];

    srcFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      if (/import\s+.*from\s+['"].*(planes2027|ddc-planeamientos)\.json['"]/i.test(content)) {
        offendingImports.push(path.relative(rootDir, filePath));
      }
    });

    expect(
      offendingImports,
      `Los siguientes archivos acoplan el catálogo al bundle de React: ${offendingImports.join(', ')}`
    ).toEqual([]);
  });

  it('TEST-21: Certificación de tratamiento de respeto institucional («usted»)', () => {
    const welcomeHeroPath = path.join(srcDir, 'components/WelcomeHero.jsx');
    if (fs.existsSync(welcomeHeroPath)) {
      const content = fs.readFileSync(welcomeHeroPath, 'utf8');
      expect(content).not.toMatch(/\btu planeamiento\b/i);
      expect(content).not.toMatch(/\bdescarga tus\b/i);
    }
  });

  it('TEST-25: Certificación de Rutas Web Limpias y Kebab-case (Cero puntos en carpetas y cero espacios en URLs)', () => {
    const content = fs.readFileSync(catalogPath, 'utf8');
    const catalog = JSON.parse(content);

    catalog.forEach((item) => {
      // 1. Cero puntos en nombres de carpetas relativas
      expect(item.rutaRelativa).not.toMatch(/\./);
      // 2. Cero espacios en blanco en rutas web de descarga
      expect(item.rutaDescarga).not.toMatch(/\s/);
      // 3. Cero caracteres especiales o mayúsculas en las rutas de descarga
      expect(item.rutaDescarga).toEqual(item.rutaDescarga.toLowerCase());
      // 4. Formato kebab-case POSIX estricto
      expect(item.rutaRelativa).toMatch(/^[a-z0-9\-]+(\/[a-z0-9\-]+)*$/);
    });
  });

  it('TEST-26: Certificación de Visualización Limpia Docente (Cero prefijos numéricos o puntos en UI)', () => {
    const content = fs.readFileSync(catalogPath, 'utf8');
    const catalog = JSON.parse(content);

    catalog.forEach((item) => {
      // Cero prefijos como "1.", "2. ", etc. en asignaturas, grados u ofertas
      expect(item.asignatura).not.toMatch(/^\d+\./);
      expect(item.grado).not.toMatch(/^\d+\./);
      expect(item.ofertaNombre).not.toMatch(/^\d+\./);
    });
  });

  it('TEST-27: Verificación de existencia física de archivos principales y anexos', () => {
    const content = fs.readFileSync(catalogPath, 'utf8');
    const catalog = JSON.parse(content);

    expect(catalog.length).toBe(197);

    catalog.forEach((item) => {
      const physicalPath = path.join(publicDir, item.rutaDescarga);
      expect(fs.existsSync(physicalPath)).toBe(true);
      (item.archivos || []).forEach((archivo) => {
        expect(fs.existsSync(path.join(publicDir, archivo.ruta))).toBe(true);
      });
    });
  });

  it('TEST-28: Guardrail Físico de Directorios (Folder Kebab-Case Guardrail)', () => {
    expect(fs.existsSync(baseFilesDir)).toBe(true);
    const allDirs = getDirectoriesRecursively(baseFilesDir);
    expect(allDirs.length).toBeGreaterThan(0);

    const offendingDirs = [];

    allDirs.forEach((dirPath) => {
      const folderName = path.basename(dirPath);
      const relativeFolder = path.relative(publicDir, dirPath).replace(/\\/g, '/');

      // Validar: kebab-case estricto (solo minúsculas y guiones), sin puntos, sin espacios, sin mayúsculas
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(folderName)) {
        offendingDirs.push({
          ruta: relativeFolder,
          nombreCarpeta: folderName,
          motivo: 'Debe contener exclusivamente minúsculas y guiones medios (kebab-case), sin puntos, espacios ni números de orden.'
        });
      }
    });

    expect(
      offendingDirs,
      `[GUARDRAIL ERROR - CARPETA INVÁLIDA DETECTADA EN DISCO]\nLas siguientes carpetas violan las mejores prácticas web:\n${JSON.stringify(offendingDirs, null, 2)}`
    ).toEqual([]);
  });

  it('TEST-29: Guardrail Físico de Archivos ZIP (File Kebab-Case Guardrail)', () => {
    expect(fs.existsSync(baseFilesDir)).toBe(true);
    const allFiles = getFilesRecursively(baseFilesDir);
    expect(allFiles.length).toBeGreaterThan(0);

    const offendingFiles = [];

    allFiles.forEach((filePath) => {
      const fileName = path.basename(filePath);
      const relativeFile = path.relative(publicDir, filePath).replace(/\\/g, '/');

      // Validar: nombre kebab-case terminado en .zip, sin espacios, sin mayúsculas, sin puntos intermedios
      if (!/^[a-z0-9]+(-[a-z0-9]+)*\.zip$/.test(fileName)) {
        offendingFiles.push({
          archivo: relativeFile,
          nombreArchivo: fileName,
          motivo: 'Debe terminar en .zip y contener exclusivamente minúsculas y guiones (ej: "plan-matematica-primero.zip"), sin espacios ni puntos extra.'
        });
      }
    });

    expect(
      offendingFiles,
      `[GUARDRAIL ERROR - ARCHIVO INVÁLIDO DETECTADO EN DISCO]\nLos siguientes archivos violan las mejores prácticas web:\n${JSON.stringify(offendingFiles, null, 2)}`
    ).toEqual([]);
  });

  it('TEST-30: Guardrail de Paridad Física vs Catálogo (Zero Huérfanos y Zero Enlaces Rotos)', () => {
    const content = fs.readFileSync(catalogPath, 'utf8');
    const catalog = JSON.parse(content);

    const physicalFiles = getFilesRecursively(baseFilesDir).map((p) =>
      path.relative(publicDir, p).replace(/\\/g, '/')
    );
    const catalogFiles = catalog.flatMap((c) =>
      (c.archivos || []).map((archivo) => archivo.ruta.replace(/^\//, ''))
    );
    const primaryFiles = catalog.map((c) => c.rutaDescarga.replace(/^\//, ''));

    const physicalSet = new Set(physicalFiles);
    const catalogSet = new Set(catalogFiles);

    // Archivos huérfanos: están en disco pero nadie los referencia en el JSON
    const huerfanos = physicalFiles.filter((f) => !catalogSet.has(f));

    // Enlaces rotos: están en el JSON pero el archivo no existe físicamente
    const rotos = catalogFiles.filter((f) => !physicalSet.has(f));
    const principalesSinAnexo = primaryFiles.filter((f) => !catalogSet.has(f));
    const referenciasDuplicadas = catalogFiles.filter((f, index) => catalogFiles.indexOf(f) !== index);

    expect(
      huerfanos,
      `[GUARDRAIL ERROR - ARCHIVOS HUÉRFANOS DETECTADOS]\nLos siguientes archivos existen en disco pero no están registrados en ddc-planeamientos.json:\n${huerfanos.join('\n')}`
    ).toEqual([]);

    expect(
      rotos,
      `[GUARDRAIL ERROR - ENLACES ROTOS DETECTADOS]\nLos siguientes registros en ddc-planeamientos.json no existen físicamente en disco:\n${rotos.join('\n')}`
    ).toEqual([]);

    expect(principalesSinAnexo, 'Las rutas principales deben aparecer en archivos[].ruta').toEqual([]);
    expect(referenciasDuplicadas, 'Cada ZIP debe figurar una sola vez en archivos[]').toEqual([]);

    expect(physicalFiles.length).toBe(catalogFiles.length);
  });
});

