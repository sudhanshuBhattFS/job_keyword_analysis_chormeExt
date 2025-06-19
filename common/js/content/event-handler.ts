import { handleLogin } from "./auth-handlers";
import {
    handleAddBlacklist,
    handleAddWhitelist,
    handleBadgeRemove,
} from "./badge-handlers";
import { handleAnalyseJob, handleCopyJob } from "./copy-tab-handler";
import { KeywordToolPanel } from "./tabs";

// Define type for jQuery function that accepts a selector and returns wrapped elements
type JQueryLike = (selector: string) => JQuery<HTMLElement>;

let existingClickHandler: EventListener | null = null;

export function setupGlobalEventDelegation(
    $JQ: JQueryStatic,
    shadowRoot: ShadowRoot
): void {
    const $: JQueryLike = (selector: string) =>
        $JQ(shadowRoot.querySelector(selector) as HTMLElement);

    KeywordToolPanel.initialize(shadowRoot);

    // Clean up old handler if exists
    if (existingClickHandler) {
        shadowRoot.removeEventListener("click", existingClickHandler);
    }

    // Define and assign the new handler
    existingClickHandler = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target) return;

        const actions = [
            {
                match: () => !!target.closest("#add-whitelist"),
                handler: () => handleAddWhitelist($),
            },
            {
                match: () => !!target.closest("#add-blacklist"),
                handler: () => handleAddBlacklist($),
            },
            {
                match: () => target.classList.contains("btn-close"),
                handler: () => handleBadgeRemove(target),
            },
            {
                match: () =>
                    target.matches("#loginBtn_job_keyword") &&
                    !!target.closest("form"),
                handler: () => handleLogin($),
            },
            {
                match: () => target.matches("#copy-job-description-btn"),
                handler: () => handleCopyJob(),
            },
            {
                match: () => target.matches("#analyse-job-description-btn"),
                handler: () => handleAnalyseJob($, shadowRoot),
            },
        ];

        for (const action of actions) {
            if (action.match()) {
                e.preventDefault();
                action.handler();
                break;
            }
        }
    };

    shadowRoot.addEventListener("click", existingClickHandler);
}
