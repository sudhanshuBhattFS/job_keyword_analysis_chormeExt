import { ConfigStore, matchUrlPattern } from "./config-handling";
import $ from "jquery";
import { MessageBridge } from "./messageBridge";
import { highlightAndCountKeywords } from "./highlight/highlight";
import { KeywordMatchResult } from "./type";

export function handleCopyJob(): void {
    CopyTabPanel.copyJobDataToClipboard();
}

export async function handleAnalyseJob(
    _: Function, // still passed but unused
    shadowRoot: ShadowRoot
): Promise<void> {
    CopyTabPanel.highlightAnalysisJobDescription(shadowRoot);
}

export class CopyTabPanel {
    static renderCopyTab(): string {
        return `
      <div class="tab-pane fade show active" id="copy-tab-pane" role="tabpanel" aria-labelledby="copy-tab" tabindex="0">
        <div id="copy-btn-panel" class="d-flex flex-column justify-content-center align-items-center gap-3 min-vh-25 w-100">
          <div id="copy-status-message" class="w-100 p-3 hint-heading border rounded">
            Click copy to get job details. <br/>
            Click analyse to check matching keywords.
          </div>
          <div class="d-flex justify-content-between gap-2 w-100">
            <button id="copy-job-description-btn" class="btn btn-primary heading w-100">Copy</button>
            <button id="analyse-job-description-btn" class="btn btn-secondary heading w-100">Analyse</button>
          </div>
        </div>
        <div id='display-list'></div>
      </div>
    `;
    }

    static displayAnalyzedJobData(result: KeywordMatchResult): string {
        return `
                <div class="alert alert-light border p-3 my-4">
                  <div class="d-flex justify-content-around mb-3">
                    <span class="badge bg-success fs-6 px-3 py-2">Whitelist: ${
                        result.whitelistCount
                    }</span>
                    <span class="badge bg-danger fs-6 px-3 py-2">Blacklist: ${
                        result.blacklistCount
                    }</span>
                  </div>
                  <hr>
                  <div class="d-flex flex-column gap-1">
                    <div>
                      <h6 class='fw-bold'>Matched Whitelist</h6>
                      <div class="d-flex flex-wrap gap-2 badge-container">
                        ${
                            result.matchedWhitelist.length
                                ? result.matchedWhitelist
                                      .map(
                                          (w) =>
                                              `<span class="badge bg-success p-2 rounded-pill">${w}</span>`
                                      )
                                      .join("")
                                : "None"
                        }
                      </div>
                    </div>
                    <hr>
                    <div>
                      <h6 class='fw-bold'>Matched Blacklist</h6>
                      <div class="d-flex flex-wrap gap-2 badge-container">
                        ${
                            result.matchedBlacklist.length
                                ? result.matchedBlacklist
                                      .map(
                                          (w) =>
                                              `<span class="badge bg-danger p-2 rounded-pill">${w}</span>`
                                      )
                                      .join("")
                                : "None"
                        }
                      </div>
                    </div>
                  </div>
                </div>
            `;
    }

    static async copyJobDataToClipboard(): Promise<void> {
        const configStore = ConfigStore.getInstance();
        const configList = await configStore.loadConfig();

        if (!configList?.length) {
            console.warn("No configuration found.");
            return;
        }

        const matchedConfig = configList.find((cfg) => matchUrlPattern(cfg));

        if (!matchedConfig) {
            console.warn("No matching job portal config for this page.");
            return;
        }

        function getText(selectors: string | string[]): string {
            const selArr = Array.isArray(selectors) ? selectors : [selectors];
            for (const sel of selArr) {
                const ele = $(sel);
                if (ele.length > 0) {
                    const text = ele[0].textContent?.trim();
                    if (text) return text;
                }
            }
            return "N/A";
        }

        const companyName = getText(
            matchedConfig.selectors.companyName.selector
        );
        const location = getText(matchedConfig.selectors.location.selector);
        const title = getText(matchedConfig.selectors.jobTitle.selector);
        const url = window.location.href;

        const row = `${companyName}\t${title}\t${location}\t${url}`;

        //send message to background to save analyzed job
        let copyJobData = await MessageBridge.sendToServiceWorker(
            {
                type: "atsJobCopied",
                data: {
                    jobData: { company: companyName, location, title, url },
                },
            },
            true
        );

        try {
            await navigator.clipboard.writeText(row);
            console.log("Job data copied to clipboard:", row);
        } catch (err) {
            console.error("Clipboard copy failed:", err);
        }
    }

    static async highlightAnalysisJobDescription(
        shadowRoot: ShadowRoot
    ): Promise<void> {
        const configStore = ConfigStore.getInstance();
        const configList = await configStore.loadConfig();

        if (!configList?.length) {
            console.warn("No configuration found.");
            return;
        }

        const matchedConfig = configList.find((cfg) => matchUrlPattern(cfg));
        const selector = matchedConfig?.selectors?.description?.selector;

        if (!selector) {
            console.warn("Description selector not found.");
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

            const result = highlightAndCountKeywords(
                selector,
                whitelist || [],
                blacklist || []
            );

            console.log("Highlighting complete. Match counts:", result);

            const displayList = shadowRoot.querySelector("#display-list");
            if (!displayList) {
                console.warn("#display-list not found in Shadow DOM.");
                return;
            }

            const url = window.location.href;
            //send message to background to save analyzed job
            let analyseSaveStatus = await MessageBridge.sendToServiceWorker(
                { type: "atsJobAnalyzed", data: { jobData: {...result, url} } },
                true
            );

            displayList.innerHTML = CopyTabPanel.displayAnalyzedJobData(result);
        } catch (err) {
            console.error("Keyword highlight failed:", err);
        }
    }
}

function sendDataToGoogleSheet(data: any) {
    MessageBridge.sendToServiceWorker(
        { type: "sendDataToGoogleSheet", data },
        false
    );
}
