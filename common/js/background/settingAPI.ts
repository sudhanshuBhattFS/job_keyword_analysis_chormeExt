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

        const result = await response.json();

        if (!Array.isArray(result.data)) {
            throw new Error("Invalid config format");
        }

        return result.data;
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error fetching job portal config:", error.message);
        } else {
            console.log(
                "Unknown error occurred while fetching job portal config:",
                error
            );
        }
        return null;
    }
}
