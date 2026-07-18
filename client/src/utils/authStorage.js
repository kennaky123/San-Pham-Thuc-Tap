import { USER_ROLES } from "../constants/roles.js";

const SESSION_STORAGE_KEY = "it-helpdesk-auth-session";
const LEGACY_STORAGE_KEY = "it-helpdesk-demo-user";
const STORAGE_VERSION = 1;

function getStorageEntries() {
  return [
    { storage: window.localStorage, rememberMe: true },
    { storage: window.sessionStorage, rememberMe: false },
  ];
}

function decodeJwtPayload(accessToken) {
  try {
    const payload = accessToken.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    return JSON.parse(window.atob(paddedBase64));
  } catch {
    return null;
  }
}

function isExpired(accessToken) {
  const payload = decodeJwtPayload(accessToken);
  return !payload?.exp || Date.now() >= payload.exp * 1000;
}

function isValidSession(value) {
  return Boolean(
    value &&
      value.version === STORAGE_VERSION &&
      typeof value.accessToken === "string" &&
      value.accessToken.length > 0 &&
      typeof value.user?.email === "string" &&
      USER_ROLES.includes(value.user?.role) &&
      !isExpired(value.accessToken),
  );
}

function readStorageEntry(storageEntry) {
  try {
    const storedValue = storageEntry.storage.getItem(SESSION_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);

    if (!isValidSession(parsedValue)) {
      storageEntry.storage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return {
      ...parsedValue,
      rememberMe: storageEntry.rememberMe,
    };
  } catch {
    try {
      storageEntry.storage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Bỏ qua nếu trình duyệt không cho phép truy cập storage.
    }

    return null;
  }
}

export function getStoredAuthSession() {
  for (const storageEntry of getStorageEntries()) {
    const session = readStorageEntry(storageEntry);

    if (session) {
      return session;
    }
  }

  return null;
}

export function getStoredAccessToken() {
  return getStoredAuthSession()?.accessToken ?? null;
}

export function clearAuthSession() {
  for (const storageEntry of getStorageEntries()) {
    try {
      storageEntry.storage.removeItem(SESSION_STORAGE_KEY);
      storageEntry.storage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Không chặn đăng xuất nếu trình duyệt không cho phép truy cập storage.
    }
  }
}

export function saveAuthSession(authenticationData, rememberMe) {
  const session = {
    version: STORAGE_VERSION,
    user: authenticationData.user,
    accessToken: authenticationData.accessToken,
    tokenType: authenticationData.tokenType ?? "Bearer",
    expiresIn: authenticationData.expiresIn ?? null,
    savedAt: new Date().toISOString(),
  };

  if (!isValidSession(session)) {
    throw new Error("Không thể lưu phiên đăng nhập không hợp lệ.");
  }

  clearAuthSession();

  const preferredStorage = rememberMe
    ? window.localStorage
    : window.sessionStorage;

  try {
    preferredStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    if (rememberMe) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      throw new Error("Trình duyệt không thể lưu phiên đăng nhập.");
    }
  }

  return session;
}

export function updateStoredUser(user) {
  const currentSession = getStoredAuthSession();

  if (!currentSession || !USER_ROLES.includes(user?.role)) {
    return;
  }

  saveAuthSession(
    {
      ...currentSession,
      user,
    },
    currentSession.rememberMe,
  );
}
