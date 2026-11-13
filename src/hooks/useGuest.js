import { useState, useEffect, useCallback } from 'react';
import { findGuest, SECRET_PORTAL_ID, SECRET_DASHBOARD_ID } from '../data/guests';

/**
 * Hook para gestionar el acceso por ID único de invitado, portal oculto de 15 dígitos o dashboard.
 *
 * Busca el ID en los parámetros de la URL:
 *   ?id=001 (Invitación personalizada)
 *   ?id=849201748291035 (Portal Oculto de Búsqueda)
 *   ?id=739104826501934 (Panel de Control y Lista de Invitaciones)
 *
 * Retorna:
 * - guest: Objeto del invitado { id, name, passes } o null si no es válido
 * - isValid: booleano que indica si el ID es de un invitado registrado
 * - isSecretPortal: booleano que indica si se accedió al portal de búsqueda
 * - isAdminDashboard: booleano que indica si se accedió al panel de control
 * - attemptedId: el ID que se intentó buscar
 * - selectGuestById: función para validar y seleccionar un invitado manualmente
 */
export function useGuest() {
  const [guest, setGuest] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [isSecretPortal, setIsSecretPortal] = useState(false);
  const [isAdminDashboard, setIsAdminDashboard] = useState(false);
  const [attemptedId, setAttemptedId] = useState('');

  const resolveGuest = useCallback((idCandidate) => {
    if (!idCandidate) {
      setGuest(null);
      setIsValid(false);
      setIsSecretPortal(false);
      setIsAdminDashboard(false);
      setAttemptedId('');
      return false;
    }

    const trimmed = String(idCandidate).trim();
    setAttemptedId(trimmed);

    // 1. Verificación del ID secreto para el Panel de Control
    if (trimmed === SECRET_DASHBOARD_ID) {
      setGuest(null);
      setIsValid(false);
      setIsSecretPortal(false);
      setIsAdminDashboard(true);
      return true;
    }

    // 2. Verificación del ID secreto para el Portal Oculto de Búsqueda
    if (trimmed === SECRET_PORTAL_ID) {
      setGuest(null);
      setIsValid(false);
      setIsSecretPortal(true);
      setIsAdminDashboard(false);
      return true;
    }

    setIsSecretPortal(false);
    setIsAdminDashboard(false);

    // 3. Búsqueda de invitado registrado
    const match = findGuest(trimmed);
    if (match) {
      setGuest(match);
      setIsValid(true);
      return true;
    } else {
      setGuest(null);
      setIsValid(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let idFromUrl =
      params.get('id') ||
      params.get('i') ||
      params.get('invitado') ||
      params.get('code') ||
      params.get('c') ||
      params.get('admin') ||
      params.get('dashboard');

    // Soporte adicional por hash (ej: /#VIP01 o /#id=VIP01)
    if (!idFromUrl && window.location.hash) {
      const hashStr = window.location.hash.replace(/^#\/?/, '');
      if (hashStr.includes('=')) {
        const hashParams = new URLSearchParams(hashStr);
        idFromUrl =
          hashParams.get('id') ||
          hashParams.get('code') ||
          hashParams.get('i') ||
          hashParams.get('admin');
      } else if (hashStr) {
        idFromUrl = hashStr;
      }
    }

    if (idFromUrl) {
      resolveGuest(idFromUrl);
    } else {
      setGuest(null);
      setIsValid(false);
      setIsSecretPortal(false);
      setIsAdminDashboard(false);
      setAttemptedId('');
    }
  }, [resolveGuest]);

  /**
   * Permite validar e ingresar manualmente con un código desde el portal de refuerzo.
   */
  const selectGuestById = useCallback(
    (newId) => {
      const success = resolveGuest(newId);
      if (success) {
        try {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('id', newId.trim().toUpperCase());
          window.history.pushState({}, '', newUrl.toString());
        } catch {
          // Ignorar si falla pushState
        }
      }
      return success;
    },
    [resolveGuest]
  );

  return {
    guest,
    guestName: guest ? guest.name : '',
    passes: guest ? guest.passes : 1,
    isValid,
    isSecretPortal,
    isAdminDashboard,
    attemptedId,
    selectGuestById,
  };
}
