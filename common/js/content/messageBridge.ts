export interface MessagePayload {
  type: string;
  [key: string]: any;
}

type MessageResponse = any;

// Declare function overloads
function sendToServiceWorker<T = MessageResponse>(
  message: MessagePayload,
  waitForResponse: true
): Promise<T | null>;

function sendToServiceWorker<T = MessageResponse>(
  message: MessagePayload,
  waitForResponse: false
): void;

function sendToServiceWorker<T = MessageResponse>(
  message: MessagePayload,
  waitForResponse?: boolean
): Promise<T | null> | void {
  if (waitForResponse ?? true) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.log(
            "ServiceWorker error:",
            chrome.runtime.lastError.message
          );
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  } else {
    chrome.runtime.sendMessage(message);
  }
}

export const MessageBridge = {
  sendToServiceWorker,

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
        return true;
      } else {
        sendResponse(maybePromise);
        return true;
      }
    });
  },
};
