import { fetchJobPortalConfig } from "../background/settingAPI";
import { JobPortalConfig } from "./type";

const CONFIG_STORAGE_KEY = "job_portal_config";
const CONFIG_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export function matchUrlPattern(config: JobPortalConfig): boolean {
    const currentUrl = window.location.href.toLowerCase();
    const portalName = config.jobPortal.toLowerCase();

    if (!currentUrl.includes(portalName)) return false;

    return config.validUrlPatterns.some((patternStr) => {
        try {
            const regex = new RegExp(patternStr.replace(/^\/|\/$/g, ""), "i");
            return regex.test(currentUrl);
        } catch (e) {
            console.warn(`Invalid RegExp in config: ${patternStr}`, e);
            return false;
        }
    });
}

export class ConfigStore {
    private static _instance: ConfigStore;
    private _config: JobPortalConfig[] | null = null;

    private constructor() {}

    static getInstance(): ConfigStore {
        if (!ConfigStore._instance) {
            ConfigStore._instance = new ConfigStore();
        }
        return ConfigStore._instance;
    }

    private isStale(timestamp: number): boolean {
        return Date.now() - timestamp > CONFIG_TTL_MS;
    }

    private saveToLocal(config: JobPortalConfig[]): void {
        const data = { config, timestamp: Date.now() };
        chrome.storage.local.set({ [CONFIG_STORAGE_KEY]: data });
        this._config = config;
    }

    async loadConfig(): Promise<JobPortalConfig[] | null> {
        if (this._config) return this._config;

        const stored = await new Promise<any>((resolve) =>
            chrome.storage.local.get(CONFIG_STORAGE_KEY, resolve)
        );

        const data = stored[CONFIG_STORAGE_KEY];

        if (data && data.config && !this.isStale(data.timestamp)) {
            this._config = data.config;
            return data.config;
        }

        // Fallback to backend

        try {
            const freshConfig = await fetchJobPortalConfig();
            this.saveToLocal(freshConfig);
            return freshConfig;
        } catch (err) {
            console.error("Failed to fetch config from backend", err);
            return data?.config ?? null;
        }
    }
}
