import currentEnvironment from "../config";
import { apiFetch } from "./apiFetch";

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
        console.warn("Failed to sync with backend:", err);
    }
}
