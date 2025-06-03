import { MessageBridge } from "./messageBridge";
import type { tabData } from "./type.ts";
import { customPopup } from "./ext_popup.ts";
import { CopyTabPanel } from "./copy-tab-handler.ts";

export class KeywordToolPanel {
  // Render full panel HTML (initial)
  static render(shadowRoot: ShadowRoot): string {
    return `
      <div id="keyword-tool-tabs-wrapper" class="card bg-custom-light shadow-sm">
        ${this.renderTabHeaders()}
        ${this.renderTabContents()}
      </div>
    `;
  }

  // Tab headers
  static renderTabHeaders(): string {
    return `
      <ul class="nav nav-tabs p-2" id="keywordToolTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="copy-tab" data-bs-target="#copy-tab-pane" type="button" role="tab" aria-controls="copy-tab-pane" aria-selected="true">
            Copy
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="analyse-tab" data-bs-target="#analyse-tab-pane" type="button" role="tab" aria-controls="analyse-tab-pane" aria-selected="false">
            Analyse
          </button>
        </li>
        <li class="nav-item ms-auto" role="presentation">
          <button class="nav-link" id="settings-tab" data-bs-target="#settings-tab-pane" type="button" role="tab" aria-controls="settings-tab-pane" aria-selected="false">
            <i class="bi bi-gear"></i> Settings
          </button>
        </li>
      </ul>
    `;
  }

  // Tab contents wrapper (Keyword Manager only inside Settings tab)
  static renderTabContents(): string {
    return `
      <div class="tab-content p-3 bg-custom-light" id="keywordToolTabsContent" >
        ${CopyTabPanel.renderCopyTab()}
        ${this.renderAnalyseTab()}
        ${this.renderSettingsTab()}
      </div>
    `;
  }

  static renderAnalyseTab(): string {
    return `
    <div class="tab-pane fade" id="analyse-tab-pane" role="tabpanel" aria-labelledby="analyse-tab" tabindex="0">
      <div class="d-flex flex-column justify-content-center align-items-center gap-3 min-vh-25 w-100 ">
        <div 
          id="analyse-status-message" 
          class="w-100 p-3 heading  border rounded"
        >
          Click the button to analyse keywords from the job description.
        </div>
        <button id="analyse-job-description-btn" class="btn btn-secondary heading w-100">
          Analyse
        </button>
      </div>
    </div>
  `;
  }

  // Analyse tab placeholder
  static renderAnalyseKeywords(): string {
    return `
    <div class="tab-pane fade " id="analyse-tab-pane" role="tabpanel" aria-labelledby="analyse-tab" tabindex="0">
      <div id="analysis-whitelist-section">
        <h6 class="heading text-center w-full m-0">Whitelist Keywords</h6>
        <div class="badge-container card-body bg-white ">
          <span id="analysis-whitelist-badge-1" class="badge bg-accent p-2 rounded-pill">Team Player</span>
          <span id="analysis-whitelist-badge-2" class="badge bg-accent p-2 rounded-pill">Agile</span>
          <span id="analysis-whitelist-badge-3" class="badge bg-accent p-2 rounded-pill">Problem Solver</span>
        </div>
      </div>

      <hr class="my-2" />

      <div id="analysis-blacklist-section" style="margin-top: 1rem;">
        <h6 class="heading text-center w-full m-0">Blacklist Keywords</h6>
        <div class="badge-container  card-body bg-white">
          <span id="analysis-blacklist-badge-1" class="badge bg-danger p-2 rounded-pill">Micromanage</span>
          <span id="analysis-blacklist-badge-2" class="badge bg-danger p-2 rounded-pill">Overtime</span>
          <span id="analysis-blacklist-badge-3" class="badge bg-danger p-2 rounded-pill">Fast-paced</span>
        </div>
      </div>
    </div>
  `;
  }

  // Settings tab now includes the Keyword Manager UI
  static renderSettingsTab(): string {
    return `
      <div class="tab-pane fade" id="settings-tab-pane" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">
        <div class="bg-light card bg-white">
          <h6 class="text-center mb-2 heading card-title">Keyword Manager</h6>
          <div class="card-body py-4 px-3 shadow-sm w-100" >
            <div class="">
              <h6>Whitelist Keywords</h6>
              <div class="input-group mb-2">
                <input type="text" id="whitelist-input" class="form-control" placeholder="Add whitelist keyword" />
                <button id="add-whitelist" class="btn btn-success">Add</button>
              </div>
              <div id="whitelist-badges" class="d-flex flex-wrap gap-2"></div>
            </div>

            <hr />

            <div class="">
              <h6>Blacklist Keywords</h6>
              <div class="input-group mb-2">
                <input type="text" id="blacklist-input" class="form-control" placeholder="Add blacklist keyword" />
                <button id="add-blacklist" class="btn btn-danger">Add</button>
              </div>
              <div id="blacklist-badges" class="d-flex flex-wrap gap-2"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Initialize tab switching & initial data load
  static initialize(shadowRoot: ShadowRoot): void {
    const tabButtons =
      shadowRoot.querySelectorAll<HTMLButtonElement>(".nav-link");
    const tabPanes = shadowRoot.querySelectorAll<HTMLElement>(".tab-pane");

    // Load Copy tab data once on initialization (because it's active by default)
    // this.loadCopyTabData(shadowRoot);

    tabButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const targetId = button.getAttribute("data-bs-target")?.substring(1);
        if (!targetId) return;

        // Deactivate all tabs and panes
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabPanes.forEach((pane) => pane.classList.remove("show", "active"));

        // Activate clicked tab and corresponding pane
        button.classList.add("active");
        const targetPane = shadowRoot.getElementById(targetId);
        targetPane?.classList.add("show", "active");

        // Handle tab-specific logic
        switch (button.id) {
          case "copy-tab":
            // await this.loadCopyTabData(shadowRoot);
            break;
          case "analyse-tab":
            // Future: Load or update analysis UI here
            break;
          case "settings-tab":
            // Keyword Manager is static in the settings tab content
            break;
        }
      });
    });
  }

  // Load data for Copy tab and update UI
}
