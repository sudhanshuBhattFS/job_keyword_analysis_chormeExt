import { MessageBridge } from "./messageBridge";
import "../config";
import { attachPopup } from "./ext_popup";
import { ConfigStore, matchUrlPattern } from "./config-handling";

// 🔁 Initial bootstrapping
MessageBridge.sendToServiceWorker({ type: "isLoggedIn" }, true);

// 🔁 Handle incoming messages from service worker
MessageBridge.onMessage(async (request) => {
  switch (request?.type) {
    case "initPopup": {
      const config = request.data.config;

      const configStore = ConfigStore.getInstance();
      configStore.setConfig(config);
      attachPopup(request.data.isLoggedIn || false);

      break;
    }

    default:
      console.warn("Unhandled message:", request);
  }
});
