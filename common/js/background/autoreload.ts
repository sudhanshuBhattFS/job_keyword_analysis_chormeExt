import { config } from "./config";

export const autoReloadTabs = async () => {
  const validPortalNames = config.map((c) => c.jobPortal.toLowerCase());

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    tabs.forEach((tab) => {
      const url = tab.url?.toLowerCase();

      if (
        tab.id &&
        url &&
        !tab.discarded &&
        tab.status === "complete" &&
        /^https?:\/\//.test(url) &&
        isMatchingPortal(url, validPortalNames)
      ) {
        chrome.tabs.reload(tab.id, {}, () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Failed to reload tab ${tab.id}:`,
              chrome.runtime.lastError.message
            );
          } else {
            console.log(`Reloaded tab ${tab.id} for matching job portal.`);
          }
        });
      }
    });
  });
};

const isMatchingPortal = (url: string, portals: string[]): boolean => {
  return portals.some((portalName) => url.includes(portalName));
};
