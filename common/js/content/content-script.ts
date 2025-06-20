import { MessageBridge } from "./messageBridge";
import "../config";
import { attachLoginPopup, attachMainPopup } from "./ext_popup";
import { ConfigStore, matchUrlPattern } from "./config-handling";

// 🔁 Handle incoming messages from service worker
MessageBridge.onMessage(async (request) => {
    switch (request?.type) {
        case "SESSION_EXPIRED":
            // TODO: handle session expiration UI
            break;

        case "refreshUI":
            if (request.isLoggedIn) {
                attachMainPopup();
            } else {
                attachLoginPopup();
            }
            break;

        default:
            console.log("Unhandled message:", request);
    }
});

const initialize = async (): Promise<void> => {
    try {
        const configStore = ConfigStore.getInstance();
        const configList = await configStore.loadConfig();
        if (!Array.isArray(configList) || configList.length === 0) {
            console.log("No configuration available.");
            return;
        }

        console.log("INIT");

        // 🔁 Check login status
        const initUI = await MessageBridge.sendToServiceWorker(
            { type: "isLoggedIn" },
            true
        );

        if (initUI?.isLoggedIn) {
            // Try to find matching config
            const matchedConfig = configList.find((config) =>
                matchUrlPattern(config)
            );

            if (matchedConfig) {
                console.log(
                    "Matched config for current site:",
                    matchedConfig.jobPortal
                );
                attachMainPopup();
            } else {
                console.log("No matching job portal config found.");
            }
        } else {
            attachLoginPopup();
        }
    } catch (error) {
        console.error("Failed to initialize extension:", error);
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}
