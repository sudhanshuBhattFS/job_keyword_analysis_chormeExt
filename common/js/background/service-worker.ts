import { MessageBridge } from "./messageBridge";
import { LocalDb } from "./localDb";
import { tabData } from "./data";
import { config } from "./config";
import { autoReloadTabs } from "./autoreload";

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
      const isLoggedIn = await LocalDb.getLoggedIn();

      const matchedConfig = config.find((item) =>
        currentUrl.includes(item.jobPortal.toLowerCase())
      );

      console.log("isLoggedIn", isLoggedIn, "matchedConfig", matchedConfig);

      if (tabId) {
        MessageBridge.sendToContentScript(
          tabId,
          {
            type: "initPopup",
            data: {
              isLoggedIn: isLoggedIn ?? false,
              config: matchedConfig,
            },
          },
          false
        );
      } else {
        console.warn("No tabId found for sender.");
      }

      return;
    }

    case "getTabData": {
      return tabData;
    }

    case "loginUser": {
      const { email, password } = request.data || {};

      if (email === "saurabh@gmail.com" && password === "1234") {
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

    default:
      return;
  }
});
