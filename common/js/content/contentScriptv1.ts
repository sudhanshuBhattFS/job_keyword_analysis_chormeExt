import { MessageBridge } from "./messageBridge";
import "../config";

// 🔁 Initial bootstrapping
MessageBridge.sendToServiceWorker({ type: "isLoggedIn" }, true);

let isLoggedIn;
// 🔁 Handle incoming messages from service worker
MessageBridge.onMessage(async (request) => {
  switch (request?.type) {
    case "initPopup": {
      console.log("Initializing popup with data:", request.data);
      break;
    }

    default:
      console.warn("Unhandled message:", request);
  }
});
