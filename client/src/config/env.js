const fallbackApiUrl = "http://127.0.0.1:5000/api";

function parsePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function resolveApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  const browserHost =
    typeof window !== "undefined" && window.location?.hostname
      ? window.location.hostname
      : "";

  if (
    browserHost &&
    browserHost !== "127.0.0.1" &&
    browserHost !== "localhost"
  ) {
    if (!configuredUrl) {
      return `http://${browserHost}:5000/api`;
    }
    if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(configuredUrl)) {
      return configuredUrl.replace(
        /^(https?:\/\/)(127\.0\.0\.1|localhost)/i,
        `$1${browserHost}`,
      );
    }
  }

  return configuredUrl || fallbackApiUrl;
}

export const clientEnv = Object.freeze({
  apiUrl: resolveApiUrl(),
  maxFileSizeMb: parsePositiveInteger(
    import.meta.env.VITE_MAX_FILE_SIZE_MB,
    5,
  ),
  maxFilesPerTicket: parsePositiveInteger(
    import.meta.env.VITE_MAX_FILES_PER_TICKET,
    5,
  ),
});
