export function getExtensionShadowRoot(): ShadowRoot | null {
    const host = document.querySelector("#job-keyword-analysis");
    return host instanceof HTMLElement ? host.shadowRoot : null;
}
