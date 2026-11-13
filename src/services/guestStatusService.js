import rawGuests from '../data/guests.json';

const STORAGE_KEY = 'nemer_invitaciones_status_v1';
const SYNC_ENDPOINT = 'https://kvdb.io/8xW4nL9pZ2tM7qYbK3vRc1/nemer50_guest_statuses';

export const GUEST_STATUS = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmado',
  DECLINED: 'declinado',
};

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
 * Normaliza y obtiene la lista de invitados unificados con su estado actual
 */
export function getAllGuestsWithStatus() {
  const statuses = getStoredStatuses();
  const list = [];
  const seenNames = new Set();

  // Procesar rawGuests (objeto de IDs o array)
  if (Array.isArray(rawGuests)) {
    rawGuests.forEach((item) => {
      if (!item || !item.id) return;
      const idKey = String(item.id).trim().toUpperCase();
      const statusData = statuses[idKey] || { status: GUEST_STATUS.PENDING };

      list.push({
        id: String(item.id).trim(),
        name: item.name || 'Invitado Especial',
        passes: item.passes || 1,
        status: statusData.status || GUEST_STATUS.PENDING,
        confirmedAt: statusData.confirmedAt || null,
        note: statusData.note || '',
      });
    });
  } else if (typeof rawGuests === 'object' && rawGuests !== null) {
    Object.entries(rawGuests).forEach(([rawId, val]) => {
      const idKey = String(rawId).trim().toUpperCase();
      const name = typeof val === 'string' ? val : (val?.name || 'Invitado Especial');
      const passes = typeof val === 'object' ? (val?.passes || 1) : 1;

      // Opcional: Evitar duplicados exactos si el usuario registró '001', 'VIP01' y 'CAROLINA' para la misma persona
      // Dejamos el ID principal visible
      const statusData = statuses[idKey] || { status: GUEST_STATUS.PENDING };

      list.push({
        id: String(rawId).trim(),
        name,
        passes,
        status: statusData.status || GUEST_STATUS.PENDING,
        confirmedAt: statusData.confirmedAt || null,
        note: statusData.note || '',
      });
    });
  }

  return list;
}

/**
 * Obtiene el estado actual de un invitado por su ID
 */
export function getGuestStatus(guestId) {
  if (!guestId) return GUEST_STATUS.PENDING;
  const statuses = getStoredStatuses();
  const key = String(guestId).trim().toUpperCase();
  return statuses[key]?.status || GUEST_STATUS.PENDING;
}

/**
 * Marca un invitado como CONFIRMADO
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
 * Marca un invitado como DECLINADO (No asistirá)
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
 * Sincronización en segundo plano con la nube (KVDB)
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
      headers: { 'Accept': 'application/json' },
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
 * Exporta todos los invitados y sus estados a un archivo CSV descargable
 */
export function exportToCSV() {
  const guests = getAllGuestsWithStatus();
  const headers = ['ID', 'Nombre', 'Pases', 'Estado', 'Fecha_Confirmacion'];

  const rows = guests.map((g) => [
    `"${g.id}"`,
    `"${g.name.replace(/"/g, '""')}"`,
    g.passes,
    `"${g.status.toUpperCase()}"`,
    `"${g.confirmedAt || ''}"`,
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

