import currentEnvironment from "../config";
import { JobPortalConfig } from "../content/type";

export async function fetchJobPortalConfig(): Promise<any | null> {
    try {
        let apiUrl = `${currentEnvironment.apiUrl}/api/v1/config/ats`;
        const response = await fetch(apiUrl, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // if (!response.ok) {
        //     throw new Error(`Failed to fetch config: ${response.status}`);
        // }
        const result: JobPortalConfig[] = await response.json();
        return result;
    } catch (error) {
        console.log("Error fetching job portal config:", error.message);
        return null;
    }
}
