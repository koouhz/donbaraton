// src/utils/timezone.js
// Utilidad para manejar zona horaria de Bolivia (La Paz -04:00)

/**
 * Obtiene la fecha/hora actual en zona horaria de Bolivia
 * @returns {Date} Fecha ajustada a Bolivia
 */
export const getBoliviaDate = () => {
  // Bolivia está en UTC-4, sin horario de verano
  const now = new Date();
  // Crear fecha con offset de Bolivia (-4 horas = -240 minutos)
  const boliviaOffset = -4 * 60; // -240 minutos
  const localOffset = now.getTimezoneOffset(); // Offset local en minutos
  const diff = boliviaOffset - localOffset;
  return new Date(now.getTime() + diff * 60 * 1000);
};

/**
 * Formatea una fecha a string YYYY-MM-DD en zona horaria de Bolivia
 * @param {Date} date - Fecha a formatear (opcional, usa fecha actual si no se provee)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getBoliviaDateString = (date = null) => {
  const d = date ? new Date(date) : getBoliviaDate();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha/hora para mostrar en formato boliviano
 * @param {string|Date} datetime - Fecha/hora a formatear
 * @returns {string} Fecha formateada en español de Bolivia
 */
export const formatBoliviaDateTime = (datetime) => {
  if (!datetime) return '-';
  const d = new Date(datetime);
  return d.toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea solo la fecha en formato boliviano
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha en formato DD/MM/YYYY
 */
export const formatBoliviaDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea solo la hora en formato boliviano
 * @param {string|Date} datetime - Fecha/hora a formatear
 * @returns {string} Hora en formato HH:mm
 */
export const formatBoliviaTime = (datetime) => {
  if (!datetime) return '-';
  const d = new Date(datetime);
  return d.toLocaleTimeString('es-BO', {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtiene el inicio del día actual en Bolivia (00:00:00)
 * @returns {string} ISO string del inicio del día
 */
export const getBoliviaStartOfDay = () => {
  const d = getBoliviaDate();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/**
 * Obtiene el inicio del mes actual en Bolivia
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getBoliviaStartOfMonth = () => {
  const d = getBoliviaDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * Constante de offset de Bolivia
 */
export const BOLIVIA_TIMEZONE = 'America/La_Paz';
export const BOLIVIA_OFFSET = '-04:00';
