export interface SelectorConfig {
    selector: string[];
}

export interface JobPortalConfig {
    jobPortal: string;
    validUrlPatterns: string[];
    selectors: {
        jobTitle: SelectorConfig;
        companyName: SelectorConfig;
        location: SelectorConfig;
        description: SelectorConfig;
        [key: string]: SelectorConfig; // Optional extensibility
    };
}

export async function fetchJobPortalConfig(): Promise<JobPortalConfig[]> {
    const response = await fetch("https://your-backend.com/api/config", {
        method: "GET",
        credentials: "include", // if using cookie auth
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
    }

    const result: JobPortalConfig[] = await response.json();
    return result;
}
