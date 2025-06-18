import { MessageBridge } from "./messageBridge";
import { LocalDb } from "./localDb";
import { tabData } from "./data";
import { config } from "./config";
import { autoReloadTabs } from "./autoreload";
import { loginTeamMember, logoutTeamMember } from "./authAPI";
import { fetchJobPortalConfig } from "./settingAPI";

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
                console.warn("[isLoggedIn] No tabId found for sender.");
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

        case "getTabData": {
            return tabData;
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

        case "logout" : {
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

        case "storeWhiteLabelValue": {
            const { value } = request.data || {};
            if (value) await LocalDb.insertToWhitelistKey(value);
            return;
        }

        case "storeBlackLabelValue": {
            const { value } = request.data || {};
            if (value) await LocalDb.insertToBlacklistKey(value);
            return;
        }

        case "getWhiteLabelValues": {
            const values = await LocalDb.getWhitelistKeyValues();
            return values;
        }

        case "getBlackLabelValues": {
            const values = await LocalDb.getBlacklistKeyValues();
            return values;
        }

        case "removeWhiteLabelValue": {
            const { value } = request.data || {};
            if (value) await LocalDb.removeFromList("whitelistKey", value);
            return;
        }

        case "removeBlackLabelValue": {
            const { value } = request.data || {};
            if (value) await LocalDb.removeFromList("blacklistKey", value);
            return;
        }

        case "sendDataToGoogleSheet": {
            const { data } = request;
            fetch(
                "https://script.google.com/macros/s/AKfycbxFS0wn3gvPi7_Vqop6NvRP-gVpZmVEGbLVH5Kx2qDyUPgMHomO-DLr_DjZkOHQbzEZXg/exec",
                {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
                .then((response) => response.json())
                .then((res) => console.log("Google Sheet Response:", res))
                .catch((err) =>
                    console.log("Error pushing to Google Sheet", err.message)
                );
        }

        case "atsConfigFetch": {
            const config = await fetchJobPortalConfig();
            return config;
        }
        default:
            return;
    }
});
