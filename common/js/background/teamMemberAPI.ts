import currentEnvironment from "../config";
import { apiFetch } from "./apiFetch";
import { LocalDb } from "./localDb";

export interface CopiedJobData {
    title: string;
    company: string;
    location: string;
    url: string;
}

export async function saveCopiedJob(jobData: CopiedJobData): Promise<boolean> {
    const res = await apiFetch(`/api/v1/members/copied-jobs`, {
        method: "POST",
        body: JSON.stringify(jobData),
    });

    return !!res?.success;
}

export interface AnalyzedJobData {
    jobHtml: string;
    matchedWhitelist: string[];
    matchedBlacklist: string[];
    url: string;
}

export async function saveAnalyzedJob(data: AnalyzedJobData): Promise<boolean> {
    const res = await apiFetch(`/api/v1/members/analyzed-jobs`, {
        method: "POST",
        body: JSON.stringify(data),
    });

    return !!res?.success;
}

export async function syncKeywordWithBackend(
    type: "whitelistKeywords" | "blacklistKeywords",
    value: string | string[],
    action: "add" | "remove"
): Promise<void> {
    try {
        await apiFetch(`/api/v1/members/keywords`, {
            method: "POST",
            body: JSON.stringify({ type, value, action }),
        });
    } catch (err) {
        console.log("Failed to sync with backend:", err);
    }
}

export async function fetchAndStoreKeywords(): Promise<void> {
    try {
        const apiUrl = `${currentEnvironment.apiUrl}/api/v1/members/keywords`;

        const response = await fetch(apiUrl, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const responseData = await response.json();

        const { whitelistKeywords, blacklistKeywords } = responseData?.data;

        if (whitelistKeywords) {
            await LocalDb.insertToWhitelistKey(whitelistKeywords, true);
        }
        if (blacklistKeywords) {
            await LocalDb.insertToBlacklistKey(blacklistKeywords, true);
        }

        console.log("Keywords updated in local storage");
    } catch (err) {
        console.error("Failed to fetch and store keywords:", err);
    }
}
