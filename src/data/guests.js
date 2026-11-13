import rawGuests from './guests.json';

/**
 * Normaliza y construye un índice optimizado para búsqueda rápida e insensible a mayúsculas/minúsculas.
 * Soporta tanto formato de Objeto { "ID": { name, passes } } como Array [ { id, name, passes } ].
 */
function buildGuestIndex(data) {
  const index = new Map();

  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item && item.id) {
        const key = String(item.id).trim().toUpperCase();
        index.set(key, {
          id: String(item.id).trim(),
          name: item.name || 'Invitado Especial',
          passes: item.passes || 1,
        });
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([rawId, val]) => {
      const key = String(rawId).trim().toUpperCase();
      if (typeof val === 'string') {
        index.set(key, {
          id: String(rawId).trim(),
          name: val,
          passes: 1,
        });
      } else if (val && typeof val === 'object') {
        index.set(key, {
          id: String(rawId).trim(),
          name: val.name || 'Invitado Especial',
          passes: val.passes || 1,
        });
      }
    });
  }

  return index;
}

const guestMap = buildGuestIndex(rawGuests);

/**
 * Busca un invitado por su ID único.
 * Búsqueda inteligente:
 * - Insensible a mayúsculas/minúsculas (VIP01 == vip01)
 * - Elimina espacios sobrantes
 * - Si no encuentra directo, intenta normalizar guiones y símbolos
 *
 * @param {string} searchId - Código o ID del invitado
 * @returns {{ id: string, name: string, passes: number } | null}
 */
export function findGuest(searchId) {
  if (!searchId || typeof searchId !== 'string') return null;

  const clean = searchId.trim().toUpperCase();
  if (!clean) return null;

  // 1. Coincidencia directa exacta o en mayúsculas
  if (guestMap.has(clean)) {
    return guestMap.get(clean);
  }

  // 2. Coincidencia eliminando guiones o espacios (por ejemplo '839-214' vs '839214')
  const stripped = clean.replace(/[-_\s]/g, '');
  for (const [key, guest] of guestMap.entries()) {
    if (key.replace(/[-_\s]/g, '') === stripped) {
      return guest;
    }
  }

  return null;
}

/**
 * Utilidad para generar IDs aleatorios únicos de 6 dígitos (100000 a 999999)
 * Evita secuencias predecibles para máxima privacidad de cada invitado.
 *
 * @param {number} count - Cantidad de IDs a generar
 * @param {Set<string>} existingIds - Conjunto de IDs ya asignados para evitar colisiones
 * @returns {string[]}
 */
export function generateRandom6DigitIds(count, existingIds = new Set()) {
  const ids = new Set(existingIds);
  const result = [];

  while (result.length < count) {
    const num = Math.floor(100000 + Math.random() * 900000);
    const idStr = String(num);
    if (!ids.has(idStr)) {
      ids.add(idStr);
      result.push(idStr);
    }
  }

  return result;
}

/**
 * Código secreto de 15 dígitos para acceder al portal oculto de búsqueda/refuerzo.
 */
export const SECRET_PORTAL_ID = '849201748291035';

/**
 * Código secreto de 15 dígitos para acceder al panel de control y lista de invitaciones.
 */
export const SECRET_DASHBOARD_ID = '739104826501934';

/**
 * Devuelve la cantidad total de invitados registrados en el sistema.
 */
export const totalGuests = guestMap.size;

