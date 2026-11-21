import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { eventData } from '../../data/eventData';
import { loadAdminVaultAsync } from '../../data/guests';
import {
  getAllGuestsWithStatus,
  getGuestInvitationUrl,
  setAdminVaultGuests,
  subscribeToGuestStatus,
} from '../../services/guestStatusService';
import {
  Search,
  Copy,
  ExternalLink,
  Check,
  Building2,
  MessageCircle,
  Send,
  Sparkles,
  TreePine,
  Ticket,
  Eye,
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  SlidersHorizontal,
  Phone,
  Pencil,
} from 'lucide-react';

const SENT_STORAGE_KEY = 'nemer_whatsapp_sent_v1';
const PHONE_OVERRIDE_KEY = 'nemer_whatsapp_phones_v1';

function normalizeWhatsAppPhone(rawPhone) {
  const trimmed = String(rawPhone || '').trim();
  if (!trimmed || /no\s*tiene/i.test(trimmed)) {
    return { display: '', waPhone: '', isIncomplete: false };
  }

  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/\D/g, '');
    return {
      display: trimmed,
      waPhone: digits.length >= 10 ? digits : '',
      isIncomplete: digits.length > 0 && digits.length < 10,
    };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return { display: '', waPhone: '', isIncomplete: false };
  }

  // Números locales venezolanos (0412/0414/0416/0422/0424/0426...) -> 58 + 10 dígitos
  if (digits.startsWith('0')) {
    const intl = `58${digits.slice(1)}`;
    return {
      display: trimmed,
      waPhone: intl,
      isIncomplete: intl.length < 12,
    };
  }

  if (digits.length === 10 && digits.startsWith('4')) {
    return {
      display: trimmed,
      waPhone: `58${digits}`,
      isIncomplete: false,
    };
  }

  return {
    display: trimmed,
    waPhone: digits,
    isIncomplete: digits.length < 10,
  };
}

const DEFAULT_NAVIDAD_TEMPLATE = `¡Hola, {NOMBRE}! Reciba un cordial saludo.

✨ Medio siglo de historia, visión y compromiso.

Nos emociona muchísimo invitarle a una noche inolvidable en la que celebraremos los 50 años de Grupo Nemer, junto a nuestra tradicional cena navideña. 🎄🥂

Gracias por ser pieza fundamental de este camino lleno de pasión y logros.

💌 Hemos preparado una invitación personalizada especialmente para usted.

Le invitamos a consultar los detalles del evento y confirmar su asistencia a través del siguiente enlace:

👇 Abra su invitación aquí:
🔗 {LINK}

✨ ¡Será un verdadero honor celebrar este gran acontecimiento con usted!

Grupo Nemer
Medio siglo de excelencia.`;

const DEFAULT_GALA_TEMPLATE = `¡Hola, {NOMBRE}! Reciba un cordial saludo.

✨ Medio siglo de historia, visión y compromiso.

Nos emociona muchísimo invitarle a una noche inolvidable en la que celebramos el _50 Aniversario de Grupo Nemer_🥂

Gracias por ser pieza fundamental de este camino lleno de pasión y logros.

💌 Hemos preparado una invitación personalizada especialmente para usted.

Le invitamos a consultar los detalles del evento y confirmar su asistencia a través del siguiente enlace:

👇 Abra su invitación aquí:
🔗 {LINK}

✨ ¡Será un verdadero honor celebrar este gran acontecimiento con usted!

Grupo Nemer
Medio siglo de excelencia.`;

function loadSentMap() {
  try {
    const raw = localStorage.getItem(SENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadPhoneOverrides() {
  try {
    const raw = localStorage.getItem(PHONE_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function WhatsAppPanel({ adminKey = '', onSwitchToAdmin = null }) {
  const { isLight } = useTheme();
  const [guests, setGuests] = useState([]);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [vaultError, setVaultError] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'navidad' | 'gala'
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [sentFilter, setSentFilter] = useState('ALL'); // 'ALL' | 'unsent' | 'sent'

  const [sentMap, setSentMap] = useState(() => loadSentMap());
  const [phoneOverrides, setPhoneOverrides] = useState(() => loadPhoneOverrides());
  const [editingPhoneId, setEditingPhoneId] = useState(null);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [copiedActionId, setCopiedActionId] = useState(null); // e.g. 'msg-405555' or 'link-405555'
  const [previewGuestId, setPreviewGuestId] = useState(null);

  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [navidadTemplate, setNavidadTemplate] = useState(DEFAULT_NAVIDAD_TEMPLATE);
  const [galaTemplate, setGalaTemplate] = useState(DEFAULT_GALA_TEMPLATE);

  useEffect(() => {
    let active = true;

    const initVault = async () => {
      setIsDecrypting(true);
      setVaultError(false);
      const decoded = await loadAdminVaultAsync(adminKey);
      if (!active) return;

      if (decoded) {
        setAdminVaultGuests(decoded);
        setGuests(getAllGuestsWithStatus());
        setIsDecrypting(false);
      } else {
        setAdminVaultGuests([]);
        setGuests([]);
        setVaultError(true);
        setIsDecrypting(false);
      }
    };

    initVault();

    const unsubscribe = subscribeToGuestStatus(() => {
      setGuests(getAllGuestsWithStatus());
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [adminKey]);

  const markSent = (guestId, value = true) => {
    setSentMap((prev) => {
      const next = { ...prev };
      if (value) {
        next[guestId] = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      } else {
        delete next[guestId];
      }
      try {
        localStorage.setItem(SENT_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const getGuestLink = (guestId) => getGuestInvitationUrl(guestId);

  const buildPersonalizedMessage = (guest) => {
    const isNavidad = (guest.type || 'navidad') === 'navidad';
    const template = isNavidad ? navidadTemplate : galaTemplate;
    const link = getGuestLink(guest.id);
    // Garantizar cero asteriscos y saltos limpios
    return template
      .replace(/\{NOMBRE\}/g, guest.name)
      .replace(/\{LINK\}/g, link)
      .replace(/\*/g, '')
      .trim();
  };

  const getEffectivePhoneInfo = (guest) => {
    const raw =
      phoneOverrides[guest.id] !== undefined ? phoneOverrides[guest.id] : guest.telefono;
    return normalizeWhatsAppPhone(raw);
  };

  const savePhoneOverride = (guestId, newPhone) => {
    const clean = String(newPhone || '').trim();
    setPhoneOverrides((prev) => {
      const next = { ...prev, [guestId]: clean };
      try {
        localStorage.setItem(PHONE_OVERRIDE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setEditingPhoneId(null);
    setPhoneDraft('');
  };

  const getWhatsAppApiUrl = (guest) => {
    const msg = buildPersonalizedMessage(guest);
    const { waPhone } = getEffectivePhoneInfo(guest);
    const base = `https://api.whatsapp.com/send?`;
    return waPhone
      ? `${base}phone=${encodeURIComponent(waPhone)}&text=${encodeURIComponent(msg)}`
      : `${base}text=${encodeURIComponent(msg)}`;
  };

  const copyTextUniversal = async (text, actionKey) => {
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {}
    }

    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.opacity = '0';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, text.length);
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {}
    }

    setCopiedActionId(actionKey);
    setTimeout(() => setCopiedActionId(null), 2200);
  };

  const companies = useMemo(() => {
    const set = new Set();
    guests.forEach((g) => {
      if (g.empresa) set.add(g.empresa);
    });
    return Array.from(set).sort();
  }, [guests]);

  const stats = useMemo(() => {
    const total = guests.length;
    const navidad = guests.filter((g) => (g.type || 'navidad') === 'navidad').length;
    const gala = guests.filter((g) => g.type === 'gala').length;
    const sent = guests.filter((g) => Boolean(sentMap[g.id])).length;
    return { total, navidad, gala, sent, unsent: total - sent };
  }, [guests, sentMap]);

  const filteredGuests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return guests.filter((g) => {
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        (g.empresa || '').toLowerCase().includes(q) ||
        (g.cargo || '').toLowerCase().includes(q) ||
        (g.telefono || '').toLowerCase().includes(q);

      const gType = g.type || 'navidad';
      const matchesType = typeFilter === 'ALL' || gType === typeFilter;
      const matchesCompany = companyFilter === 'ALL' || g.empresa === companyFilter;
      const isSent = Boolean(sentMap[g.id]);
      const matchesSent =
        sentFilter === 'ALL' || (sentFilter === 'sent' ? isSent : !isSent);

      return matchesSearch && matchesType && matchesCompany && matchesSent;
    });
  }, [guests, searchQuery, typeFilter, companyFilter, sentFilter, sentMap]);

  return (
    <div
      className={`min-h-screen w-full p-4 pb-20 sm:p-6 md:p-8 font-montserrat select-none transition-colors duration-500 ${
        isLight
          ? 'bg-[#242320] text-[#FAF6ED] selection:bg-[#DDB967] selection:text-[#211A0E]'
          : 'bg-[#080808] text-[#F5F2EA] selection:bg-[#C9A34E] selection:text-[#17120A]'
      }`}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 1. Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#51432A]/40 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={eventData.logos.mainCompanyLogo}
              alt="Atef Nemer"
              className="max-h-11 sm:max-h-13 w-auto object-contain"
            />
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-[#C9A34E] to-transparent" />
            <div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase text-gold-shine">
                  Panel de Envío por WhatsApp
                </h1>
              </div>
              <p className="text-[11px] opacity-70">
                Mensajes personalizados directos vía API de WhatsApp según tipo de invitación
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {onSwitchToAdmin && (
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-[#33312C] border-[#706044] text-[#FAF6ED] hover:bg-[#403C34]'
                    : 'bg-[#151515] border-[#51432A] text-[#F5F2EA] hover:bg-[#202020]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Asistencia</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowTemplateEditor((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                showTemplateEditor
                  ? 'bg-[#C9A34E] text-[#17120A] border-[#FFF0CD]/50'
                  : isLight
                  ? 'bg-[#33312C] border-[#706044] text-[#FAF6ED]'
                  : 'bg-[#151515] border-[#51432A] text-[#F5F2EA]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showTemplateEditor ? 'Ocultar Plantillas' : 'Editar Mensajes'}</span>
            </button>
          </div>
        </header>

        {isDecrypting ? (
          <div className="py-24 text-center flex flex-col items-center gap-3 opacity-80">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C9A34E]" />
            <span className="text-xs sm:text-sm tracking-wider">Cargando invitaciones cifradas...</span>
          </div>
        ) : vaultError ? (
          <div className="py-20 text-center text-rose-400 text-sm">
            No se pudo descifrar la bóveda de invitaciones. Verifique el enlace de acceso.
          </div>
        ) : (
          <>
            {/* Editor opcional de plantillas (Navidad y Gala) */}
            {showTemplateEditor && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 ${
                  isLight ? 'bg-[#33312C]/90 border-[#706044]' : 'bg-[#151515]/90 border-[#51432A]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300">
                      <TreePine className="w-3.5 h-3.5" />
                      Plantilla Navidad (Empleados)
                    </span>
                    <button
                      type="button"
                      onClick={() => setNavidadTemplate(DEFAULT_NAVIDAD_TEMPLATE)}
                      className="inline-flex items-center gap-1 text-[11px] opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Restaurar
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={navidadTemplate}
                    onChange={(e) => setNavidadTemplate(e.target.value.replace(/\*/g, ''))}
                    className="w-full p-3 rounded-xl text-xs bg-black/40 border border-white/10 outline-none focus:border-[#C9A34E] font-montserrat leading-relaxed"
                  />
                  <span className="text-[10px] opacity-60 block mt-1">
                    Variables automáticas: {'{NOMBRE}'} y {'{LINK}'} (sin asteriscos)
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#DDB967]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Plantilla Gala 50 Años (Invitados)
                    </span>
                    <button
                      type="button"
                      onClick={() => setGalaTemplate(DEFAULT_GALA_TEMPLATE)}
                      className="inline-flex items-center gap-1 text-[11px] opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Restaurar
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={galaTemplate}
                    onChange={(e) => setGalaTemplate(e.target.value.replace(/\*/g, ''))}
                    className="w-full p-3 rounded-xl text-xs bg-black/40 border border-white/10 outline-none focus:border-[#C9A34E] font-montserrat leading-relaxed"
                  />
                  <span className="text-[10px] opacity-60 block mt-1">
                    Variables automáticas: {'{NOMBRE}'} y {'{LINK}'} (sin asteriscos)
                  </span>
                </div>
              </div>
            )}

            {/* 2. Resumen compacto */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl border bg-[#151515]/80 border-[#51432A]">
                <span className="text-[10px] uppercase tracking-wider opacity-65 block">Total</span>
                <span className="font-serif text-2xl font-bold text-gold-shine">{stats.total}</span>
              </div>
              <div className="p-3.5 rounded-2xl border bg-rose-950/20 border-rose-500/35">
                <span className="text-[10px] uppercase tracking-wider text-rose-300 block">Navidad (Empleados)</span>
                <span className="font-serif text-2xl font-bold text-rose-300">{stats.navidad}</span>
              </div>
              <div className="p-3.5 rounded-2xl border bg-amber-950/20 border-amber-500/35">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 block">Gala 50 Años</span>
                <span className="font-serif text-2xl font-bold text-[#DDB967]">{stats.gala}</span>
              </div>
              <div className="p-3.5 rounded-2xl border bg-emerald-950/25 border-emerald-500/40">
                <span className="text-[10px] uppercase tracking-wider text-emerald-300 block">Enviados / Faltan</span>
                <span className="font-serif text-2xl font-bold text-emerald-400">
                  {stats.sent} <span className="text-sm font-montserrat opacity-65">/ {stats.unsent}</span>
                </span>
              </div>
            </div>

            {/* 3. Filtros */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, ID, teléfono, empresa o cargo..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none ${
                      isLight
                        ? 'bg-[#33312C] border-[#706044] text-[#FAF6ED]'
                        : 'bg-[#151515] border-[#51432A] text-[#F5F2EA]'
                    }`}
                  />
                </div>

                <div className="relative shrink-0">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none text-[#C9A34E]" />
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className={`w-full sm:w-auto pl-8 pr-8 py-2.5 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                      isLight
                        ? 'bg-[#33312C] border-[#706044] text-[#FAF6ED]'
                        : 'bg-[#151515] border-[#51432A] text-[#F5F2EA]'
                    }`}
                  >
                    <option value="ALL">Todas las empresas ({companies.length})</option>
                    {companies.map((comp) => (
                      <option key={comp} value={comp}>
                        {comp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filtro por Tipo */}
                <div className="flex items-center gap-1 p-1 rounded-xl border bg-black/25 border-[#51432A]/40 text-xs">
                  <button
                    onClick={() => setTypeFilter('ALL')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      typeFilter === 'ALL' ? 'bg-[#C9A34E] text-[#17120A]' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setTypeFilter('navidad')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      typeFilter === 'navidad' ? 'bg-[#D42426] text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Navidad ({stats.navidad})
                  </button>
                  <button
                    onClick={() => setTypeFilter('gala')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      typeFilter === 'gala' ? 'bg-amber-600 text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Gala ({stats.gala})
                  </button>
                </div>

                {/* Filtro por Estado de Envío */}
                <div className="flex items-center gap-1 p-1 rounded-xl border bg-black/25 border-[#51432A]/40 text-xs">
                  <button
                    onClick={() => setSentFilter('ALL')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      sentFilter === 'ALL' ? 'bg-white/20 text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSentFilter('unsent')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      sentFilter === 'unsent' ? 'bg-amber-600 text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Sin enviar ({stats.unsent})
                  </button>
                  <button
                    onClick={() => setSentFilter('sent')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      sentFilter === 'sent' ? 'bg-emerald-600 text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    Enviados ({stats.sent})
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] opacity-65 mb-3 px-1">
              Mostrando {filteredGuests.length} de {guests.length} invitaciones
            </div>

            {/* 4. Lista ordenada de tarjetas de envío */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredGuests.length === 0 ? (
                <div className="col-span-full py-12 text-center opacity-60 text-sm">
                  No se encontraron invitados con los filtros seleccionados.
                </div>
              ) : (
                filteredGuests.map((guest) => {
                  const isNavidad = (guest.type || 'navidad') === 'navidad';
                  const isSent = Boolean(sentMap[guest.id]);
                  const isPreviewOpen = previewGuestId === guest.id;
                  const guestLink = getGuestLink(guest.id);
                  const phoneInfo = getEffectivePhoneInfo(guest);
                  const isEditingPhone = editingPhoneId === guest.id;
                  const msgKey = `msg-${guest.id}`;
                  const linkKey = `link-${guest.id}`;

                  return (
                    <div
                      key={guest.id}
                      className={`rounded-2xl border p-4 flex flex-col gap-3 transition-colors ${
                        isSent
                          ? 'bg-emerald-950/15 border-emerald-500/40'
                          : isLight
                          ? 'bg-[#33312C]/90 border-[#706044]'
                          : 'bg-[#151515]/90 border-[#51432A]'
                      }`}
                    >
                      {/* Encabezado de tarjeta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-1.5 mb-1">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-black/40 text-[#F0DDA7]">
                              {guest.id}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                isNavidad
                                  ? 'bg-[#D42426]/20 border-[#FF4D4F]/40 text-rose-200'
                                  : 'bg-amber-500/15 border-amber-400/40 text-[#F0DDA7]'
                              }`}
                            >
                              {isNavidad ? (
                                <>
                                  <TreePine className="w-2.5 h-2.5" /> Navidad
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-2.5 h-2.5" /> Gala
                                </>
                              )}
                            </span>

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 opacity-80">
                              <Ticket className="w-2.5 h-2.5" />
                              {guest.passes} {guest.passes === 1 ? 'pase' : 'pases'}
                            </span>
                          </div>

                          <h3 className="font-semibold text-sm sm:text-base truncate">{guest.name}</h3>
                          <p className="text-[11px] opacity-70 truncate">
                            <span className="text-[#DDB967] font-medium">{guest.empresa}</span>
                            {guest.cargo ? ` • ${guest.cargo}` : ''}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => markSent(guest.id, !isSent)}
                          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                            isSent
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-black/30 border-white/15 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {isSent ? (
                            <>
                              <Check className="w-3 h-3" /> Enviado ({sentMap[guest.id]})
                            </>
                          ) : (
                            <span>Marcar Enviado</span>
                          )}
                        </button>
                      </div>

                      {/* Teléfono directo para API WhatsApp */}
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-black/25 border border-white/5 text-[11px]">
                        {isEditingPhone ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              savePhoneOverride(guest.id, phoneDraft);
                            }}
                            className="flex items-center gap-1.5 w-full"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <input
                              type="tel"
                              value={phoneDraft}
                              onChange={(e) => setPhoneDraft(e.target.value)}
                              placeholder="Ej: 0414-0000000 o +57..."
                              autoFocus
                              className="flex-1 bg-black/40 border border-[#C9A34E]/60 rounded px-2 py-1 text-xs outline-none font-mono"
                            />
                            <button
                              type="submit"
                              className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold text-[10px] cursor-pointer"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPhoneId(null)}
                              className="px-2 py-1 rounded bg-white/10 text-[10px] cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  phoneInfo.waPhone
                                    ? phoneInfo.isIncomplete
                                      ? 'text-amber-400'
                                      : 'text-emerald-400'
                                    : 'text-rose-400/70'
                                }`}
                              />
                              {phoneInfo.waPhone ? (
                                <span className="font-mono truncate">
                                  {phoneInfo.display}{' '}
                                  <span className="opacity-55 text-[10px]">
                                    (+{phoneInfo.waPhone})
                                  </span>
                                  {phoneInfo.isIncomplete && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                      Revisar dígitos
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-rose-300/80 italic">
                                  Sin teléfono registrado (elegir contacto en WhatsApp)
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPhoneId(guest.id);
                                setPhoneDraft(phoneInfo.display || '');
                              }}
                              title="Editar teléfono"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] opacity-75 hover:opacity-100 cursor-pointer shrink-0"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                              <span>{phoneInfo.waPhone ? 'Editar' : 'Agregar'}</span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Link directo visible */}
                      <div className="px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/5 text-[11px] font-mono opacity-80 truncate select-all">
                        {guestLink}
                      </div>

                      {/* Vista previa del mensaje personalizado */}
                      {isPreviewOpen && (
                        <pre className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] whitespace-pre-wrap font-montserrat leading-relaxed text-[#FAF6ED]/90 select-text">
                          {buildPersonalizedMessage(guest)}
                        </pre>
                      )}

                      {/* Botones de acción */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Botón Principal: Enviar directo por API de WhatsApp */}
                        <a
                          href={getWhatsAppApiUrl(guest)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => markSent(guest.id, true)}
                          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#22c35e] text-[#052e16] shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar por WhatsApp</span>
                        </a>

                        {/* Copiar Mensaje Completo */}
                        <button
                          type="button"
                          onClick={() => copyTextUniversal(buildPersonalizedMessage(guest), msgKey)}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                            copiedActionId === msgKey
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-black/35 border-[#51432A] hover:border-[#C9A34E]'
                          }`}
                        >
                          {copiedActionId === msgKey ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>¡Mensaje Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 opacity-75" />
                              <span>Copiar Mensaje</span>
                            </>
                          )}
                        </button>

                        {/* Copiar Solo Link */}
                        <button
                          type="button"
                          onClick={() => copyTextUniversal(guestLink, linkKey)}
                          className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                            copiedActionId === linkKey
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-black/35 border-white/10 hover:border-[#C9A34E]'
                          }`}
                        >
                          {copiedActionId === linkKey ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>¡Link!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 opacity-70" />
                              <span>Link</span>
                            </>
                          )}
                        </button>

                        {/* Ver Mensaje */}
                        <button
                          type="button"
                          onClick={() => setPreviewGuestId(isPreviewOpen ? null : guest.id)}
                          title="Previsualizar mensaje"
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isPreviewOpen
                              ? 'bg-[#C9A34E]/20 border-[#C9A34E] text-[#F0DDA7]'
                              : 'bg-black/35 border-white/10 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Abrir Invitación */}
                        <a
                          href={guestLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir invitación"
                          className="p-2 rounded-xl border bg-black/35 border-white/10 opacity-75 hover:opacity-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
