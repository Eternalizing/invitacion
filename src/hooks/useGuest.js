import { useState, useEffect, useCallback, useRef } from 'react';
import {
  findGuestAsync,
  isSecretPortalId,
  isSecretDashboardId,
} from '../data/guests';

/**
 * Hook para gestionar el acceso por ID único de invitado (descifrado individual),
 * diferenciando automáticamente entre Invitación de Gala e Invitación Navideña de Empleados.
 */
export function useGuest() {
  const [guest, setGuest] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [isSecretPortal, setIsSecretPortal] = useState(false);
  const [isAdminDashboard, setIsAdminDashboard] = useState(false);
  const [isChristmas, setIsChristmas] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [attemptedId, setAttemptedId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const requestSeqRef = useRef(0);

  const resolveGuest = useCallback(async (idCandidate, forcedType = null) => {
    const seq = ++requestSeqRef.current;

    if (!idCandidate) {
      if (forcedType === 'navidad') {
        setGuest({
          id: 'NAVIDAD',
          name: 'Colaborador Grupo Nemer',
          passes: 1,
          type: 'navidad',
        });
        setIsValid(true);
        setIsChristmas(true);
        setIsSecretPortal(false);
        setIsAdminDashboard(false);
        setAdminKey('');
        setAttemptedId('NAVIDAD');
        setIsLoading(false);
        return true;
      }

      setGuest(null);
      setIsValid(false);
      setIsChristmas(false);
      setIsSecretPortal(false);
      setIsAdminDashboard(false);
      setAdminKey('');
      setAttemptedId('');
      setIsLoading(false);
      return false;
    }

    const trimmed = String(idCandidate).trim();
    setAttemptedId(trimmed);
    setIsLoading(true);

    // 1. Verificación por hash del Panel de Control
    if (isSecretDashboardId(trimmed)) {
      if (seq !== requestSeqRef.current) return false;
      setGuest(null);
      setIsValid(false);
      setIsChristmas(false);
      setIsSecretPortal(false);
      setIsAdminDashboard(true);
      setAdminKey(trimmed);
      setIsLoading(false);
      return true;
    }

    // 2. Verificación por hash del Portal Oculto de Búsqueda
    if (isSecretPortalId(trimmed)) {
      if (seq !== requestSeqRef.current) return false;
      setGuest(null);
      setIsValid(false);
      setIsChristmas(false);
      setIsSecretPortal(true);
      setIsAdminDashboard(false);
      setAdminKey('');
      setIsLoading(false);
      return true;
    }

    setIsSecretPortal(false);
    setIsAdminDashboard(false);
    setAdminKey('');

    // 3. Búsqueda y descifrado individual del invitado
    const match = await findGuestAsync(trimmed);
    if (seq !== requestSeqRef.current) return false;

    if (match) {
      const resolvedType = forcedType || match.type || 'navidad';
      setGuest({ ...match, type: resolvedType });
      setIsChristmas(resolvedType === 'navidad');
      setIsValid(true);
      setIsLoading(false);
      return true;
    } else {
      setGuest(null);
      setIsValid(false);
      setIsChristmas(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipoParam = (params.get('tipo') || params.get('type') || params.get('evento') || '').toLowerCase();
    const forcedType =
      tipoParam === 'gala'
        ? 'gala'
        : tipoParam === 'navidad' || params.has('navidad')
        ? 'navidad'
        : null;

    let idFromUrl =
      params.get('id') ||
      params.get('i') ||
      params.get('invitado') ||
      params.get('code') ||
      params.get('c') ||
      params.get('admin') ||
      params.get('dashboard');

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

    if (idFromUrl || forcedType === 'navidad') {
      resolveGuest(idFromUrl, forcedType);
    } else {
      setGuest(null);
      setIsValid(false);
      setIsChristmas(false);
      setIsSecretPortal(false);
      setIsAdminDashboard(false);
      setAdminKey('');
      setAttemptedId('');
      setIsLoading(false);
    }
  }, [resolveGuest]);

  const selectGuestById = useCallback(
    async (newId) => {
      const success = await resolveGuest(newId);
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
    isChristmas,
    isSecretPortal,
    isAdminDashboard,
    adminKey,
    attemptedId,
    isLoading,
    selectGuestById,
  };
}
