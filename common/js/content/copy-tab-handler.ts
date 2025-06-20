// -----------------------------
// 1. Imports
// -----------------------------
import $ from "jquery";
import { ConfigStore, matchUrlPattern } from "./config-handling";
import { MessageBridge } from "./messageBridge";
import { highlightAndCountKeywords } from "./highlight/highlight";
import { KeywordMatchResult } from "./type";
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
    console.warn("[getText] No match for selectors:", selArr);
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

function sendDataToGoogleSheet(data: any): void {
    MessageBridge.sendToServiceWorker(
        { type: "sendDataToGoogleSheet", data },
        false
    );
}

// -----------------------------
// 3. Public Action Handlers
// -----------------------------
export function handleCopyJob(): void {
    CopyTabPanel.copyJobDataToClipboard();
}

export async function handleAnalyseJob(
    _: Function,
    shadowRoot: ShadowRoot
): Promise<void> {
    CopyTabPanel.highlightAnalysisJobDescription(shadowRoot);
}

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

    // 4.2 Display analyzed keywords
    static displayAnalyzedJobData(result: KeywordMatchResult): string {
        if (!result || typeof result !== "object")
            return `<div class="text-center text-muted">No data to display.</div>`;

        const capped = (arr: string[]) => [...new Set(arr)].slice(0, 50);
        const renderBadges = (items: string[], badgeClass: string) =>
            capped(items).length
                ? capped(items)
                      .map(
                          (w) =>
                              `<span class="badge ${badgeClass} px-3 py-2 rounded-pill small">${w}</span>`
                      )
                      .join("")
                : `<span class="text-muted">None</span>`;

        return `
    <div class="card border-0 shadow-sm rounded-4 pt-2 mt-2 px-4 bg-light">
        <div class="mb-3">
            <h6 class="fw-bold text-success mb-2">Matched Whitelist ${
                result.whitelistCount
            }</h6>
            <div class="d-flex flex-wrap gap-2 badge-container">
                ${renderBadges(result.matchedWhitelist, "bg-success")}
            </div>
        </div>
        <hr />
        <div>
            <h6 class="fw-bold text-danger mb-2">Matched Blacklist ${
                result.blacklistCount
            }</h6>
            <div class="d-flex flex-wrap gap-2 badge-container">
                ${renderBadges(result.matchedBlacklist, "bg-danger")}
            </div>
        </div>
    </div>`;
    }

    // 4.3 Copy current job details to clipboard
    static async copyJobDataToClipboard(): Promise<void> {
        const shadowRoot = getExtensionShadowRoot();
        if (!shadowRoot) return;

        const copyBtn = shadowRoot.querySelector(
            "#copy-job-description-btn"
        ) as HTMLButtonElement;
        const displayList = shadowRoot.querySelector(
            "#display-list"
        ) as HTMLElement;

        if (copyBtn) copyBtn.disabled = true;
        if (displayList) showSpinner(displayList);

        const jobData = await this.getCurrentJobData();
        if (!jobData) {
            showError(displayList, "Unable to extract job data.");
            if (copyBtn) copyBtn.disabled = false;
            return;
        }

        const row = [
            jobData.company,
            jobData.title,
            jobData.location,
            jobData.url,
        ].join("\t");

        try {
            await MessageBridge.sendToServiceWorker(
                { type: "atsJobCopied", data: { jobData } },
                true
            );
            await navigator.clipboard.writeText(row);
            displayList.innerHTML = `<div class="alert alert-success mb-0">Copied successfully.</div>`;
        } catch (err) {
            console.warn("Copy failed:", err);
            showError(displayList, "Clipboard copy failed.");
        }

        if (copyBtn) copyBtn.disabled = false;
    }

    // 4.4 Highlight job description and show keyword match summary
    static async highlightAnalysisJobDescription(
        shadowRoot: ShadowRoot
    ): Promise<void> {
        const analyseBtn = shadowRoot.querySelector(
            "#analyse-job-description-btn"
        ) as HTMLButtonElement;
        const displayList = shadowRoot.querySelector(
            "#display-list"
        ) as HTMLElement;

        if (!displayList) {
            alert("Analysis UI cannot be shown. Missing container.");
            return;
        }

        if (analyseBtn) analyseBtn.disabled = true;
        showSpinner(displayList);

        const configStore = ConfigStore.getInstance();
        const configList = await configStore.loadConfig();

        if (!Array.isArray(configList) || configList.length === 0) {
            showError(displayList, "No configuration found.");
            if (analyseBtn) analyseBtn.disabled = false;
            return;
        }

        const matchedConfig = configList.find((cfg) => matchUrlPattern(cfg));
        const selector = matchedConfig?.selectors?.description?.selector;

        if (!selector) {
            showError(displayList, "Description selector missing in config.");
            if (analyseBtn) analyseBtn.disabled = false;
            return;
        }

        try {
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
                showError(displayList, "Keyword lists are invalid.");
                if (analyseBtn) analyseBtn.disabled = false;
                return;
            }

            const result = highlightAndCountKeywords(
                selector,
                whitelist,
                blacklist
            );
            console.log("result", result);
            const jobData = await this.getCurrentJobData();
            if (!jobData) {
                showError(displayList, "Job info not found.");
                if (analyseBtn) analyseBtn.disabled = false;
                return;
            }

            // const url = window.location.href;

            await MessageBridge.sendToServiceWorker(
                {
                    type: "atsJobAnalyzed",
                    data: {
                        jobData: {
                            ...result,
                            ...jobData,
                        },
                    },
                },
                true
            );

            displayList.innerHTML = this.displayAnalyzedJobData(result);
        } catch (err) {
            showError(
                displayList,
                "An error occurred while analyzing the job."
            );
            console.error("Analysis failed:", err);
        } finally {
            if (analyseBtn) analyseBtn.disabled = false;
        }
    }

    static async getCurrentJobData(): Promise<{
        title: string;
        company: string;
        location: string;
        url: string;
    } | null> {
        const configStore = ConfigStore.getInstance();
        const configList = await configStore.loadConfig();

        if (!configList || configList.length === 0) {
            return null;
        }

        const matchedConfig = configList.find((cfg) => matchUrlPattern(cfg));
        if (!matchedConfig) return null;

        const company = getText(
            matchedConfig?.selectors?.companyName?.selector
        );
        const location = getText(matchedConfig?.selectors?.location?.selector);
        const title = getText(matchedConfig?.selectors?.jobTitle?.selector);
        const url = window.location.href;

        return {
            title: sanitize(title),
            company: sanitize(company),
            location: sanitize(location),
            url,
        };
    }
}
