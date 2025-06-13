import { LocalDb } from "./localDb";
import currentEnvironment from "../config";

export async function loginTeamMember(
    email: string,
    password: string
): Promise<any | null> {
    try {
        const response = await fetch(
            `${currentEnvironment.apiUrl}/api/v1/members/login`,
            {
                method: "POST",
                credentials: "include", // ✅ must send cookies
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error("Login failed", error?.message || response.status);
            return null;
        }

        const data = await response.json();
        // Optional: Store member data if needed
        await LocalDb.setAuthData(data.member);
        return data;
    } catch (err) {
        console.error("Login API error:", err);
        return null;
    }
}

export async function logoutTeamMember(): Promise<boolean> {
    try {
        const response = await fetch(
            `${currentEnvironment.apiUrl}/api/v1/members/logout`,
            {
                method: "POST",
                credentials: "include", // ✅ must send cookies to clear session
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error("Logout failed", error?.message || response.status);
            return false;
        }

        // 🧹 Clear auth data from local storage
        await LocalDb.clearAuthData();

        return true;
    } catch (err) {
        console.error("Logout API error:", err);
        return false;
    }
}
