const STORAGE_KEY = 'nemer_invitaciones_status_v1';
const KVDB_BUCKET_URL = 'https://kvdb.io/AeusPCiAB7Hc2Li5yFowox';
const KEY_PREFIX = 'g_';
export const PRODUCTION_BASE_URL = 'https://invitacion-mauve-nu.vercel.app';

export function getGuestInvitationUrl(guestId) {
  return `${PRODUCTION_BASE_URL}/?id=${encodeURIComponent(String(guestId || '').trim())}`;
}

export const GUEST_STATUS = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmado',
  DECLINED: 'declinado',
};

// Lista descifrada en memoria únicamente para la sesión del administrador (nunca se guarda en localStorage ni en el bundle)
let inMemoryVaultGuests = [];

// Suscriptores para reactividad en componentes
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignorar errores de suscriptores
    }
  });
}

/**
 * Carga en memoria los invitados descifrados de la bóveda administrativa
 */
export function setAdminVaultGuests(list) {
  inMemoryVaultGuests = Array.isArray(list) ? list : [];
  notifyListeners();
}

/**
 * Obtiene el mapa de estados almacenados en localStorage
 * @returns {Record<string, { status: string, confirmedAt?: string, note?: string }>}
 */
export function getStoredStatuses() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Guarda el mapa de estados en localStorage y notifica a los componentes
 */
function saveStoredStatuses(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Manejar cuota de almacenamiento
  }
  notifyListeners();
}

/**
 * Normaliza y obtiene la lista de invitados de la bóveda con su estado actual
 */
export function getAllGuestsWithStatus() {
  const statuses = getStoredStatuses();

  return inMemoryVaultGuests.map((item) => {
    const idKey = String(item.id).trim().toUpperCase();
    const statusData = statuses[idKey] || { status: GUEST_STATUS.PENDING };

    return {
      id: String(item.id).trim(),
      name: item.name || 'Invitado Especial',
      passes: Number(item.passes) || 1,
      empresa: item.empresa || '',
      cargo: item.cargo || '',
      telefono: item.telefono || '',
      type: item.type || 'navidad',
      status: statusData.status || GUEST_STATUS.PENDING,
      confirmedAt: statusData.confirmedAt || null,
      note: statusData.note || '',
    };
  });
}

/**
 * Obtiene el estado de un invitado específico
 */
export function getGuestStatus(guestId) {
  if (!guestId) return GUEST_STATUS.PENDING;
  const key = String(guestId).trim().toUpperCase();
  const statuses = getStoredStatuses();
  return statuses[key]?.status || GUEST_STATUS.PENDING;
}

/**
 * Confirma la asistencia de un invitado
 */
export async function confirmGuest(guestId, note = '') {
  if (!guestId) return false;
  const key = String(guestId).trim().toUpperCase();
  const statuses = getStoredStatuses();

  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  statuses[key] = {
    status: GUEST_STATUS.CONFIRMED,
    confirmedAt: formattedDate,
    timestamp: now.toISOString(),
    note,
  };

  saveStoredStatuses(statuses);
  await pushGuestToCloud(key, statuses[key]);
  return true;
}

/**
 * Registra que un invitado declinó la asistencia
 */
export async function declineGuest(guestId, note = '') {
  if (!guestId) return false;
  const key = String(guestId).trim().toUpperCase();
  const statuses = getStoredStatuses();

  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  statuses[key] = {
    status: GUEST_STATUS.DECLINED,
    confirmedAt: formattedDate,
    timestamp: now.toISOString(),
    note,
  };

  saveStoredStatuses(statuses);
  await pushGuestToCloud(key, statuses[key]);
  return true;
}

/**
 * Actualiza el estado de un invitado manualmente desde la tabla
 */
export async function setGuestStatus(guestId, newStatus) {
  if (!guestId) return false;
  const key = String(guestId).trim().toUpperCase();
  const statuses = getStoredStatuses();

  if (newStatus === GUEST_STATUS.PENDING) {
    delete statuses[key];
    saveStoredStatuses(statuses);
    await deleteGuestFromCloud(key);
    return true;
  }

  const now = new Date();
  statuses[key] = {
    status: newStatus,
    confirmedAt: now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    timestamp: now.toISOString(),
  };

  saveStoredStatuses(statuses);
  await pushGuestToCloud(key, statuses[key]);
  return true;
}

/**
 * Guarda únicamente la clave individual del invitado en KVdb (sin sobrescribir a otros invitados)
 */
async function pushGuestToCloud(guestKey, payload) {
  try {
    const res = await fetch(`${KVDB_BUCKET_URL}/${KEY_PREFIX}${encodeURIComponent(guestKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Elimina la clave individual en KVdb cuando el administrador vuelve a dejarlo en Pendiente
 */
async function deleteGuestFromCloud(guestKey) {
  try {
    const res = await fetch(`${KVDB_BUCKET_URL}/${KEY_PREFIX}${encodeURIComponent(guestKey)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Sincroniza el estado de un único invitado desde la nube
 */
export async function syncSingleGuestFromCloud(guestId) {
  if (!guestId) return null;
  const key = String(guestId).trim().toUpperCase();
  try {
    const res = await fetch(`${KVDB_BUCKET_URL}/${KEY_PREFIX}${encodeURIComponent(key)}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (res.status === 404) {
      return null;
    }
    if (res.ok) {
      const text = await res.text();
      if (!text) return null;
      const parsed = JSON.parse(text);
      if (parsed && parsed.status) {
        const statuses = getStoredStatuses();
        statuses[key] = parsed;
        saveStoredStatuses(statuses);
        return parsed.status;
      }
    }
  } catch {
    // Continuar en modo local
  }
  return null;
}

/**
 * Trae los últimos estados individuales desde la nube y los combina por fecha más reciente
 */
export async function syncWithCloud() {
  try {
    const response = await fetch(
      `${KVDB_BUCKET_URL}/?values=true&format=json&prefix=${encodeURIComponent(KEY_PREFIX)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      }
    );
    if (response.ok) {
      const entries = await response.json();
      if (Array.isArray(entries)) {
        const remoteMap = {};
        entries.forEach((pair) => {
          if (!Array.isArray(pair) || pair.length < 2) return;
          const rawKey = String(pair[0] || '');
          const guestKey = rawKey.startsWith(KEY_PREFIX)
            ? rawKey.slice(KEY_PREFIX.length).toUpperCase()
            : rawKey.toUpperCase();
          if (!guestKey) return;

          let val = pair[1];
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {
              return;
            }
          }
          if (val && typeof val === 'object' && val.status && val.status !== GUEST_STATUS.PENDING) {
            remoteMap[guestKey] = val;
          }
        });

        const localData = getStoredStatuses();
        const merged = { ...localData };

        Object.entries(remoteMap).forEach(([k, remoteVal]) => {
          const localVal = merged[k];
          if (!localVal) {
            merged[k] = remoteVal;
          } else {
            const remoteTs = Date.parse(remoteVal.timestamp || '') || 0;
            const localTs = Date.parse(localVal.timestamp || '') || 0;
            if (remoteTs >= localTs) {
              merged[k] = remoteVal;
            }
          }
        });

        saveStoredStatuses(merged);
        return { success: true, count: Object.keys(merged).length };
      }
    }
  } catch {
    // Si no hay red, continuar con datos locales
  }
  return { success: false, count: 0 };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      notifyListeners();
    }
  });
}

/**
 * Suscribe un componente a cambios de estado
 */
export function subscribeToGuestStatus(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Exporta todos los invitados y sus estados/enlaces a un archivo CSV descargable
 */
export function exportToCSV() {
  const guests = getAllGuestsWithStatus();
  const headers = ['ID', 'Nombre', 'Empresa', 'Cargo', 'Pases', 'Estado', 'Fecha_Confirmacion', 'Link_Invitacion'];

  const rows = guests.map((g) => [
    `"${g.id}"`,
    `"${g.name.replace(/"/g, '""')}"`,
    `"${(g.empresa || '').replace(/"/g, '""')}"`,
    `"${(g.cargo || '').replace(/"/g, '""')}"`,
    g.passes,
    `"${g.status.toUpperCase()}"`,
    `"${g.confirmedAt || ''}"`,
    `"${getGuestInvitationUrl(g.id)}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `invitaciones_nemer50_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
