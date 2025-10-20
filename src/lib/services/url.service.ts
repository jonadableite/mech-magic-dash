/**
 * URL Service
 * Centralized URL management following SOLID principles
 */

import { AppConfig } from "@/lib/config/app.config";
import type { ServiceResult } from "@/lib/types/common";

export interface UrlService {
  get(path: string): string;
  getApi(path: string): string;
  getAuth(path: string): string;
  getDashboard(path: string): string;
  getPublic(path: string): string;
  getAsset(path: string): string;
  getExternal(url: string): string;
  isValid(url: string): boolean;
  parse(url: string): URL | null;
  build(params: Record<string, any>): string;
}

class UrlServiceImpl implements UrlService {
  private baseUrl: string;
  private apiUrl: string;
  private authUrl: string;
  private dashboardUrl: string;
  private publicUrl: string;
  private assetsUrl: string;

  constructor() {
    this.baseUrl = AppConfig.url;
    this.apiUrl = `${this.baseUrl}/api`;
    this.authUrl = `${this.baseUrl}/auth`;
    this.dashboardUrl = `${this.baseUrl}/dashboard`;
    this.publicUrl = `${this.baseUrl}/public`;
    this.assetsUrl = `${this.baseUrl}/assets`;
  }

  get(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  getApi(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.apiUrl}${cleanPath}`;
  }

  getAuth(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.authUrl}${cleanPath}`;
  }

  getDashboard(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.dashboardUrl}${cleanPath}`;
  }

  getPublic(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.publicUrl}${cleanPath}`;
  }

  getAsset(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.assetsUrl}${cleanPath}`;
  }

  getExternal(url: string): string {
    if (this.isValid(url)) {
      return url;
    }
    throw new Error(`Invalid URL: ${url}`);
  }

  isValid(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  parse(url: string): URL | null {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  }

  build(params: Record<string, any>): string {
    const url = new URL(this.baseUrl);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }
}

// Singleton instance
export const urlService = new UrlServiceImpl();

// Export types for external use
export type { UrlService };
