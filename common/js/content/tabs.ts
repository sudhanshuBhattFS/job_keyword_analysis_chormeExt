import { MessageBridge } from "./messageBridge";
import { attachLoginPopup, removeExistingPopup } from "./ext_popup";
import { CopyTabPanel } from "./copy-tab-handler";

export class KeywordToolPanel {
    // Public entry point to setup panel
    static initialize(shadowRoot: ShadowRoot): void {
        this.setupTabNavigation(shadowRoot);
        this.setupLogoutHandler(shadowRoot);
    }

    // ---------------- Render Methods ----------------

    static render(shadowRoot: ShadowRoot): string {
        return `
        <div id="keyword-tool-tabs-wrapper" class="card bg-custom-light shadow-sm">
            <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                <div class="fw-bold">Jobs Analyzer</div>
                <button id="logoutBtn" class="btn btn-sm btn-outline-danger">Logout</button>
            </div>
            ${this.renderTabHeaders()}
            ${this.renderTabContents()}
        </div>`;
    }

    static renderTabHeaders(): string {
        return `
        <ul class="nav nav-tabs p-2" id="keywordToolTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="copy-tab" data-bs-target="#copy-tab-pane" type="button" role="tab" aria-controls="copy-tab-pane" aria-selected="true">
                    Process
                </button>
            </li>
            <li class="nav-item ms-auto" role="presentation">
                <button class="nav-link" id="settings-tab" data-bs-target="#settings-tab-pane" type="button" role="tab" aria-controls="settings-tab-pane" aria-selected="false">
                    <i class="bi bi-gear"></i> Settings
                </button>
            </li>
        </ul>`;
    }

    static renderTabContents(): string {
        return `
        <div class="tab-content p-3 bg-custom-light" id="keywordToolTabsContent">
            ${CopyTabPanel.renderCopyTab()}
            ${this.renderSettingsTab()}
        </div>`;
    }

    static renderSettingsTab(): string {
        return `
        <div class="tab-pane fade" id="settings-tab-pane" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">
            <div class="bg-light card bg-white">
                <h6 class="text-center mb-2 heading card-title">Keyword Manager</h6>
                <div class="card-body py-4 px-3 shadow-sm w-100">
                    <div>
                        <h6>Whitelist Keywords</h6>
                        <div class="input-group mb-2">
                            <input type="text" id="whitelist-input" class="form-control" placeholder="Add whitelist keyword" />
                            <button id="add-whitelist" class="btn btn-success">Add</button>
                        </div>
                        <div id="whitelist-badges" class="d-flex flex-wrap gap-2"></div>
                    </div>

                    <hr />

                    <div>
                        <h6>Blacklist Keywords</h6>
                        <div class="input-group mb-2">
                            <input type="text" id="blacklist-input" class="form-control" placeholder="Add blacklist keyword" />
                            <button id="add-blacklist" class="btn btn-danger">Add</button>
                        </div>
                        <div id="blacklist-badges" class="d-flex flex-wrap gap-2"></div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ---------------- Settings Tab Logic ----------------

    static async initSettingsTab(shadowRoot: ShadowRoot): Promise<void> {
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

        this.renderKeywordBadges(
            shadowRoot,
            "whitelist-badges",
            whitelist || [],
            "bg-success"
        );
        this.renderKeywordBadges(
            shadowRoot,
            "blacklist-badges",
            blacklist || [],
            "bg-danger"
        );
    }

    private static renderKeywordBadges(
        shadowRoot: ShadowRoot,
        containerId: string,
        keywords: string[],
        badgeClass: string
    ): void {
        const container = shadowRoot.getElementById(containerId);
        if (!container) return;

        container.innerHTML = "";
        const fragment = document.createDocumentFragment();

        keywords.forEach((kw: string) => {
            const badge = this.createBadgeElement(kw, badgeClass);
            fragment.appendChild(badge);
        });

        container.appendChild(fragment);
    }

    private static createBadgeElement(
        keyword: string,
        badgeClass: string
    ): HTMLElement {
        const span = document.createElement("span");
        span.className = `badge ${badgeClass} p-2 d-flex align-items-center`;
        span.id = `badge-${btoa(keyword).replace(/=/g, "")}`;

        const textNode = document.createTextNode(keyword);
        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "btn-close btn-close-white btn-sm ms-2";
        closeBtn.setAttribute("aria-label", "Remove");

        closeBtn.addEventListener("click", () => span.remove());

        span.appendChild(textNode);
        span.appendChild(closeBtn);
        return span;
    }

    // ---------------- Tab & Logout Handlers ----------------

    private static setupTabNavigation(shadowRoot: ShadowRoot): void {
        const tabButtons =
            shadowRoot.querySelectorAll<HTMLButtonElement>(".nav-link");
        const tabPanes = shadowRoot.querySelectorAll<HTMLElement>(".tab-pane");

        tabButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                const targetId = button
                    .getAttribute("data-bs-target")
                    ?.substring(1);
                if (!targetId) return;

                // Deactivate all
                tabButtons.forEach((btn) => btn.classList.remove("active"));
                tabPanes.forEach((pane) =>
                    pane.classList.remove("show", "active")
                );

                // Activate clicked
                button.classList.add("active");
                const targetPane = shadowRoot.getElementById(targetId);
                targetPane?.classList.add("show", "active");

                // Load data on demand
                if (button.id === "settings-tab") {
                    await this.initSettingsTab(shadowRoot);
                }
            });
        });
    }

    private static setupLogoutHandler(shadowRoot: ShadowRoot): void {
        const logoutBtn = shadowRoot.getElementById("logoutBtn");
        if (!logoutBtn) return;

        logoutBtn.addEventListener("click", async () => {
            logoutBtn.textContent = "Logging out...";
            logoutBtn.setAttribute("disabled", "true");

            try {
                const isLoggedOut = await MessageBridge.sendToServiceWorker(
                    { type: "logout" },
                    true
                );
                if (isLoggedOut) {
                    removeExistingPopup();
                    attachLoginPopup();
                }
            } finally {
                logoutBtn.textContent = "Logout";
                logoutBtn.removeAttribute("disabled");
            }
        });
    }
}
