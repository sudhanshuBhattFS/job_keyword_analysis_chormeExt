import { ConfigStore } from "./config-handling";
import $ from "jquery";
import { MessageBridge } from "./messageBridge";
import { highlightAndCountKeywords } from "./highlight/highlight";
export function handleCopyJob($: Function, shadowRoot: ShadowRoot): void {
  const $copyButton = $("#copy-btn-panel");

  CopyTabPanel.copyJobDataToClipboard();
}

export async function handleAnalyseJob(
  $: Function,
  shadowRoot: ShadowRoot
): Promise<void> {
  console.log("Analyse job description button clicked.");
  CopyTabPanel.highlightAnalysisJobDescription();
}

export class CopyTabPanel {
  // Static method to render the Copy Tab HTML
  static renderCopyTab(): string {
    return `
      <div class="tab-pane fade show active" id="copy-tab-pane" role="tabpanel" aria-labelledby="copy-tab" tabindex="0">
      
     <div id="copy-btn-panel" class="d-flex flex-column justify-content-center align-items-center gap-3 min-vh-25 w-100">
       <div 
         id="copy-status-message" 
         class="w-100 p-3 heading border rounded"
       >
         Click the button to copy the job description.
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


        <div id='copy-job-details' >
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

    function getText(selector: string): string {
      const ele = $(selector);
      if (ele.length === 0) return "N/A";
      return (ele[0].textContent || "").trim() || "N/A";
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

  static async highlightAnalysisJobDescription() {
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

      const result = highlightAndCountKeywords(
        selector,
        whitelist || [],
        blacklist || []
      );

      console.log("Highlighting complete. Match counts:", result);
    } catch (err) {
      console.error(
        "Failed to fetch keywords or highlight job description:",
        err
      );
    }
  }
}
