import { ConfigStore } from "./config-handling";
import $ from "jquery";
import { MessageBridge } from "./messageBridge";
import {
  highlightAndCountKeywords,
  KeywordMatchCount,
} from "./highlight/highlight";
export function handleCopyJob($: Function, shadowRoot: ShadowRoot): void {
  const $copyButton = $("#copy-btn-panel");

  CopyTabPanel.copyJobDataToClipboard();
}

export async function handleAnalyseJob(
  $: Function,
  shadowRoot: ShadowRoot
): Promise<void> {
  CopyTabPanel.highlightAnalysisJobDescription(shadowRoot);
}

export class CopyTabPanel {
  // Static method to render the Copy Tab HTML
  static renderCopyTab(): string {
    return `
      <div class="tab-pane fade show active" id="copy-tab-pane" role="tabpanel" aria-labelledby="copy-tab" tabindex="0">
      
     <div id="copy-btn-panel" class="d-flex flex-column justify-content-center align-items-center gap-3 min-vh-25 w-100">
       <div 
         id="copy-status-message" 
         class="w-100 p-3 hint-heading border rounded"
       >
         Click copy to get job details. <br/>
         Click analyse to check matching keywords.
       </div>
     
       <!-- Wrap buttons in a row container -->
       <div class="d-flex justify-content-between gap-2 w-100">
         <button id="copy-job-description-btn" class="btn btn-primary heading w-100">
           Copy
         </button>
         <button id="analyse-job-description-btn" class="btn btn-secondary heading w-100">
           Analyse
         </button>
       </div>
     </div>


        <div id='display-list' >
        </div>
      </div>

    `;
  }

  static async copyJobDataToClipboard(): Promise<void> {
    const configStore = ConfigStore.getInstance();
    const config = configStore.getConfig();

    if (!config) {
      console.warn("No configuration found for the current job portal.");
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

    const companyName = getText(config.selectors.companyName.selector);
    const location = getText(config.selectors.location.selector);
    const title = getText(config.selectors.jobTitle.selector);
    const url = window.location.href;

    const row = `${title}\t${companyName}\t${location}\t${url}`;

    try {
      await navigator.clipboard.writeText(row);
      console.log("Job data copied to clipboard (tabular format).");
    } catch (err) {
      console.error("Failed to copy job data to clipboard:", err);
    }
  }

  static async highlightAnalysisJobDescription(
    shadowRoot: ShadowRoot
  ): Promise<void> {
    const configStore = ConfigStore.getInstance();
    const config = configStore.getConfig();

    const selector = config?.selectors?.description?.selector;
    if (!selector) {
      console.warn("Job description selector not found in config.");
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

      const result: KeywordMatchCount = highlightAndCountKeywords(
        selector,
        whitelist || [],
        blacklist || []
      );

      console.log("Highlighting complete. Match counts:", result);

      const displayList = shadowRoot.querySelector("#display-list");

      if (displayList) {
        displayList.innerHTML = `
        <div class="alert alert-light border d-flex justify-content-around my-4">
          <button class="btn btn-primary   bg-success ">Whitelist: ${result.whitelistCount}</button>
          <button class="btn btn-primary   bg-danger ">Blacklist: ${result.blacklistCount}</button>
        </div>
      `;
      } else {
        console.warn("#display-list not found inside Shadow DOM.");
      }
    } catch (err) {
      console.error(
        "Failed to fetch keywords or highlight job description:",
        err
      );
    }
  }
}
