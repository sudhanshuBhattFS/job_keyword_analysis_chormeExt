import { MessageBridge } from "./messageBridge";
import type { tabData } from "./type.ts";
import { customPopup } from "./ext_popup.ts";

export class KeywordToolPanel {
  // Render full panel HTML (initial)
  static render(shadowRoot: ShadowRoot): string {
    return `
      <div id="keyword-tool-tabs-wrapper" class="card  shadow-sm">
        ${this.renderTabHeaders()}
        ${this.renderTabContents()}
      </div>
    `;
  }

  // Tab headers
  static renderTabHeaders(): string {
    return `
      <ul class="nav nav-tabs" id="keywordToolTabs" role="tablist">
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
      <div class="tab-content p-3" id="keywordToolTabsContent" style="min-height: 150px;">
        ${this.renderCopyTab()}
        ${this.renderAnalyseTab()}
        ${this.renderSettingsTab()}
      </div>
    `;
  }

  // Copy tab (initially shows spinner, actual data loaded async)
  static renderCopyTab(): string {
    return `
      <div class="tab-pane fade show active" id="copy-tab-pane" role="tabpanel" aria-labelledby="copy-tab" tabindex="0">
        <div class="d-flex justify-content-center align-items-center" style="min-height: 150px;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    `;
  }

  // Analyse tab placeholder
  static renderAnalyseTab(): string {
    return `
      <div class="tab-pane fade" id="analyse-tab-pane" role="tabpanel" aria-labelledby="analyse-tab" tabindex="0">
        <p>Analysis result will appear here...</p>
      </div>
    `;
  }

  // Settings tab now includes the Keyword Manager UI
  static renderSettingsTab(): string {
    return `
      <div class="tab-pane fade" id="settings-tab-pane" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">
        <div class="bg-light p-4">
          <h4 class="text-center mb-4">Keyword Manager</h4>
          <div class="card p-4 shadow-sm w-100" >
            <div class="mb-4">
              <h5>Whitelist Keywords</h5>
              <div class="input-group mb-2">
                <input type="text" id="whitelist-input" class="form-control" placeholder="Add whitelist keyword" />
                <button id="add-whitelist" class="btn btn-success">Add</button>
              </div>
              <div id="whitelist-badges" class="d-flex flex-wrap gap-2"></div>
            </div>

            <hr />

            <div class="mb-2">
              <h5>Blacklist Keywords</h5>
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
    this.loadCopyTabData(shadowRoot);

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
            await this.loadCopyTabData(shadowRoot);
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
  static async loadCopyTabData(shadowRoot: ShadowRoot): Promise<void> {
    let tabData: tabData | null = null;

    try {
      const response = await MessageBridge.sendToServiceWorker(
        { type: "getTabData" },
        true
      );
      tabData = response as tabData;
    } catch (error) {
      console.error("Failed to load tab data", error);
    }

    const { name, location, title, description } = tabData || {
      name: "N/A",
      location: "N/A",
      title: "N/A",
      description: "N/A",
    };

    const html = `
      <div class="card mb-3 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">User Details</h5>
          <div class="row mb-2"><div class="col-4 fw-semibold">Name:</div><div class="col-8">${name}</div></div>
          <div class="row mb-2"><div class="col-4 fw-semibold">Location:</div><div class="col-8">${location}</div></div>
          <div class="row mb-2"><div class="col-4 fw-semibold">Title:</div><div class="col-8">${title}</div></div>
          <div class="row"><div class="col-4 fw-semibold">Description:</div><div class="col-8">${description}</div></div>
        </div>
      </div>
    `;

    const container = shadowRoot.getElementById("copy-tab-pane");
    if (container) {
      container.innerHTML = html;
    }
  }
}
