import { JobPortalConfig } from "./type";

export function matchUrlPattern(config: JobPortalConfig): boolean {
  const currentUrl = window.location.href.toLowerCase();
  const portalName = config.jobPortal.toLowerCase();

  if (!currentUrl.includes(portalName)) {
    return false;
  }

  for (const patternStr of config.validUrlPatterns) {
    try {
      const cleaned = patternStr.replace(/^\/|\/$/g, "");
      const regex = new RegExp(cleaned, "i");

      if (regex.test(currentUrl)) {
        return true;
      }
    } catch (e) {
      console.warn(`Invalid RegExp in config: ${patternStr}`, e);
    }
  }

  return false;
}

export class ConfigStore {
  private static _instance: ConfigStore;
  private _config: any | null = null;

  private constructor() {}

  static getInstance(): ConfigStore {
    if (!ConfigStore._instance) {
      ConfigStore._instance = new ConfigStore();
    }
    return ConfigStore._instance;
  }

  setConfig(config: any): boolean {
    this._config = config;
    console.log("Config stored successfully:", config);
    return true;
  }

  getConfig(): any | null {
    return this._config;
  }

  hasConfig(): boolean {
    return this._config !== null;
  }
}
