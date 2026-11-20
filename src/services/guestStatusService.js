const STORAGE_KEY = 'nemer_invitaciones_status_v1';
const SYNC_ENDPOINT = 'https://kvdb.io/8xW4nL9pZ2tM7qYbK3vRc1/nemer50_guest_statuses';

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
  await pushToCloud(statuses);
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
  await pushToCloud(statuses);
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
  } else {
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
  }

  saveStoredStatuses(statuses);
  await pushToCloud(statuses);
  return true;
}

/**
 * Envía los estados a la nube (KVdb) para persistencia compartida entre dispositivos
 */
async function pushToCloud(data) {
  try {
    await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Si falla o no hay conexión, los datos siguen seguros en localStorage
  }
}

/**
 * Trae los últimos estados desde la nube y los combina con los locales
 */
export async function syncWithCloud() {
  try {
    const response = await fetch(SYNC_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const remoteData = await response.json();
      if (remoteData && typeof remoteData === 'object') {
        const localData = getStoredStatuses();
        const merged = { ...localData, ...remoteData };
        saveStoredStatuses(merged);
        return { success: true, count: Object.keys(merged).length };
      }
    }
  } catch {
    // Si no hay red, continuar con datos locales
  }
  return { success: false, count: 0 };
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
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin || `${window.location.protocol}//${window.location.host}`
      : '';
  const headers = ['ID', 'Nombre', 'Empresa', 'Cargo', 'Pases', 'Estado', 'Fecha_Confirmacion', 'Link_Invitacion'];

  const rows = guests.map((g) => [
    `"${g.id}"`,
    `"${g.name.replace(/"/g, '""')}"`,
    `"${(g.empresa || '').replace(/"/g, '""')}"`,
    `"${(g.cargo || '').replace(/"/g, '""')}"`,
    g.passes,
    `"${g.status.toUpperCase()}"`,
    `"${g.confirmedAt || ''}"`,
    `"${origin}/?id=${encodeURIComponent(g.id)}"`,
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
