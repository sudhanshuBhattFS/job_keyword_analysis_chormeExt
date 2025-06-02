import { MessageBridge } from "./messageBridge";
import { LocalDb } from "./localDb";
import { tabData } from "./data";

// Set up a listener
MessageBridge.onMessage(async (request, sender) => {
  const tabId = sender.tab?.id ?? undefined;
  const senderUrl = sender.tab?.url ?? null;
  console.log("request", request);
  switch (request?.type) {
    case "isLoggedIn": {
      const isLoggedIn = await LocalDb.getLoggedIn();

      MessageBridge.sendToContentScript(
        tabId,
        {
          type: "initPopup",
          data: {
            isLoggedIn: isLoggedIn ?? false,
          },
        },
        false
      );
      return;
    }

    case "getTabData": {
      return tabData;
    }

    case "loginUser": {
      const { email, password } = request.data || {};

      if (email === "sudhanshubhatt8@gmail.com" && password === "1234") {
        await LocalDb.setLoggedIn(true);

        return {
          status: true,
          message: "Login successful.",
        };
      }

      return {
        status: false,
        message: "Invalid email or password.",
      };
    }

    default:
      return; // Unhandled type
  }
});
