import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { siteConfig, type SiteConfig } from '../data/siteConfig';

const SiteConfigContext = createContext<SiteConfig>(siteConfig);

function mergeSettings(current: SiteConfig, updates: Record<string, unknown>): SiteConfig {
  const next: Record<string, unknown> = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (!(key in current)) continue;
    const existing = current[key as keyof SiteConfig];
    if (Array.isArray(existing)) {
      if (Array.isArray(value)) next[key] = value;
    } else if (existing && typeof existing === 'object') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        next[key] = { ...existing, ...value };
      }
    } else if (typeof value === typeof existing) {
      next[key] = value;
    }
  }
  return next as SiteConfig;
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(siteConfig);

  useEffect(() => {
    let active = true;
    void fetch('/api/site-config', { credentials: 'same-origin' })
      .then(async response => {
        if (!response.ok) throw new Error(`Site settings request failed (${response.status}).`);
        const result = await response.json() as { settings?: unknown };
        if (!result.settings || typeof result.settings !== 'object' || Array.isArray(result.settings)) {
          throw new Error('Site settings API returned an invalid settings object.');
        }
        if (active) setConfig(current => mergeSettings(current, result.settings as Record<string, unknown>));
      })
      .catch(error => console.error('[settings] Unable to load database-backed site configuration:', error));
    return () => { active = false; };
  }, []);

  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteConfigContext);
}
