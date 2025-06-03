import { ConfigStore } from "./config-handling";
import $ from "jquery";
export function handleCopyJob($: Function, shadowRoot: ShadowRoot): void {
  const $copyButton = $("#copy-btn-panel");

  CopyTabPanel.loadCopyTabData(shadowRoot);
}
``;
export class CopyTabPanel {
  // Static method to render the Copy Tab HTML
  static renderCopyTab(): string {
    return `
      <div class="tab-pane fade show active" id="copy-tab-pane" role="tabpanel" aria-labelledby="copy-tab" tabindex="0">
        <div id='copy-btn-panel' class="d-flex flex-column justify-content-center align-items-center gap-3 min-vh-25 w-100 ">
          <div 
            id="copy-status-message" 
            class="w-100 p-3 heading border rounded"
          >
            Click the button to copy the job description.
          </div>
          <button id="copy-job-description-btn" class="btn btn-primary heading w-100">
            Copy
          </button>
        </div>

        <div id='copy-job-details' >
        </div>
      </div>

    `;
  }

  static async loadCopyTabData(shadowRoot: ShadowRoot): Promise<void> {
    const configStore = ConfigStore.getInstance();
    const config = configStore.getConfig();

    if (!config) {
      console.warn("No configuration found for the current job portal.");
      return;
    }

    // Helper to safely get text content by selector
    function getText(selector: string): string {
      const ele = $(selector);
      console.log(ele, "check_ele");
      if (ele.length === 0) return "N/A";
      return (ele[0].textContent || "").trim() || "N/A";
    }

    // Extract data from page using selectors from config
    console.log(config.selectors.jobTitle.selector, "check_selectors");
    const companyName = getText(config.selectors.companyName.selector);
    const location = getText(config.selectors.location.selector);
    const title = getText(config.selectors.jobTitle.selector);
    const description = getText(config.selectors.description.selector);

    const html = `
    <div class="card mb-3 shadow-sm my-4">
      <h6 class="text-center mb-2 heading">Job Details</h6>
      <div class="card-body">
      <div class="row mb-2"><div class="col-4 fw-semibold">Job Title:</div><div class="col-8">${title}</div></div>
        <div class="row mb-2"><div class="col-4 fw-semibold">Company Name:</div><div class="col-8">${companyName}</div></div>
        <div class="row mb-2"><div class="col-4 fw-semibold">Location:</div><div class="col-8">${location}</div></div>
        <div class="row"><div class="col-4 fw-semibold">Description:</div><div class="col-8">${description}</div></div>
      </div>
    </div>
  `;

    const container = shadowRoot.getElementById("copy-job-details");
    if (container) {
      container.innerHTML = html;
    }
  }
}
