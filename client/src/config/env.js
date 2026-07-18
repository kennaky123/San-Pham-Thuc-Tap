const fallbackApiUrl = "http://127.0.0.1:5000/api";

function parsePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

export const clientEnv = Object.freeze({
  apiUrl: import.meta.env.VITE_API_URL?.trim() || fallbackApiUrl,
  maxFileSizeMb: parsePositiveInteger(
    import.meta.env.VITE_MAX_FILE_SIZE_MB,
    5,
  ),
  maxFilesPerTicket: parsePositiveInteger(
    import.meta.env.VITE_MAX_FILES_PER_TICKET,
    5,
  ),
});
