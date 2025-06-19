import { MessageBridge } from "./messageBridge";
import { attachLoginPopup, removeExistingPopup } from "./ext_popup";
import { CopyTabPanel } from "./copy-tab-handler";

// Utility function for safe base64 encoding
function safeBtoa(str: string): string {
    try {
        const binary = encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            (_, p1) => String.fromCharCode(parseInt(p1, 16))
        );
        return btoa(binary).replace(/=/g, "");
    } catch {
        return crypto.randomUUID(); // fallback
    }
}

// Constants to avoid typos
const BADGE_IDS = {
    whitelist: "whitelist-badges",
    blacklist: "blacklist-badges",
};

const BADGE_CLASSES = {
    whitelist: "bg-success",
    blacklist: "bg-danger",
};

export class KeywordToolPanel {
    static initialize(shadowRoot: ShadowRoot): void {
        this.setupTabNavigation(shadowRoot);
        this.setupLogoutHandler(shadowRoot);
    }

    // ---------------- Render Methods ----------------

    static render(shadowRoot: ShadowRoot): string {
        return `
    <div id="keyword-tool-tabs-wrapper" class="card shadow rounded-4 border-0 bg-light">
        <div class="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
            <h5 class="mb-0 fw-semibold text-primary">Jobs Analyzer</h5>
            <button id="logoutBtn" class="btn btn-sm btn-outline-danger rounded-pill">Logout</button>
        </div>
        ${this.renderTabHeaders()}
        ${this.renderTabContents()}
    </div>`;
    }

    static renderTabHeaders(): string {
        return `
    <ul class="nav nav-tabs px-3 pt-3" id="keywordToolTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active rounded-top" id="copy-tab" data-bs-target="#copy-tab-pane" type="button" role="tab" aria-controls="copy-tab-pane" aria-selected="true">
                Process
            </button>
        </li>
        <li class="nav-item ms-auto" role="presentation">
            <button class="nav-link rounded-top" id="settings-tab" data-bs-target="#settings-tab-pane" type="button" role="tab" aria-controls="settings-tab-pane" aria-selected="false">
                Settings
            </button>
        </li>
    </ul>`;
    }

    static renderTabContents(): string {
        return `
    <div class="tab-content px-4 py-3 bg-white rounded-bottom" id="keywordToolTabsContent">
        ${CopyTabPanel.renderCopyTab()}
        ${this.renderSettingsTab()}
    </div>`;
    }

    static renderSettingsTab(): string {
        return `
    <div class="tab-pane fade" id="settings-tab-pane" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">
        <div class="card bg-light border-0 rounded-4 shadow-sm px-4 py-3">
            <div class="card-body px-0">
                <div class="mb-4">
                    <label class="form-label fw-medium">Whitelist Keywords</label>
                    <div class="input-group mb-2">
                        <input type="text" id="whitelist-input" class="form-control rounded-pill px-3" placeholder="eg: remote" />
                        <button id="add-whitelist" class="btn btn-success rounded-pill px-4">Add</button>
                    </div>
                    <div id="whitelist-badges" class="d-flex flex-wrap gap-2"></div>
                </div>

                <div class="mb-2">
                    <hr />
                </div>

                <div>
                    <label class="form-label fw-medium">Blacklist Keywords</label>
                    <div class="input-group mb-2">
                        <input type="text" id="blacklist-input" class="form-control rounded-pill px-3" placeholder="eg: part-time" />
                        <button id="add-blacklist" class="btn btn-danger rounded-pill px-4">Add</button>
                    </div>
                    <div id="blacklist-badges" class="d-flex flex-wrap gap-2"></div>
                </div>
            </div>
        </div>
    </div>`;
    }

    // ---------------- Settings Tab Logic ----------------

    static async initSettingsTab(shadowRoot: ShadowRoot): Promise<void> {
        let whitelist: string[] = [],
            blacklist: string[] = [];

        try {
            [whitelist, blacklist] = await Promise.all([
                MessageBridge.sendToServiceWorker(
                    { type: "getWhiteLabelValues" },
                    true
                ),
                MessageBridge.sendToServiceWorker(
                    { type: "getBlackLabelValues" },
                    true
                ),
            ]);
        } catch (err) {
            console.error("Keyword fetch failed", err);
        }

        this.renderKeywordBadges(
            shadowRoot,
            BADGE_IDS.whitelist,
            (whitelist || []).filter((kw) => kw.trim()),
            BADGE_CLASSES.whitelist
        );

        this.renderKeywordBadges(
            shadowRoot,
            BADGE_IDS.blacklist,
            (blacklist || []).filter((kw) => kw.trim()),
            BADGE_CLASSES.blacklist
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
        const seen = new Set<string>();

        keywords.forEach((kw: string) => {
            const cleanKw = kw.trim();
            if (!cleanKw || seen.has(cleanKw)) return;

            seen.add(cleanKw);
            const badge = this.createBadgeElement(cleanKw, badgeClass);
            fragment.appendChild(badge);
        });

        if (fragment.childNodes.length === 0) {
            const placeholder = document.createElement("small");
            placeholder.textContent = "No keywords added.";
            placeholder.className = "text-muted fst-italic";
            container.appendChild(placeholder);
        } else {
            container.appendChild(fragment);
        }
    }

    private static createBadgeElement(
        keyword: string,
        badgeClass: string
    ): HTMLElement {
        const span = document.createElement("span");
        span.className = `badge ${badgeClass} p-2 d-flex align-items-center`;
        span.id = `badge-${safeBtoa(keyword)}`;

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
                tabButtons.forEach((btn) => {
                    btn.classList.remove("active");
                    btn.setAttribute("aria-selected", "false");
                });

                tabPanes.forEach((pane) =>
                    pane.classList.remove("show", "active")
                );

                // Activate clicked
                button.classList.add("active");
                button.setAttribute("aria-selected", "true");

                const targetPane = shadowRoot.getElementById(targetId);
                targetPane?.classList.add("show", "active");

                // Save active tab for next load
                localStorage.setItem("activeTab", button.id);

                // Load tab-specific content
                if (button.id === "settings-tab") {
                    await this.initSettingsTab(shadowRoot);
                }
            });
        });

        // Restore last active tab
        const defaultTabId = localStorage.getItem("activeTab") ?? "copy-tab";
        const defaultBtn = shadowRoot.getElementById(
            defaultTabId
        ) as HTMLButtonElement;
        defaultBtn?.click();
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
