import { handleLogin } from "./auth-handlers";
import {
  handleAddBlacklist,
  handleAddWhitelist,
  handleBadgeRemove,
} from "./badge-handlers";
import { KeywordToolPanel } from "./tabs";

export function setupGlobalEventDelegation($JQ, shadowRoot: ShadowRoot) {
  const $ = (selector: string) => $JQ(shadowRoot.querySelector(selector));

  KeywordToolPanel.initialize(shadowRoot);
  shadowRoot.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const actions = [
      {
        match: () => target.closest("#add-whitelist"),
        handler: () => handleAddWhitelist($),
      },
      {
        match: () => target.closest("#add-blacklist"),
        handler: () => handleAddBlacklist($),
      },
      {
        match: () => target.classList.contains("btn-close"),
        handler: () => handleBadgeRemove(target),
      },
      {
        match: () =>
          target.matches("#loginBtn_job_keyword") && target.closest("form"),
        handler: () => handleLogin($),
      },
    ];

    for (const action of actions) {
      if (action.match()) {
        e.preventDefault();
        action.handler();
        break;
      }
    }
  });
}
