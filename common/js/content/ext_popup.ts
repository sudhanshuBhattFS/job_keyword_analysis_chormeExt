import $ from "jquery";
import { KeywordToolPanel } from "./tabs";
import { setupGlobalEventDelegation } from "./event-handler";
import { dragElement } from "../../utils/draggable";
var $JQ = $.noConflict();

export class customPopup {
    static loggedOutBody(): string {
        return `
      <div class="login-ui d-flex justify-content-center align-items-center" style="min-height: 250px;">
        <div class="card shadow rounded-4 px-4 pt-4 pb-3" style="width: 100%; max-width: 320px;">
          <div class="text-center mb-3">
            <div class="rounded-circle bg-primary text-white d-inline-flex justify-content-center align-items-center" style="width: 48px; height: 48px; font-size: 24px;">
              🔒
            </div>
            <h5 class="fw-semibold mt-2 mb-0">Welcome Back</h5>
            <p class="text-muted small">Sign in to continue</p>
          </div>
          <form>
            <div class="mb-3">
              <label for="email" class="form-label fw-medium">Email</label>
              <input
                type="email"
                class="form-control rounded-pill px-3"
                id="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label fw-medium">Password</label>
              <input
                type="password"
                class="form-control rounded-pill px-3"
                id="password"
                placeholder="••••••••"
                required
              />
            </div>
            <div class="d-grid mt-3">
              <button
                id="loginBtn_job_keyword"
                type="submit"
                class="btn btn-primary rounded-pill fw-semibold"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    }

    static outerElementBody(): string {
        return `
      <div class="top-right-popup" id="job-keyword-analysis-popup">
         <div id="popup-body" class="bg-color-light rounded-4 shadow-lg">
          {{{body}}}
         </div>
         <div id="notification-container" class="position-fixed top-0 end-0 p-3" style="z-index: 9999; max-width: 320px;">

        </div>

      </div>
    `;
    }
}

async function attachPopupUI(renderFn: (shadow: ShadowRoot) => string) {
    const containerId = "job-keyword-analysis";
    let container = document.getElementById(containerId);

    let shadow: ShadowRoot;

    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.zIndex = "99999";
        document.documentElement.appendChild(container);

        shadow = container.attachShadow({ mode: "open" });
    } else {
        shadow = container.shadowRoot!;
    }

    const bodyHtml = renderFn(shadow);
    const popupHtml = customPopup
        .outerElementBody()
        .replace("{{{body}}}", bodyHtml);
    await applyStyles(shadow);
    shadow.innerHTML = popupHtml;

    const dragTarget = shadow.getElementById("job-keyword-analysis-popup");
    if (dragTarget) dragElement(dragTarget);

    setupGlobalEventDelegation($JQ, shadow);
}

export async function attachLoginPopup() {
    await attachPopupUI(() => customPopup.loggedOutBody());
}

export async function attachMainPopup() {
    await attachPopupUI((shadow) => KeywordToolPanel.render(shadow));
}

export function removeExistingPopup() {
    const container = document.getElementById("job-keyword-analysis");
    if (container) container.remove();
}

async function applyStyles(shadow: ShadowRoot) {
    const bootstrapCss = await fetch(
        chrome.runtime.getURL("styles/bootstrap.min.css")
    ).then((res) => res.text());
    const customCss = await fetch(
        chrome.runtime.getURL("styles/content_style.css")
    ).then((res) => res.text());

    const styleSheet1 = new CSSStyleSheet();
    const styleSheet2 = new CSSStyleSheet();
    await styleSheet1.replace(bootstrapCss);
    await styleSheet2.replace(customCss);

    (shadow as any).adoptedStyleSheets = [styleSheet1, styleSheet2];
}
