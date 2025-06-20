import currentEnvironment from "../config";
import { LocalDb } from "./localDb";

export async function apiFetch<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T | null> {
    try {
        const response = await fetch(
            `${currentEnvironment.apiUrl}${endpoint}`,
            {
                ...options,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {}),
                },
            }
        );

        // ⚠️ Handle expired session
        if (response.status === 401) {
            console.log("Session expired. Logging out...");
            await LocalDb.clearAuthData(); // Clear local storage or cookies
            chrome.runtime.sendMessage({ type: "SESSION_EXPIRED" });
            return null;
        }

        if (!response.ok) {
            const error = await response.text();
            console.error("API Error:", response.status, error);
            return null;
        }

        return await response.json();
    } catch (err) {
        console.error("Fetch failed:", err);
        return null;
    }
}
