import { useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_UNAUTHORIZED_EVENT } from "../api/axiosClient.js";
import { login as requestLogin } from "../services/authService.js";
import { getCurrentUser } from "../services/userService.js";
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  updateStoredUser,
} from "../utils/authStorage.js";
import AuthContext from "./AuthContext.js";

function createInitialAuthState() {
  const storedSession = getStoredAuthSession();

  return {
    user: storedSession?.user ?? null,
    isLoading: Boolean(storedSession),
  };
}

function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(createInitialAuthState);

  useEffect(() => {
    const storedSession = getStoredAuthSession();

    if (!storedSession) {
      return undefined;
    }

    let isActive = true;

    getCurrentUser()
      .then((user) => {
        if (!isActive) {
          return;
        }

        updateStoredUser(user);
        setAuthState({ user, isLoading: false });
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        const statusCode = error.response?.status;

        if (
          statusCode === 401 ||
          statusCode === 403 ||
          error.code === "INVALID_AUTH_RESPONSE" ||
          error.code === "INVALID_USER_RESPONSE"
        ) {
          clearAuthSession();
          setAuthState({ user: null, isLoading: false });
          return;
        }

        setAuthState({ user: storedSession.user, isLoading: false });
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      clearAuthSession();
      setAuthState({ user: null, isLoading: false });
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const authenticationData = await requestLogin({ email, password });
    saveAuthSession(authenticationData, rememberMe);
    setAuthState({ user: authenticationData.user, isLoading: false });
    return authenticationData.user;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthState({ user: null, isLoading: false });
  }, []);

  const updateUserSession = useCallback((authenticationData) => {
    if (authenticationData?.user && authenticationData?.accessToken) {
      const storedSession = getStoredAuthSession();
      const rememberMe = storedSession?.rememberMe ?? false;
      saveAuthSession(authenticationData, rememberMe);
      setAuthState({ user: authenticationData.user, isLoading: false });
    } else if (authenticationData?.user) {
      updateStoredUser(authenticationData.user);
      setAuthState({ user: authenticationData.user, isLoading: false });
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user: authState.user,
      isAuthenticated: Boolean(authState.user),
      isLoading: authState.isLoading,
      login,
      logout,
      updateUserSession,
    }),
    [authState, login, logout, updateUserSession],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
