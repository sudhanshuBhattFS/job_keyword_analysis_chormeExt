export interface MessagePayload {
  type: string;
  [key: string]: any; // ✅ Allow dynamic fields like `allTabs`, `candidateId`, etc.
}

type MessageResponse = any;

// Utility to send a message and optionally wait for response
export const MessageBridge = {
  // From service worker → content script (tabId is required)
  sendToContentScript<T = MessageResponse>(
    tabId: number | string | undefined,
    message: MessagePayload,
    waitForResponse = true
  ): Promise<T | null> {
    const numericTabId = Number(tabId);

    if (!Number.isInteger(numericTabId) || numericTabId <= 0) {
      console.warn("Invalid tabId for sendToContentScript:", tabId, message);
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(numericTabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "ContentScript error:",
            chrome.runtime.lastError.message
          );
          resolve(null);
        } else {
          resolve(response);
        }
      });

      if (!waitForResponse) {
        resolve(null); // resolve immediately for fire-and-forget
      }
    });
  },

  // Message listener (used in both content and service worker)
  onMessage(
    handler: (
      message: MessagePayload,
      sender: chrome.runtime.MessageSender
    ) => Promise<any> | any
  ) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const maybePromise = handler(message, sender);

      if (maybePromise instanceof Promise) {
        maybePromise.then(sendResponse).catch((e) => {
          console.log("Message handler error:", e);
          sendResponse(null);
        });
        return true; // Keep message channel open for async response
      } else {
        sendResponse(maybePromise);
        return true;
      }
    });
  },
};
