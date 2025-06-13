// Define the shape of the Auth data
export interface AuthData {
    id: string;
    email: string;
    role: string;
}

// Define storage keys as enums for scalability
export enum StorageKeys {
    AUTH = "authData",
    SELECTED_CANDIDATE_ID = "selectedCandidateId",
    CSRF_TOKEN = "csrfToken",
}

export interface SelectedCandidateData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

// A scalable LocalDB manager using chrome.storage.local
export class LocalDb {
    // Save auth data to chrome.storage.local
    static async setAuthData(data: AuthData): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [StorageKeys.AUTH]: data }, () => {
                resolve();
            });
        });
    }

    // Get auth data from chrome.storage.local
    static async getAuthData(): Promise<AuthData | null> {
        return new Promise((resolve) => {
            chrome.storage.local.get([StorageKeys.AUTH], (result) => {
                resolve(result[StorageKeys.AUTH] ?? null);
            });
        });
    }

    // Clear auth data from chrome.storage.local
    static async clearAuthData(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.remove(StorageKeys.AUTH as string, () => {
                resolve();
            });
        });
    }

    // Clear all data from chrome.storage.local
    static async clearAll(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.clear(() => {
                resolve();
            });
        });
    }

    //  temporary functions

    static async setLoggedIn(status: boolean): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ loggedIn: status }, () => {
                resolve();
            });
        });
    }

    static async isLoggedIn(): Promise<boolean> {
        return new Promise((resolve) => {
            chrome.storage.local.get(["loggedIn"], (result) => {
                resolve(result["loggedIn"] === true);
            });
        });
    }

    static async getLoggedIn(): Promise<boolean> {
        return new Promise((resolve) => {
            chrome.storage.local.get(["loggedIn"], (result) => {
                resolve(result["loggedIn"] === true);
            });
        });
    }

    static async insertToWhitelistKey(value: string): Promise<void> {
        chrome.storage.local.get(["whitelistKey"], (result) => {
            const list: string[] = result["whitelistKey"] || [];
            if (!list.includes(value)) {
                list.push(value);
                chrome.storage.local.set({ whitelistKey: list });
            }
        });
    }

    static async insertToBlacklistKey(value: string): Promise<void> {
        chrome.storage.local.get(["blacklistKey"], (result) => {
            const list: string[] = result["blacklistKey"] || [];
            if (!list.includes(value)) {
                list.push(value);
                chrome.storage.local.set({ blacklistKey: list });
            }
        });
    }

    static async getWhitelistKeyValues(): Promise<string[]> {
        return new Promise((resolve) => {
            chrome.storage.local.get(["whitelistKey"], (result) => {
                resolve(result["whitelistKey"] || []);
            });
        });
    }

    static async getBlacklistKeyValues(): Promise<string[]> {
        return new Promise((resolve) => {
            chrome.storage.local.get(["blacklistKey"], (result) => {
                resolve(result["blacklistKey"] || []);
            });
        });
    }

    static async removeFromList(key: string, value: string): Promise<void> {
        chrome.storage.local.get([key], (result) => {
            const list: string[] = result[key] || [];
            const updated = list.filter((v) => v !== value);
            chrome.storage.local.set({ [key]: updated });
        });
    }
}
