// -----------------------------
// 1. Imports
// -----------------------------
import $ from "jquery";
import { ConfigStore, matchUrlPattern } from "./config-handling";
import { MessageBridge } from "./messageBridge";
import {
    getKeywordMatches,
    highlightAndCountKeywords,
} from "./highlight/highlight";
import { getExtensionShadowRoot } from "../../utils/global";

// -----------------------------
// 2. Utility Functions
// -----------------------------
function getText(selectors: string | string[]): string {
    const selArr = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of selArr) {
        if (!sel) continue;
        const ele = $(sel);
        if (ele.length > 0) {
            const text = ele[0].textContent?.trim();
            if (text) {
                console.log(`[getText] Found "${text}" for selector "${sel}"`);
                return text;
            }
        }
    }
    console.log("[getText] No match for selectors:", selArr);
    return "N/A";
}

function getUrl(selectors: string | string[]): string {
    const selArr = Array.isArray(selectors) ? selectors : [selectors];

    for (const sel of selArr) {
        if (!sel) continue;

        const ele = $(sel);
        const elNode = ele.get(0);

        if (elNode && elNode instanceof HTMLAnchorElement && elNode.href) {
            const href = elNode.href.trim();
            console.log(`[getUrl] Found "${href}" for selector "${sel}"`);
            return href;
        }
    }

    console.log("[getUrl] No match for selectors:", selArr);
    return "N/A";
}

function sanitize(text: string): string {
    return text?.replace(/\t/g, " ").replace(/\s+/g, " ").trim();
}

function showSpinner(container: HTMLElement): void {
    container.innerHTML = `<div class="d-flex justify-content-center align-items-center py-3">
        <div class="spinner-border" role="status" aria-hidden="true"></div>
        <span class="ms-2">Processing...</span>
    </div>`;
}

function showError(container: HTMLElement, msg: string): void {
    container.innerHTML = `<div class="alert alert-danger mb-2">${msg}</div>`;
}

// -----------------------------
// 3. Public Action Handlers
// -----------------------------
export function handleCopyJob(): void {
    JobHelper.copyJobDataToClipboard();
}

export async function handleAnalyseJob(
    _: Function,
    shadowRoot: ShadowRoot
): Promise<void> {
    JobHelper.analyseJobDescription(shadowRoot);
}

// -----------------------------------------------------------------------------
//  Shared types
// -----------------------------------------------------------------------------
interface JobData {
    title: string;
    company: string;
    location: string;
    url: string;
}

interface KeywordLists {
    whitelist: string[];
    blacklist: string[];
}

interface SiteConfig {
  selectors: {
    jobTitle?: { selector: string | string[] };
    companyName?: { selector: string | string[] };
    location?: { selector: string | string[] };
    url?: { selector: string | string[] };
    description?: { selector: string | string[] };
  };
}

// -----------------------------------------------------------------------------
//  Generic helpers (no DOM side-effects)
// -----------------------------------------------------------------------------
const fetchConfig = async () => {
    const list = await ConfigStore.getInstance().loadConfig();
    if (!Array.isArray(list) || list.length === 0)
        throw new Error("config.empty");
    return list;
};

const pickCurrentConfig = async () => {
    const config = (await fetchConfig()).find(matchUrlPattern);
    if (!config) throw new Error("config.noMatch");
    return config;
};

const loadKeywordLists = async (): Promise<KeywordLists> => {
    const [whitelist, blacklist] = await Promise.all([
        MessageBridge.sendToServiceWorker(
            { type: "getWhiteLabelValues" },
            true
        ),
        MessageBridge.sendToServiceWorker(
            { type: "getBlackLabelValues" },
            true
        ),
    ]);

    if (!Array.isArray(whitelist) || !Array.isArray(blacklist)) {
        throw new Error("keywords.invalid");
    }
    return { whitelist, blacklist };
};

const extractJobData = (cfg: any): JobData => ({
    title: sanitize(getText(cfg.selectors?.jobTitle?.selector)),
    company: sanitize(getText(cfg.selectors?.companyName?.selector)),
    location: sanitize(getText(cfg.selectors?.location?.selector)),
    url: (() => {
        const alt = getUrl(cfg.selectors?.url?.selector);
        return alt && alt !== "N/A" ? alt : window.location.href;
    })(),
});

// -----------------------------------------------------------------------------
//  UI helpers (deal with spinners / buttons only here)
// -----------------------------------------------------------------------------
async function withSpinner<T>(
    container: HTMLElement,
    button: HTMLButtonElement | null,
    job: () => Promise<T>
): Promise<T> {
    if (button) button.disabled = true;
    showSpinner(container);

    try {
        return await job();
    } catch (err) {
        throw err; // let the caller decide the message
    } finally {
        if (button) button.disabled = false;
    }
}

/* -------------------------------------------------------------------------
   Shared error-message map + tiny helper
------------------------------------------------------------------------- */
const ERROR_MESSAGES: Record<string, string> = {
    "config.empty": "No configuration found.",
    "config.noMatch": "No matching configuration.",
    "config.noDescriptionSelector": "Description selector missing in config.",
    "keywords.invalid": "Keyword lists are invalid.",
};

const msgFor = (code: string, fallback: string) =>
    ERROR_MESSAGES[code] ?? fallback;

// -----------------------------
// 4. CopyTabPanel Class
// -----------------------------
export class CopyTabPanel {
    // 4.1 Render Tab UI
    static renderCopyTab(): string {
        return `
    <div class="tab-pane fade show active" id="copy-tab-pane" role="tabpanel" aria-labelledby="copy-tab" tabindex="0">
        <div id="copy-btn-panel" class="d-flex flex-column gap-4 align-items-center w-100 py-4 px-3 bg-light rounded-4 shadow-sm">
            <div id="copy-status-message" class="w-100 text-center bg-white border rounded-4 p-3 text-muted small fw-medium">
                Click <strong>Copy</strong> to extract job details. <br/>
                Click <strong>Analyse</strong> to match with your keyword lists.
            </div>
            <div class="d-flex gap-3 w-100">
                <button id="copy-job-description-btn" class="btn btn-primary rounded-pill w-50 fw-semibold">
                    Copy
                </button>
                <button id="analyse-job-description-btn" class="btn btn-outline-secondary rounded-pill w-50 fw-semibold">
                    Analyse
                </button>
            </div>
        </div>
        <div id="display-list" class="mt-2"></div>
    </div>`;
    }

    // -------------------------------------------------------------------------
    //  Small pure utility used above
    // -------------------------------------------------------------------------
    static renderAnalysis(
        result: ReturnType<typeof highlightAndCountKeywords>
    ): string {
        return `
      <ul class="list-group">
        <li class="list-group-item">
          <strong>Whitelist (${result.whitelistCount}):</strong>
          ${result.matchedWhitelist.join(", ") || "-"}
        </li>
        <li class="list-group-item">
          <strong>Blacklist (${result.blacklistCount}):</strong>
          ${result.matchedBlacklist.join(", ") || "-"}
        </li>
      </ul>
    `;
    }
}

export class JobHelper {
    /** Copy tab-separated job data to clipboard */
    static async copyJobDataToClipboard(): Promise<void> {
        const shadowRoot = getExtensionShadowRoot();
        if (!shadowRoot) return;

        const copyBtn = shadowRoot.querySelector<HTMLButtonElement>(
            "#copy-job-description-btn"
        );
        const displayEl =
            shadowRoot.querySelector<HTMLElement>("#display-list");
        if (!displayEl) return;

        await withSpinner(displayEl, copyBtn, async () => {
            const cfg = await pickCurrentConfig();
            const job = extractJobData(cfg);
            const { whitelist, blacklist } = await loadKeywordLists();

            // analyse
            const selector = cfg.selectors?.description?.selector ?? "";
            if (!selector) throw new Error("config.noDescriptionSelector");

            const result = getKeywordMatches(selector, whitelist, blacklist);

            // send analysed data to backend
            await MessageBridge.sendToServiceWorker(
                {
                    type: "atsJobAnalyzed",
                    data: { jobData: { ...result, ...job } },
                },
                true
            );

            // copy
            const row = [job.company, job.title, job.location, job.url].join(
                "\t"
            );
            await navigator.clipboard.writeText(row);

            displayEl.innerHTML = `<div class="alert alert-success mb-0">Copied successfully.</div>`;
        }).catch((err) => {
            console.error("Copy flow failed:", err);
            showError(displayEl, msgFor(err.message, "Clipboard copy failed."));
        });
    }

    /** Highlight description & show keyword match summary */
    static async analyseJobDescription(shadowRoot: ShadowRoot): Promise<void> {
        const analyseBtn = shadowRoot.querySelector<HTMLButtonElement>(
            "#analyse-job-description-btn"
        );
        const displayEl =
            shadowRoot.querySelector<HTMLElement>("#display-list");
        if (!displayEl) {
            alert("Analysis UI cannot be shown. Missing container.");
            return;
        }

        await withSpinner(displayEl, analyseBtn, async () => {
            const cfg = await pickCurrentConfig();
            const selector = cfg.selectors?.description?.selector;
            if (!selector) throw new Error("config.noDescriptionSelector");

            const { whitelist, blacklist } = await loadKeywordLists();
            const result = highlightAndCountKeywords(
                selector,
                whitelist,
                blacklist
            );

            displayEl.innerHTML = CopyTabPanel.renderAnalysis(result);
        }).catch((err) => {
            console.error("Analysis failed:", err);
            showError(
                displayEl,
                msgFor(
                    err.message,
                    "An error occurred while analyzing the job."
                )
            );
        });
    }
}
