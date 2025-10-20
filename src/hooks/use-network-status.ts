"use client";

import { useState, useEffect } from "react";

interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  retryCount: number;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isReconnecting: false,
    retryCount: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        isReconnecting: false,
        retryCount: 0,
      }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        isReconnecting: false,
      }));
    };

    // Verificar status inicial
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/health", {
          method: "HEAD",
          cache: "no-cache",
        });

        if (response.ok) {
          handleOnline();
        } else {
          handleOffline();
        }
      } catch {
        handleOffline();
      }
    };

    // Verificar conexão periodicamente quando offline
    let intervalId: NodeJS.Timeout;

    if (!status.isOnline) {
      intervalId = setInterval(() => {
        setStatus((prev) => ({ ...prev, isReconnecting: true }));
        checkConnection();
      }, 5000); // Verificar a cada 5 segundos
    }

    // Event listeners para mudanças de conectividade
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (intervalId) clearInterval(intervalId);
    };
  }, [status.isOnline]);

  const retryConnection = async () => {
    setStatus((prev) => ({ ...prev, isReconnecting: true }));

    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
      });

      if (response.ok) {
        setStatus((prev) => ({
          ...prev,
          isOnline: true,
          isReconnecting: false,
          retryCount: 0,
        }));
      } else {
        throw new Error("Connection failed");
      }
    } catch {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        isReconnecting: false,
        retryCount: prev.retryCount + 1,
      }));
    }
  };

  return {
    ...status,
    retryConnection,
  };
}
