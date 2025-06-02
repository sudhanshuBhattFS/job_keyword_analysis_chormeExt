import { MessageBridge } from "./messageBridge";
import { LocalDb } from "./localDb";

// Set up a listener
MessageBridge.onMessage(async (request, sender) => {
  const tabId = sender.tab?.id ?? null;
  const senderUrl = sender.tab?.url ?? null;
  console.log("request", request);
  switch (request?.type) {
    case "isLoggedIn": {
      console.log("Checking if logged in");
      return;
    }

    default:
      return; // Unhandled type
  }
});
