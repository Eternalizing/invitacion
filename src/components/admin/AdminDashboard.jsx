import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { eventData } from '../../data/eventData';
import { FloatingCountdown } from '../invitation/Countdown';
import {
  getAllGuestsWithStatus,
  setGuestStatus,
  subscribeToGuestStatus,
  syncWithCloud,
  exportToCSV,
  GUEST_STATUS,
} from '../../services/guestStatusService';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Download,
  RefreshCw,
  Copy,
  ExternalLink,
  Users,
  Ticket,
  Check,
  Filter,
} from 'lucide-react';

export default function AdminDashboard() {
  const { isLight } = useTheme();
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'pendiente', 'confirmado', 'declinado'
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [lastSyncText, setLastSyncText] = useState('Local');

  // Cargar lista y suscribir a cambios reactivos
  useEffect(() => {
    setGuests(getAllGuestsWithStatus());

    const unsubscribe = subscribeToGuestStatus(() => {
      setGuests(getAllGuestsWithStatus());
    });

    // Sincronizar automáticamente con la nube al abrir
    handleSync();

    return () => unsubscribe();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    const res = await syncWithCloud();
    setIsSyncing(false);
    if (res.success) {
      setLastSyncText(`Sincronizado (${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`);
    } else {
      setLastSyncText('Modo Local');
    }
  };

  const handleCopyLink = async (guestId) => {
    const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
    const link = `${origin}/?id=${encodeURIComponent(guestId)}`;
    let copied = false;

    // 1. Intentar API moderna (requiere HTTPS o localhost)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(link);
        copied = true;
      } catch (err) {
        console.warn('Fallo navigator.clipboard, usando fallback móvil:', err);
      }
    }

    // 2. Fallback universal para teléfonos móviles, iOS Safari y conexiones locales HTTP
    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, link.length);

        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Error al copiar link con fallback:', err);
      }
    }

    // Feedback visual inmediato en el botón correspondiente
    setCopiedId(guestId);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleStatusChange = async (guestId, newStatus) => {
    await setGuestStatus(guestId, newStatus);
  };

  // Métricas
  const stats = useMemo(() => {
    const total = guests.length;
    const confirmed = guests.filter((g) => g.status === GUEST_STATUS.CONFIRMED);
    const pending = guests.filter((g) => g.status === GUEST_STATUS.PENDING);
    const declined = guests.filter((g) => g.status === GUEST_STATUS.DECLINED);
    const confirmedPasses = confirmed.reduce((acc, curr) => acc + (Number(curr.passes) || 1), 0);

    return {
      total,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      declinedCount: declined.length,
      confirmedPasses,
      percentage: total > 0 ? Math.round((confirmed.length / total) * 100) : 0,
    };
  }, [guests]);

  // Lista filtrada
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || g.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [guests, searchQuery, statusFilter]);

  return (
    <div
      className={`min-h-screen w-full p-4 pb-24 sm:p-6 sm:pb-28 md:p-8 md:pb-28 font-montserrat select-none transition-colors duration-700 ${
        isLight
          ? 'bg-[#242320] text-[#FAF6ED] selection:bg-[#DDB967] selection:text-[#211A0E]'
          : 'bg-[#080808] text-[#F5F2EA] selection:bg-[#C9A34E] selection:text-[#17120A]'
      }`}
    >
      {/* Contador Flotante Dinámico en la parte central inferior */}
      <FloatingCountdown isVisible={true} position="bottom" />

      {/* Iluminación Ambiental */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none ${
          isLight ? 'bg-[#DDB967]/15' : 'bg-[#C9A34E]/10'
        }`}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 1. Header con Logos y Título */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#51432A]/40 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={eventData.logos.mainCompanyLogo}
              alt="Atef Nemer"
              className="max-h-12 sm:max-h-14 w-auto object-contain logo-glow"
            />
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-[#C9A34E] to-transparent" />
            <img
              src={eventData.logos.logo50Anos}
              alt="50 Años"
              className="max-h-10 sm:max-h-12 w-auto object-contain logo-glow"
            />
            <div className="hidden sm:block ml-2">
              <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase text-gold-shine">
                Panel de Invitaciones
              </h1>
              <p className="text-[11px] opacity-70">Control oficial de confirmaciones de asistencia</p>
            </div>
          </div>

          {/* Botones de acción del Header */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-[#33312C] border-[#706044] text-[#FAF6ED] hover:bg-[#403C34]'
                  : 'bg-[#151515] border-[#51432A] text-[#F5F2EA] hover:bg-[#202020]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#C9A34E]' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : lastSyncText}</span>
            </button>

            <button
              onClick={exportToCSV}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-[#DDB967] text-[#211A0E] border-[#FFF0CD]/50 hover:bg-[#e8c77b]'
                  : 'bg-[#C9A34E] text-[#17120A] border-[#F0DDA7]/50 hover:bg-[#d8b560]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel / CSV</span>
            </button>
          </div>
        </header>

        {/* 2. Tarjetas de Resumen de KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {/* Total Invitados */}
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between ${
              isLight ? 'bg-[#33312C]/80 border-[#706044]' : 'bg-[#151515]/80 border-[#51432A]'
            }`}
          >
            <div className="flex items-center justify-between opacity-70 text-xs font-semibold tracking-wider uppercase mb-1">
              <span>Invitaciones</span>
              <Users className="w-4 h-4 text-[#C9A34E]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-gold-shine">
              {stats.total}
            </div>
            <span className="text-[10px] opacity-60 mt-1">Registradas en el sistema</span>
          </div>

          {/* Confirmados */}
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between ${
              isLight ? 'bg-emerald-950/20 border-emerald-600/40' : 'bg-emerald-950/30 border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-1">
              <span>Confirmados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-400">
              {stats.confirmedCount}
            </div>
            <span className="text-[10px] text-emerald-300/80 mt-1">{stats.percentage}% del total</span>
          </div>

          {/* Pendientes */}
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between ${
              isLight ? 'bg-amber-950/20 border-amber-600/40' : 'bg-amber-950/30 border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-amber-300 text-xs font-semibold tracking-wider uppercase mb-1">
              <span>Pendientes</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-400">
              {stats.pendingCount}
            </div>
            <span className="text-[10px] text-amber-300/80 mt-1">Por confirmar</span>
          </div>

          {/* No Asistirán */}
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between ${
              isLight ? 'bg-rose-950/20 border-rose-600/40' : 'bg-rose-950/30 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-rose-300 text-xs font-semibold tracking-wider uppercase mb-1">
              <span>Declinados</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-rose-400">
              {stats.declinedCount}
            </div>
            <span className="text-[10px] text-rose-300/80 mt-1">No podrán asistir</span>
          </div>

          {/* Total Pases Confirmados */}
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between col-span-2 sm:col-span-4 lg:col-span-1 ${
              isLight ? 'bg-[#33312C]/80 border-[#706044]' : 'bg-[#151515]/80 border-[#51432A]'
            }`}
          >
            <div className="flex items-center justify-between text-[#C9A34E] text-xs font-semibold tracking-wider uppercase mb-1">
              <span>Pases Confirmados</span>
              <Ticket className="w-4 h-4 text-[#C9A34E]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-gold-shine">
              {stats.confirmedPasses}
            </div>
            <span className="text-[10px] opacity-60 mt-1">Personas confirmadas</span>
          </div>
        </div>

        {/* 3. Buscador y Filtros por Pestañas */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          {/* Input de Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o ID de invitado..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                isLight
                  ? 'bg-[#33312C] border-[#706044] text-[#FAF6ED] placeholder-[#706044] focus:border-[#DDB967]'
                  : 'bg-[#151515] border-[#51432A] text-[#F5F2EA] placeholder-[#51432A] focus:border-[#C9A34E]'
              }`}
            />
          </div>

          {/* Filtros de Estado */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl border overflow-x-auto text-xs shrink-0 bg-black/20 border-[#51432A]/40">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? isLight
                    ? 'bg-[#DDB967] text-[#211A0E]'
                    : 'bg-[#C9A34E] text-[#17120A]'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter(GUEST_STATUS.CONFIRMED)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === GUEST_STATUS.CONFIRMED
                  ? 'bg-emerald-600 text-white'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Confirmados ({stats.confirmedCount})
            </button>
            <button
              onClick={() => setStatusFilter(GUEST_STATUS.PENDING)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === GUEST_STATUS.PENDING
                  ? 'bg-amber-600 text-white'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Pendientes ({stats.pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter(GUEST_STATUS.DECLINED)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === GUEST_STATUS.DECLINED
                  ? 'bg-rose-600 text-white'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Declinados ({stats.declinedCount})
            </button>
          </div>
        </div>

        {/* 4. TABLA ORDENADA Y RESPONSIVA */}
        <div
          className={`w-full rounded-2xl border overflow-hidden backdrop-blur-md shadow-2xl ${
            isLight ? 'bg-[#33312C]/90 border-[#706044]' : 'bg-[#151515]/90 border-[#51432A]'
          }`}
        >
          {/* Vista Tabla Desktop & Tablet */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr
                  className={`border-b text-[11px] uppercase tracking-wider font-bold ${
                    isLight
                      ? 'bg-[#242320]/60 border-[#706044]/50 text-[#DDB967]'
                      : 'bg-[#080808]/60 border-[#51432A]/50 text-[#C9A34E]'
                  }`}
                >
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Invitado</th>
                  <th className="py-3.5 px-4 text-center">Pases</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Confirmación</th>
                  <th className="py-3.5 px-4 text-center">Cambiar Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center opacity-60">
                      No se encontraron invitados con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => {
                    const isConfirmed = guest.status === GUEST_STATUS.CONFIRMED;
                    const isDeclined = guest.status === GUEST_STATUS.DECLINED;
                    const isPending = guest.status === GUEST_STATUS.PENDING;

                    return (
                      <tr
                        key={guest.id}
                        className={`transition-colors ${
                          isLight ? 'hover:bg-white/5' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        {/* ID */}
                        <td className="py-3 px-4 font-mono font-bold tracking-wider">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs ${
                              isLight ? 'bg-black/30 text-[#FFF0CD]' : 'bg-black/40 text-[#F0DDA7]'
                            }`}
                          >
                            {guest.id}
                          </span>
                        </td>

                        {/* Nombre del Invitado */}
                        <td className="py-3 px-4">
                          <span className="font-semibold block">{guest.name}</span>
                        </td>

                        {/* Pases */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              guest.passes > 1
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-white/5 opacity-80'
                            }`}
                          >
                            <Ticket className="w-3 h-3" />
                            <span>{guest.passes}</span>
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-4">
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Confirmado</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Pendiente</span>
                            </span>
                          )}
                          {isDeclined && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>No Asistirá</span>
                            </span>
                          )}
                        </td>

                        {/* Fecha */}
                        <td className="py-3 px-4 opacity-70 text-xs">
                          {guest.confirmedAt || '—'}
                        </td>

                        {/* Botones para cambiar estado directamente */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-black/30 border border-white/5">
                            <button
                              title="Marcar como Confirmado"
                              onClick={() => handleStatusChange(guest.id, GUEST_STATUS.CONFIRMED)}
                              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                isConfirmed
                                  ? 'bg-emerald-600 text-white'
                                  : 'opacity-50 hover:opacity-100 hover:text-emerald-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Marcar como Pendiente"
                              onClick={() => handleStatusChange(guest.id, GUEST_STATUS.PENDING)}
                              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                isPending
                                  ? 'bg-amber-600 text-white'
                                  : 'opacity-50 hover:opacity-100 hover:text-amber-400'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Marcar como No Asistirá"
                              onClick={() => handleStatusChange(guest.id, GUEST_STATUS.DECLINED)}
                              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                isDeclined
                                  ? 'bg-rose-600 text-white'
                                  : 'opacity-50 hover:opacity-100 hover:text-rose-400'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Acciones: Copiar Link y Abrir */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleCopyLink(guest.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                copiedId === guest.id
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : isLight
                                  ? 'bg-[#242320] border-[#706044] hover:border-[#DDB967]'
                                  : 'bg-[#080808] border-[#51432A] hover:border-[#C9A34E]'
                              }`}
                            >
                              {copiedId === guest.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 opacity-70" />
                                  <span>Copiar Link</span>
                                </>
                              )}
                            </button>

                            <a
                              href={`/?id=${encodeURIComponent(guest.id)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir invitación"
                              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Vista Móvil (Tarjetas Responsivas) */}
          <div className="md:hidden divide-y divide-white/10">
            {filteredGuests.length === 0 ? (
              <div className="py-8 text-center opacity-60 text-xs">
                No se encontraron invitados.
              </div>
            ) : (
              filteredGuests.map((guest) => {
                const isConfirmed = guest.status === GUEST_STATUS.CONFIRMED;
                const isDeclined = guest.status === GUEST_STATUS.DECLINED;
                const isPending = guest.status === GUEST_STATUS.PENDING;

                return (
                  <div key={guest.id} className="p-4 flex flex-col gap-3">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-black/40 text-[#F0DDA7] mr-2">
                          {guest.id}
                        </span>
                        <h3 className="font-semibold text-sm inline">{guest.name}</h3>
                      </div>
                      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-white/10 font-mono">
                        {guest.passes} {guest.passes > 1 ? 'pases' : 'pase'}
                      </span>
                    </div>

                    {/* Estado y Fecha */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                            <Clock className="w-3.5 h-3.5" /> Pendiente
                          </span>
                        )}
                        {isDeclined && (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> No Asistirá
                          </span>
                        )}
                      </div>
                      <span className="opacity-50 text-[11px]">{guest.confirmedAt || 'Sin confirmar'}</span>
                    </div>

                    {/* Acciones móviles */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                      {/* Botones de cambio rápido */}
                      <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
                        <button
                          onClick={() => handleStatusChange(guest.id, GUEST_STATUS.CONFIRMED)}
                          className={`p-1.5 rounded text-xs ${isConfirmed ? 'bg-emerald-600 text-white' : 'opacity-40'}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(guest.id, GUEST_STATUS.PENDING)}
                          className={`p-1.5 rounded text-xs ${isPending ? 'bg-amber-600 text-white' : 'opacity-40'}`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(guest.id, GUEST_STATUS.DECLINED)}
                          className={`p-1.5 rounded text-xs ${isDeclined ? 'bg-rose-600 text-white' : 'opacity-40'}`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Botón copiar link */}
                      <button
                        onClick={() => handleCopyLink(guest.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          copiedId === guest.id
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-black/30 border-white/10'
                        }`}
                      >
                        {copiedId === guest.id ? (
                          <>
                            <Check className="w-3 h-3" /> <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> <span>Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="mt-6 text-center text-xs opacity-60">
          Atef Nemer Grupo de Empresas • 50 Años de Trayectoria • Sistema Privado de Invitaciones
        </div>
      </div>
    </div>
  );
}

