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

  static async setCsrfToken(token: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [StorageKeys.CSRF_TOKEN]: token }, () => {
        resolve();
      });
    });
  }

  static async getCsrfToken(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([StorageKeys.CSRF_TOKEN], (result) => {
        resolve(result[StorageKeys.CSRF_TOKEN] || null);
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
  static async setSelectedCandidateId(id: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.session.set(
        { [StorageKeys.SELECTED_CANDIDATE_ID]: id },
        () => {
          resolve();
        }
      );
    });
  }

  static async getSelectedCandidateId(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.session.get(
        [StorageKeys.SELECTED_CANDIDATE_ID],
        (result) => {
          resolve(result[StorageKeys.SELECTED_CANDIDATE_ID] ?? null);
        }
      );
    });
  }
}
