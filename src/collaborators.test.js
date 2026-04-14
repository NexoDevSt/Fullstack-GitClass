import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Collaborators JSON Format', () => {
  const collaboratorsDir = path.join(__dirname, 'collaborators');
  // Obtener todos los archivos JSON del directorio
  const files = fs.readdirSync(collaboratorsDir).filter(file => file.endsWith('.json'));

  // Excluimos la plantilla si queremos, aunque es buena idea evaluarla también.
  // En este caso, iteraremos sobre todos los archivos JSON de alumnos.
  const studentFiles = files.filter(file => file !== '_plantilla.json');

  it('debería haber al menos un archivo JSON de estudiante además de la plantilla', () => {
    expect(studentFiles.length).toBeGreaterThan(0);
  });

  // Lista negra de palabras ofensivas, racistas o figuras polémicas
  const forbiddenWords = [
    // Figuras polémicas / Ideologías del odio
    'hitler', 'pinochet', 'videla', 'franco', 'mussolini', 'stalin', 'nazi', 'fascis', 'kkk', 'supremacist',

    // Groserías y vulgaridades (General LATAM)
    'mierda', 'puta', 'puto', 'pendej', 'idiota', 'estupid', 'zorra', 'chupa', 'perra', 'bastardo', 'verga', 'pija', 'cabron', 'cojon', 'imbecil',

    // Chilenismos ofensivos (raíces y variaciones)
    'weon', 'aweona', 'maricon', 'qlo', 'qlia', 'culiao', 'culia', 'ctm', 'conchet', 'reconche', 'pico', 'chucha', 'maraca', 'maraco', 'sacoewea',

    // Groserías en inglés (comunes en el entorno tech/internet)
    'fuck', 'bitch', 'shit', 'asshole', 'dick', 'cunt', 'slut', 'motherfucker',

    // Racismo, Xenofobia y Discriminación
    'esclavo', 'sudaca', 'nigger', 'nigga', 'veneco', 'masisi', 'faggot', 'retardado', 'mongolico', 'indio'
  ];

  function containsForbiddenWords(text) {
    if (!text) return false;
    // Normalizamos el texto (quitando tildes y pasando a minúscula) para evitar fintas como "Pínöchét"
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return forbiddenWords.some(word => normalized.includes(word));
  }

  // Generamos dinámicamente un bloque de pruebas por cada archivo encontrado
  studentFiles.forEach(file => {
    describe(`Evaluando archivo: ${file}`, () => {
      const filePath = path.join(collaboratorsDir, file);

      it('debe estar en formato JSON correctamente estructurado', () => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(() => JSON.parse(content)).not.toThrowError();
      });

      it('el archivo no debe pesar más de 2 KB (Prevención DOS)', () => {
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeLessThanOrEqual(2048); // max 2048 bytes
      });

      it('el nombre del archivo debe coincidir exactamente con el usuario_github para evitar Spoofing', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const expectedFilename = `${data.usuario_github}.json`.toLowerCase();
        expect(file.toLowerCase()).toBe(expectedFilename);
      });

      it('debe contener los campos obligatorios con el tipo de dato correcto', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Validar nombre completo
        expect(data).toHaveProperty('nombre_completo');
        expect(typeof data.nombre_completo).toBe('string');
        expect(data.nombre_completo.trim()).not.toBe('');

        // Validar usuario de github
        expect(data).toHaveProperty('usuario_github');
        expect(typeof data.usuario_github).toBe('string');
        expect(data.usuario_github.trim()).not.toBe('');
        // Debe cumplir el estándar de nombres de usuarios reales de Github (regex)
        expect(data.usuario_github).toMatch(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i);

        // Validar comentario libre
        expect(data).toHaveProperty('comentario_libre');
        expect(typeof data.comentario_libre).toBe('string');
        expect(data.comentario_libre.length).toBeLessThanOrEqual(150, 'El comentario debe tener 150 caracteres o menos');

        // Validar Sección
        expect(data).toHaveProperty('Seccion');
        expect(typeof data.Seccion).toBe('string');
        const validSections = ['001D', '003D', 'Profesor', '001D o 003D'];
        expect(validSections).toContain(data.Seccion);
      });

      it('no debe contener lenguaje ofensivo, racista, xenófobo ni menciones a figuras polémicas', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const isNameClean = !containsForbiddenWords(data.nombre_completo);
        const isBioClean = !containsForbiddenWords(data.comentario_libre);

        expect(isNameClean).toBe(true, `El nombre de ${file} contiene lenguaje inapropiado o figuras polémicas.`);
        expect(isBioClean).toBe(true, `La biografía de ${file} contiene lenguaje inapropiado o figuras polémicas.`);
      });

      it('no debe contener inyección HTML / XSS (uso malicioso de < o >)', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        expect(data.nombre_completo).not.toMatch(/[<>]/);
        expect(data.comentario_libre).not.toMatch(/[<>]/);
      });

      it('el campo color es opcional, pero si existe debe ser un string válido y seguro (Prevención Inyección CSS)', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (data.color !== undefined) {
          expect(typeof data.color).toBe('string');
          expect(data.color.trim()).not.toBe('');
          
          // Prevenimos inyección de propiedades css abusivas o ejecución
          expect(data.color).not.toMatch(/[;{}<>"'`]/);
          expect(data.color).not.toMatch(/url\(/i);
        }
      });

      it('el usuario de Github debe existir realmente', async () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const username = data.usuario_github;

        // Hacemos una llamada a la API de GitHub para verificar que el usuario exista
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        // Si el estado es 404, significa que el usuario no existe.
        const existe = response.status !== 404;
        expect(existe).toBe(true, `El usuario de GitHub '${username}' del archivo ${file} no existe. Por favor revisa que este bien escrito.`);
      });
    });
  });
});
