import { sha256Hex, decryptJson } from '../utils/vaultCrypto';

const GUEST_PEPPER = 'nemer50_gala_inv_v1_2026';

// Hashes SHA-256 de los códigos secretos (nunca en texto plano en el código fuente)
const SECRET_PORTAL_HASH = '786778b2e5c2856340e72c5c25bbcb5dac4bfd5ae7d5dd9589600dabb241841e';
const SECRET_DASHBOARD_HASH = '7fc103a647f5b7599540cfc4f91e9e577dbf78479f71624e064a60da0db5356f';
const SECRET_WHATSAPP_HASH = '0032397c8aad940ecb96f989b6fa2bff011883db86b8c8bee7fd374e51bd185f';

export function isSecretPortalId(id) {
  if (!id || typeof id !== 'string') return false;
  return sha256Hex(id.trim()) === SECRET_PORTAL_HASH;
}

export function isSecretDashboardId(id) {
  if (!id || typeof id !== 'string') return false;
  return sha256Hex(id.trim()) === SECRET_DASHBOARD_HASH;
}

export function isSecretWhatsAppId(id) {
  if (!id || typeof id !== 'string') return false;
  return sha256Hex(id.trim()) === SECRET_WHATSAPP_HASH;
}

/**
 * Busca y descifra un invitado por su ID único desde su archivo cifrado individual.
 * Nunca expone datos de otros invitados ni información sensible (teléfono, empresa, cargo).
 *
 * @param {string} searchId - Código o ID del invitado
 * @returns {Promise<{ id: string, name: string, passes: number, type: string } | null>}
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

    const parsedPasses =
      decoded.p === 0 || decoded.p === '0' ? 0 : Number(decoded.p) || 1;

    return {
      id: clean,
      name: decoded.n,
      passes: parsedPasses,
      type: decoded.t || 'navidad',
    };
  } catch {
    return null;
  }
}

/**
 * Carga y descifra la bóveda administrativa o del panel de WhatsApp usando su código secreto.
 *
 * @param {string} adminKey - Código secreto de 15 dígitos
 * @returns {Promise<Array<{ id: string, name: string, passes: number, empresa: string, cargo: string, type?: string }> | null>}
 */
export async function loadAdminVaultAsync(adminKey) {
  const cleanKey = typeof adminKey === 'string' ? adminKey.trim() : '';
  const isAdmin = isSecretDashboardId(cleanKey);
  const isWa = isSecretWhatsAppId(cleanKey);

  if (!cleanKey || (!isAdmin && !isWa)) return null;

  try {
    const vaultUrl = isWa ? '/data/vault-wa.bin.json' : '/data/vault.bin.json';
    const res = await fetch(vaultUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    const envelope = await res.json();
    const decoded = decryptJson(envelope, cleanKey);
    return Array.isArray(decoded) ? decoded : null;
  } catch {
    return null;
  }
}
