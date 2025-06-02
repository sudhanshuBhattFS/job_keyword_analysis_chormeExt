import $ from "jquery";
import { KeywordToolPanel } from "./tabs";
import { setupGlobalEventDelegation } from "./event-handler";
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
      <div class="">
        <div class="card p-4 shadow-sm w-100" >
          <h4 class="text-center mb-2">Login</h3>
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
         <div id="popup-body">
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
    popupHtml = popupHtml.replace("{{{styles}}}", customPopup.globalStyles());
    popupHtml = popupHtml.replace(
      "{{{body}}}",
      isLoggedIn
        ? KeywordToolPanel.render(shadowRootRef)
        : customPopup.loggedOutBody()
    );

    shadow.innerHTML = popupHtml;
    setupGlobalEventDelegation($JQ, shadow);
  } else if (shadowRootRef) {
    // Already initialized: just replace inner body
    const bodyContainer = shadowRootRef.getElementById("popup-body");
    if (bodyContainer) {
      bodyContainer.innerHTML = isLoggedIn
        ? KeywordToolPanel.render(shadowRootRef)
        : customPopup.loggedOutBody();
    }
    setupGlobalEventDelegation($JQ, shadowRootRef);
  }
}
