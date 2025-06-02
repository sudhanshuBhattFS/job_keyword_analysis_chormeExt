import { MessageBridge } from "./messageBridge";
import "../config";
import { attachPopup } from "./ext_popup";

// 🔁 Initial bootstrapping
MessageBridge.sendToServiceWorker({ type: "isLoggedIn" }, true);

let isLoggedIn;
// 🔁 Handle incoming messages from service worker
MessageBridge.onMessage(async (request) => {
  switch (request?.type) {
    case "initPopup": {
      console.log("Initializing popup with data:", request.data);
      attachPopup(request.data.isLoggedIn || false);
      break;
    }

    default:
      console.warn("Unhandled message:", request);
  }
});
