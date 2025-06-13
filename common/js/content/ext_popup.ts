import $ from "jquery";
import { KeywordToolPanel } from "./tabs";
import { setupGlobalEventDelegation } from "./event-handler";
import { dragElement } from "../../utils/draggable";
var $JQ = $.noConflict();

export class customPopup {
    static globalStyles(): string {
        return `
      <link rel="stylesheet" href="${chrome.runtime.getURL(
          "styles/bootstrap.min.css"
      )}" />
      <link rel="stylesheet" href="${chrome.runtime.getURL(
          "styles/content_style.css"
      )}" />
    `;
    }

    static loggedOutBody(): string {
        return `
      <div class="login-ui">
        <div class="card p-4 shadow-sm w-100" >
          <h6 class="text-center mb-2">Login</h6>
          <form>
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" class="form-control" id="email" placeholder="Enter email" required>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" placeholder="Password" required>
            </div>
            <button id="loginBtn_job_keyword" type="submit" class="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    `;
    }

    static outerElementBody(): string {
        return `
      {{{styles}}}
      <div class="top-right-popup" id="job-keyword-analysis-popup">
         <div id="popup-body" class="bg-color-light">
          {{{body}}}
         </div>
      </div>
    `;
    }
}

let shadowRootRef: ShadowRoot | null = null;

export async function attachPopup(isLoggedIn: boolean) {
    const containerId = "job-keyword-analysis";
    let container = document.getElementById(containerId);

    // First-time load: create and inject shell
    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.zIndex = "99999";
        document.documentElement.appendChild(container);

        const shadow = container.attachShadow({ mode: "open" });
        shadowRootRef = shadow;

        let popupHtml = customPopup.outerElementBody();
        popupHtml = popupHtml.replace(
            "{{{styles}}}",
            customPopup.globalStyles()
        );
        popupHtml = popupHtml.replace(
            "{{{body}}}",
            isLoggedIn
                ? KeywordToolPanel.render(shadowRootRef)
                : customPopup.loggedOutBody()
        );

        shadow.innerHTML = popupHtml;

        // ⛳ Drag setup using #job-keyword-analysis-popup inside shadow DOM
        const dragTarget = shadow.getElementById("job-keyword-analysis-popup");
        if (dragTarget) dragElement(dragTarget);

        setupGlobalEventDelegation($JQ, shadow);
    } else if (shadowRootRef) {
        // Already initialized: just replace inner body
        const bodyContainer = shadowRootRef.getElementById("popup-body");
        if (bodyContainer) {
            bodyContainer.innerHTML = isLoggedIn
                ? KeywordToolPanel.render(shadowRootRef)
                : customPopup.loggedOutBody();
        }

        // ⛳ Drag setup again
        const dragTarget = shadowRootRef.getElementById(
            "job-keyword-analysis-popup"
        );
        if (dragTarget) dragElement(dragTarget);

        setupGlobalEventDelegation($JQ, shadowRootRef);
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
        .replace("{{{styles}}}", customPopup.globalStyles())
        .replace("{{{body}}}", bodyHtml);

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