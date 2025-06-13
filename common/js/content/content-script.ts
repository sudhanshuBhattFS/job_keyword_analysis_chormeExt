import { MessageBridge } from "./messageBridge";
import "../config";
import { attachLoginPopup, attachMainPopup, attachPopup } from "./ext_popup";
import { ConfigStore, matchUrlPattern } from "./config-handling";

// 🔁 Handle incoming messages from service worker
MessageBridge.onMessage(async (request) => {
    switch (request?.type) {
        case "SESSION_EXPIRED":
            {
                // showLoginScreen(); // Your custom UI renderer
            }
            break;
        case "refreshUI": {
            if (request.isLoggedIn) {
                attachMainPopup();
            } else {
                attachLoginPopup();
            }
        }
        default:
            console.warn("Unhandled message:", request);
    }
});

const initialize = async (): Promise<void> => {
    try {
        console.log("INIT");
        // 🔁 Initial bootstrapping
        const initUI = await MessageBridge.sendToServiceWorker(
            { type: "isLoggedIn" },
            true
        );
        if (initUI && initUI.isLoggedIn) {
            //initiate extension Popup UI
            const config = initUI.config;
            console.log(matchUrlPattern(config), "MATCH_CONFIG");
            if (matchUrlPattern(config)) {
                const configStore = ConfigStore.getInstance();
                configStore.setConfig(config);
                attachMainPopup();
            }
        } else {
            //display loggin popup UI
            attachLoginPopup();
        }
    } catch (error) {
        console.error("Failed to initialize Spoiler Shield:", error);
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}
