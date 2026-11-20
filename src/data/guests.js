import { sha256Hex, decryptJson } from '../utils/vaultCrypto';

const GUEST_PEPPER = 'nemer50_gala_inv_v1_2026';

// Hashes SHA-256 de los códigos secretos (nunca en texto plano en el código fuente)
const SECRET_PORTAL_HASH = '786778b2e5c2856340e72c5c25bbcb5dac4bfd5ae7d5dd9589600dabb241841e';
const SECRET_DASHBOARD_HASH = '7fc103a647f5b7599540cfc4f91e9e577dbf78479f71624e064a60da0db5356f';

export function isSecretPortalId(id) {
  if (!id || typeof id !== 'string') return false;
  return sha256Hex(id.trim()) === SECRET_PORTAL_HASH;
}

export function isSecretDashboardId(id) {
  if (!id || typeof id !== 'string') return false;
  return sha256Hex(id.trim()) === SECRET_DASHBOARD_HASH;
}

/**
 * Busca y descifra un invitado por su ID único desde su archivo cifrado individual.
 * Nunca expone datos de otros invitados ni información sensible (teléfono, empresa, cargo).
 *
 * @param {string} searchId - Código o ID del invitado
 * @returns {Promise<{ id: string, name: string, passes: number } | null>}
 */
export async function findGuestAsync(searchId) {
  if (!searchId || typeof searchId !== 'string') return null;

  const clean = searchId.trim().replace(/[-_\s]/g, '').toUpperCase();
  if (!clean) return null;

  try {
    const lookupKey = `${clean}:${GUEST_PEPPER}`;
    const fileHash = sha256Hex(lookupKey).slice(0, 24);
    const res = await fetch(`/data/g/${fileHash}.json`, { cache: 'no-store' });

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
      return null;
    }

    const envelope = await res.json();
    const decoded = decryptJson(envelope, lookupKey);
    if (!decoded || !decoded.n) return null;

    return {
      id: clean,
      name: decoded.n,
      passes: Number(decoded.p) || 1,
      type: decoded.t || 'navidad',
    };
  } catch {
    return null;
  }
}

/**
 * Carga y descifra la bóveda administrativa completa usando el código secreto del panel.
 *
 * @param {string} adminKey - Código secreto de 15 dígitos del panel de control
 * @returns {Promise<Array<{ id: string, name: string, passes: number, empresa: string, cargo: string }> | null>}
 */
export async function loadAdminVaultAsync(adminKey) {
  if (!adminKey || !isSecretDashboardId(adminKey)) return null;

  try {
    const res = await fetch('/data/vault.bin.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const envelope = await res.json();
    const decoded = decryptJson(envelope, adminKey.trim());
    return Array.isArray(decoded) ? decoded : null;
  } catch {
    return null;
  }
}
