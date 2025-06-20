import { MessageBridge } from "./messageBridge";
import { LocalDb } from "./localDb";
import { config } from "./config";
import { autoReloadTabs } from "./autoreload";
import { loginTeamMember, logoutTeamMember } from "./authAPI";
import { fetchJobPortalConfig } from "./settingAPI";
import {
    fetchAndStoreKeywords,
    saveAnalyzedJob,
    saveCopiedJob,
    syncKeywordWithBackend,
} from "./teamMemberAPI";

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install" || details.reason === "update") {
        autoReloadTabs();
    }
});

// Set up a listener
MessageBridge.onMessage(async (request, sender) => {
    const tabId = sender.tab?.id;
    const currentUrl = sender.tab?.url || "";

    console.log("request", request);
    console.log("Sender tab URL:", currentUrl);

    switch (request?.type) {
        case "isLoggedIn": {
            if (!tabId) {
                console.log("[isLoggedIn] No tabId found for sender.");
                return;
            }
            const authData = await LocalDb.getAuthData();
            const isLoggedIn = !!authData;

            const matchedConfig = config.find((item) =>
                currentUrl.toLowerCase().includes(item.jobPortal.toLowerCase())
            );
            let data = {
                isLoggedIn: isLoggedIn,
                config: matchedConfig,
            };

            return data;
        }

        case "loginUser": {
            const { email, password } = request.data || {};

            let data = await loginTeamMember(email, password);
            if (!data) {
                return {
                    status: false,
                    message: "Invalid email or password.",
                };
            } else {
                return {
                    status: true,
                    message: "Login successful.",
                };
            }
        }

        case "logout": {
            let data = await logoutTeamMember();
            if (!data) {
                return {
                    status: false,
                    message: "Unable to logout.",
                };
            } else {
                return {
                    status: true,
                    message: "Logout successful.",
                };
            }
        }

        case "getWhiteLabelValues": {
            const values = await LocalDb.getWhitelistKeyValues();
            return values;
        }

        case "getBlackLabelValues": {
            const values = await LocalDb.getBlacklistKeyValues();
            return values;
        }

        case "storeWhiteLabelValue": {
            const { value } = request.data || {};
            if (value) {
                await LocalDb.insertToWhitelistKey(value);
                await syncKeywordWithBackend("whitelistKeywords", value, "add");
            }
            return;
        }

        case "storeBlackLabelValue": {
            const { value } = request.data || {};
            if (value) {
                await LocalDb.insertToBlacklistKey(value);
                await syncKeywordWithBackend("blacklistKeywords", value, "add");
            }
            return;
        }

        case "removeWhiteLabelValue": {
            const { value } = request.data || {};
            if (value) {
                await LocalDb.removeFromList("whitelistKeywords", value);
                await syncKeywordWithBackend(
                    "whitelistKeywords",
                    value,
                    "remove"
                );
            }
            return;
        }

        case "removeBlackLabelValue": {
            const { value } = request.data || {};
            if (value) {
                await LocalDb.removeFromList("blacklistKeywords", value);
                await syncKeywordWithBackend(
                    "blacklistKeywords",
                    value,
                    "remove"
                );
            }
            return;
        }

        case "atsConfigFetch": {
            const config = await fetchJobPortalConfig();
            return config;
        }

        case "atsJobCopied": {
            const { jobData } = request.data || {};
            if (jobData) {
                // Assuming saveCopiedJob is defined in teamMemberAPI
                const result = await saveCopiedJob(jobData);
                return { success: result };
            }
            return { success: false, message: "No job data provided." };
        }
        case "atsJobAnalyzed": {
            const { jobData } = request.data || {};
            if (jobData) {
                // Assuming saveAnalyzedJob is defined in teamMemberAPI
                const result = await saveAnalyzedJob(jobData);
                return { success: result };
            }
            return { success: false, message: "No job data provided." };
        }

        case "syncKeywordWithBackend": {
            await fetchAndStoreKeywords();
            return;
        }
        default:
            return;
    }
});
